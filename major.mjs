import { readFileSync, existsSync, writeFileSync } from "node:fs";

import { csvParse, autoType, csvFormat } from "d3-dsv";
import { sum } from "d3-array"
import { mapLimit } from "async";

const main = async () => {
  const NUM_OPERATIONS = 25;

  console.log("loading facilities...");
  const facilities = csvParse(readFileSync("./data.csv").toString(), autoType);

  console.log("filtering facilities with reports...");
  const facilitiesWithReports = facilities.filter(({ FACILITY_ID }) => existsSync(`./data/${FACILITY_ID}.csv`));

  console.log("counting yellow pixels...");
  const facilitiesWithYellowPixelCount = await mapLimit(
    facilitiesWithReports,
    NUM_OPERATIONS,
    async ({ FACILITY_ID }) => {
      const csv = csvParse(readFileSync(`./data/${FACILITY_ID}.csv`).toString(), autoType);
      const yellowPixels = sum(
        csv.filter(({ color }) => {
          const [r, g, b] = color.split("-");
          return +r > 200 && +g > 200 && +b < 15;
        }), d => d.count
      );
      console.log(FACILITY_ID);
      return { FACILITY_ID, yellowPixels }
    }
  );

  console.log("filtering facilities with major violations...");
  const facilitiesWithMajorViolations = facilitiesWithYellowPixelCount.filter(({ yellowPixels }) => yellowPixels > 40_000);

  console.log("writing to disk...");
  writeFileSync("./major.csv", csvFormat(facilitiesWithMajorViolations))
}

main();