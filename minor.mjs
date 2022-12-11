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

  console.log("counting gray pixels...");
  const facilitiesWithGrayPixelCount = await mapLimit(
    facilitiesWithReports,
    NUM_OPERATIONS,
    async ({ FACILITY_ID }) => {
      const csv = csvParse(readFileSync(`./data/${FACILITY_ID}.csv`).toString(), autoType);
      const grayPixels = sum(
        csv.filter(({ color }) => {
          const [r, g, b] = color.split("-").map(d => +d);
          return (r >= 232 && r <= 238) && (g >= 232 && r <= 238) && (b >= 232 && b <= 238);
        }), d => d.count
      );
      console.log(`./pdf/${FACILITY_ID}.pdf`, grayPixels);
      return { FACILITY_ID, grayPixels }
    }
  );

  console.log("filtering facilities with minor violations...");
  const facilitiesWithMinorViolations = facilitiesWithGrayPixelCount.filter(({ grayPixels }) => (grayPixels - 50000) / 50000 > 0.5);

  console.log("writing to disk...");
  writeFileSync("./minor.csv", csvFormat(facilitiesWithMinorViolations))
}

main();