import { database } from 'lexis/database'
import { demacron, fallbackProxy } from 'utils'
import { data } from 'lexis/data'
import { MinimusSeriesStatus, parseSeriemStatus, serializeInflectedFormDesignation } from 'serialization'
import { Lexis } from 'lexis'

export type InflectionDict = {
    [forma in string]: MinimusSeriesStatus[]
}

function makeInflectionDict(): InflectionDict {
    return fallbackProxy<InflectionDict>({}, () => [])
}

function extractInflectionDictFromLexis(
    lexis: Lexis,
    clavisWithMacron = false,
): InflectionDict {
    const inflectionDict = makeInflectionDict()
    const inflectiones = Object.entries(lexis.inflectiones)
    for (const inflectio of inflectiones) {
        let [seriesStatus, formae] = inflectio
        if (formae) {
            for (const forma of formae) {
                const clavis = clavisWithMacron ? forma : demacron(forma)
                inflectionDict[clavis] = inflectionDict[clavis].concat(
                    serializeInflectedFormDesignation(
                        {
                            lemma: lexis.lexicographia.lemma,
                            pars: lexis.pars,
                            forma,
                            status: parseSeriemStatus(seriesStatus),
                        }
                    )
                )
            }
        }
    }
    return inflectionDict
}

function mergeIntoDict(baseDict: InflectionDict, newDict: InflectionDict) {
    for (const forma in newDict) {
        baseDict[forma] = baseDict[forma].concat(newDict[forma])
    }
}

async function makeDict(clavisWithMacron: boolean) {
    const inflectionDict = makeInflectionDict()
    const lexesIds = await database.getLexesInternalIds()
    console.info(lexesIds)
    process.exit()
    // Iterative style for performance reasons
    let index = 0
    for (const id of lexesIds) {
        const lexis = await database.getLexisByInternalId(id)
        if (!lexis) {
            console.info('Cannot find lexis of id', id)
            continue
        }
        console.info(`${index++}/${lexesIds.length}`)
        const lexisDict = extractInflectionDictFromLexis(lexis, clavisWithMacron)
        mergeIntoDict(inflectionDict, lexisDict)
    }
    await data.saveInflectionDict(inflectionDict)
    process.exit()
}

async function main() {
    await database.connect()
    const lemma = process.argv[2]
    if (lemma) {
        const lexes = await database.getLexesByLemma(lemma)
        if (lexes) {
            console.info(lexes.map(lexis => extractInflectionDictFromLexis(lexis)))
        }
        else {
            console.info('cannot find lexis with id', lemma)
        }
        process.exit()
    }
    else {
        makeDict(false)
    }
}

if (require.main === module) {
    main()
}
