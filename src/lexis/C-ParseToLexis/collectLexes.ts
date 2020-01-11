import { database, SuccessfulParseResultInput } from 'lexis/database'
import { spawnConcurrent } from 'nodeUtils'
import { demacron } from 'utils'
import { getParseByEntry } from 'lexis/B-PageToParse/parsePage'
import {
    Gradus,
    Inflectiones,
    Lexis,
    NomenAdiectivum,
    Participium,
    StatusAdiectivi
} from 'lexis'
import { LANG } from 'config'
import { LemmataParticipii } from '../B-PageToParse/htmlParsers/tabulae/wiktionaryVerbTable'
import { makePronounLexis } from './makePronounLexes'
import { parseSeriemStatus, serializeStatum } from 'serialization'
import { numeri } from "../data/numerus";

interface CompilerState {
    parseIds: string[]
}

async function combineParticipium(participii: LemmataParticipii, lemmaVerbi: string): Promise<Participium> {
    const lemmataParticipiorum = Object.values(participii).map(demacron)
    const parses = await Promise.all(lemmataParticipiorum.map(lemma => getParseByEntry(lemma)))
    const participium: Participium = {
        pars: 'participium',
        inflectiones: { },
        lexicographia: {
            lemma: '',
            radices: [],
            etymologia: [],
            pronunciatio: [],
            references: [],
            lemmataAlterae: [],
            lemmaVerbi,
        },
        interpretationes: {
            [LANG]: []
        }
    }
    for (const parse of parses) {
        if (parse && parse.success) {
            const firstLexis = parse.lexes[0]
            participium.inflectiones = {
                ...participium.inflectiones,
                ...firstLexis.inflectiones,
            }
            participium.lexicographia = {
                ...participium.lexicographia,
                radices: [
                    ...participium.lexicographia.radices,
                    firstLexis.lexicographia.lemma,
                ]
            }
            participium.lexicographia.lemma = participium.lexicographia.lemma || firstLexis.lexicographia.lemma
        }
    }
    return participium
}

function forceGradus(inflectiones: Inflectiones<StatusAdiectivi>, gradus: Gradus): Inflectiones<StatusAdiectivi> {
    const result: Inflectiones<StatusAdiectivi> = {}
    for (const series in inflectiones) {
        const status = parseSeriemStatus(series)
        status.gradus = gradus
        const seriesNovum = serializeStatum('nomen-adiectivum', status)
        result[seriesNovum] = inflectiones[series]
    }
    return result
}

async function enhanceWithGrades(lexis: NomenAdiectivum): Promise<NomenAdiectivum> {
    const result: NomenAdiectivum = {...lexis}
    const {
        comparativus: lemmaComparativa,
        superlativus: lemmaSuperlativa,
    } = lexis.lexicographia.lemmataAlii
    if (lemmaComparativa && lemmaSuperlativa) {
        const comparativusParse = await getParseByEntry(demacron(lemmaComparativa))
        const superlativusParse = await getParseByEntry(demacron(lemmaSuperlativa))
        if (comparativusParse && superlativusParse && comparativusParse.success && superlativusParse.success) {
            const comparativus = comparativusParse.lexes[0] as NomenAdiectivum
            const superlativus = superlativusParse.lexes[0] as NomenAdiectivum
            result.inflectiones = {
                ...lexis.inflectiones,
                ...forceGradus(comparativus.inflectiones, 'comparativus'),
                ...forceGradus(superlativus.inflectiones, 'superlativus'),
            }
            return result
        }
    }
    else {
        console.warn(`${lexis.lexicographia.lemma} is not recorded with comparativus or superlativus`)
    }
    return lexis
}

async function collectForOneLexis(lexis: Lexis) {
    switch (lexis.pars) {
        case 'verbum': {
            await database.upsertLexis(lexis)
            const participii = lexis.lemmataAlii.participii
            const participium = await combineParticipium(participii, lexis.lexicographia.lemma)
            await database.upsertLexis(participium)
            break
        }
        case 'nomen-adiectivum': {
            if (Object.keys(lexis.inflectiones).join('').includes('positivus')) {
                const enhancedLexis = await enhanceWithGrades(lexis)
                await database.upsertLexis(enhancedLexis)
            }
            else {
                console.warn(`Adjective ${lexis.lexicographia.lemma} doesn't have a postive form. Skipped.`)
            }
            break
        }
        case 'participium': {
            break
        }
        case 'pronomen': {
            break
        }
        default: {
            await database.upsertLexis(lexis)
        }
    }
}

async function collectManualLexes() {
    const pronomina = await makePronounLexis()
    for (const pronomen of pronomina) {
        await database.upsertLexis(pronomen)
    }
    for (const numerus of numeri) {
        await database.upsertLexis(numerus)
    }
}

export async function collectLexes(parseIds: string[]) {
    const CONCURRENT_WORKERS = 32
    const state: CompilerState = {
        parseIds
    }
    
    async function collectNext(): Promise<void> {
        if (state.parseIds.length > 0) {
            try {
                const nextId = state.parseIds[0]
                state.parseIds = state.parseIds.slice(1)
                const parse = await database.getParseById(nextId)
                if (parse && parse.success) {
                    const {lexes} = parse
                    for (const lexis of lexes) {
                        console.info(lexis.lexicographia.lemma, 'remaining: ', state.parseIds.length)
                        try {
                            await collectForOneLexis(lexis)
                        }
                        catch (error) {
                            console.error(error.message)
                        }
                    }
                }
            }
            catch (error) {
                console.error(error.message)
            }
            return collectNext()
        }
    }
    
    await spawnConcurrent(collectNext, CONCURRENT_WORKERS)
    await collectManualLexes()
}

async function main() {
    await database.connect()
    const target = process.argv[2]
    if (target) {
        if (target === "manual") {
            await collectManualLexes()
        }
        else {
            const parseIds = [target]
            await collectLexes(parseIds)
        }
    }
    else {
        const parseIds = await database.getSuccessfulParseIds()
        await collectLexes(parseIds)
    }
    process.exit()
}

if (require.main === module) {
    main()
}
