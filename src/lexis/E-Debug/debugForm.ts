import { data } from "../data";
import { database } from "../database";
import { analyseToken } from "../../analysis/analyse";

async function main() {
    await database.connect()
    const form = process.argv[2]
    console.info("Debugging form", form)

    const pages = await database.findPagesByEntry(form)
    if (pages) {
        console.info(`[PAGE] OK: Has ${pages.length} page records`)
    }
    else {
        console.info(`[PAGE] ERROR: No page record`)
    }

    const parse = await database.getParseByEntry(form)
    if (parse) {
        console.info("[PARSE] OK: Has parse information")
    }
    else {
        console.info("[PAGE] ERROR: No parse information")
    }

    const inflectionDict = await data.getInflectionDict()
    const inflections = inflectionDict[form]
    if (inflections) {
        console.info("[INFLECTION] OK: Has inflections information:", inflections)
    }
    else {
        console.info("[INFLECTOR] ERROR: Does not have inflections information.")
    }

    const frequencyTable = await data.getFrequencyTable()

    const analysis = analyseToken(form, {frequencyTable, inflectionDict})
    console.info("Analysis", analysis)

    process.exit()
}

if (require.main === module) {
    main()
}
