import { data } from "../data";
import { database } from "../database";
import { analyseToken } from "../../analysis/analyse";
import { parsePage } from "../B-PageToParse/parsePage";
import { collectLexes } from "../C-ParseToLexis/collectLexes";

async function main() {
    await database.connect()
    const form = process.argv[2]
    console.info("Debugging form", form)

    const pages = await database.findPagesByEntry(form)
    if (pages.length > 0) {
        console.info(`[PAGE] OK: Has ${pages.length} page records`)
    }
    else {
        console.info(`[PAGE] ERROR: No page record`)
    }

    const parse = await database.getParseByEntry(form)
    if (parse) {
        console.info("[PARSE] OK: Has parse information")
        if (parse.success) {
            console.info("[PARSE] OK: Parse was successful")
            console.info(JSON.stringify(parse, null, 4))
        }
        else {
            console.info("[PARSE] ERROR: Parse failed")
            if (pages.length > 0) {
                console.info("[PARSE] Trying to parse...")
                const parse = await parsePage(pages[0])
                console.info(parse)
                if (parse.success) {
                    console.info("[PARSE] Parse successful. Collecting new parse...")
                    await collectLexes([parse.id])
                }
            }
        }
    }
    else {
        console.info("[PAGE] ERROR: No parse information")
    }

    const lexis = await database.getLexesByLemma(form)
    if (lexis.length) {
        console.info(`[LEXIS] OK: Found ${lexis.length} lexis`, lexis)
    }
    else {
        console.error(`[LEXIS] ERROR: No lexis`)
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
