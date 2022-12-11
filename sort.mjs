import { readFileSync, existsSync, writeFileSync } from "node:fs";

import { csvParse, autoType, csvFormat } from "d3-dsv";
import { descending } from "d3-array";

const main = () => {
  csvParse(readFileSync("./data.csv").toString(), autoType).forEach(({ FACILITY_ID }) => {
    const csv = `./data/${FACILITY_ID}.csv`;
    if (existsSync(csv)) {
      writeFileSync(
        csv,
        csvFormat(
          csvParse(readFileSync(csv).toString(), autoType).sort((a, b) => descending(a.count, b.count))
        )
      )
    }
  })
}

main();