import { database } from 'lexis/database'
import { demacron, fallbackProxy } from 'utils'
import { data } from 'lexis/data'
import { InflectedFormDesignation } from 'analysis/Model'

export type InflectionDict = {
    [forma in string]: InflectedFormDesignation[]
}

async function makeDict(clavisWithMacron: boolean) {
    await database.connect()
    const inflectionDict = fallbackProxy<InflectionDict>({}, () => [])
    const lexesIds = await database.getLexesInternalIds()
    // Iterative style for performance reasons
    let index = 0
    for (const id of lexesIds) {
        const lexis = await database.getLexisByInternalId(id)
        if (!lexis) continue
        const inflectiones = Object.entries(lexis.inflectiones)
        console.info(`${index++}/${lexesIds.length}`)
        for (const inflectio of inflectiones) {
            let [seriesStatus, formae] = inflectio
            if (formae) {
                for (const forma of formae) {
                    const clavis = clavisWithMacron ? forma : demacron(forma)
                    inflectionDict[clavis] = inflectionDict[clavis].concat(
                        {
                            lemma: lexis.lexicographia.lemma,
                            pars: lexis.pars,
                            forma,
                            status: seriesStatus
                        }
                    )
                }
            }
        }
    }
    await data.saveInflectionDict(inflectionDict)
    process.exit()
}

if (require.main === module) {
    makeDict(false)
}
