import { database, SuccessfulParseResultInput } from 'lexis/database'
import { spawnConcurrent } from 'nodeUtils'
import { demacron } from 'utils'
import { getParseByEntry } from 'lexis/B-PageToParse/parsePage'
import {
    Gradus,
    Inflectiones,
    Lexis,
    NomenAdiectivum,
    parseSeriemStatus,
    Participium,
    serializeStatum,
    StatusAdiectivi
} from 'lexis'
import { LANG } from 'config'
import { LemmataParticipii } from '../B-PageToParse/htmlParsers/tabulae/wiktionaryVerbTable'
import { makePronounLexis } from './makePronounLexes'

interface CompilerState {
    parseIds: string[]
}

async function combineParticipium(participii: LemmataParticipii, lemmaVerbi: string): Promise<Participium | null> {
    const parses = await Promise.all(Object.values(participii).map(demacron).map(lemma => getParseByEntry(lemma)))
    if (parses.every(Boolean) && parses.every(parse => parse.success)) {
        const successfulParses = parses as SuccessfulParseResultInput[]
        const praesensActiva = successfulParses[0].lexes[0]
        const futurusActiva = successfulParses[1].lexes[0]
        const praeteritusPassiva = successfulParses[2].lexes[0]
        const futurusPassiva = successfulParses[3].lexes[0]
        const participium: Participium = {
            pars: 'participium',
            inflectiones: {
                ...praesensActiva.inflectiones,
                ...futurusActiva.inflectiones,
                ...praeteritusPassiva.inflectiones,
                ...futurusPassiva.inflectiones,
            },
            lexicographia: {
                lemma: praesensActiva.lexicographia.lemma,
                radices: [
                    praesensActiva.lexicographia.lemma,
                    futurusActiva.lexicographia.lemma,
                    praeteritusPassiva.lexicographia.lemma,
                    futurusPassiva.lexicographia.lemma,
                ],
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
        return participium
    }
    else {
        return null
    }
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
            if (participium) {
                await database.upsertLexis(participium)
            }
            else {
                console.warn(`Cannot compile participium: ${lexis.lexicographia.lemma}`)
            }
            break
        }
        case 'nomen-adiectivum': {
            if (Object.keys(lexis.inflectiones).join('').includes('positivus')) {
                const enhancedLexis = await enhanceWithGrades(lexis)
                await database.upsertLexis(enhancedLexis)
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

async function collectLexes(parseIds: string[]) {
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
                        console.info('\n' + lexis.lexicographia.lemma, state.parseIds.length)
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
    
    const pronomina = await makePronounLexis()
    for (const pronomen of pronomina) {
        await database.upsertLexis(pronomen)
    }
}

async function main() {
    await database.connect()
    const argv = process.argv[2]
    if (argv) {
        const parseIds = [argv]
        await collectLexes(parseIds)
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
