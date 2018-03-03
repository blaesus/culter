import {
    Inflectiones,
    parseSeriemStatus,
    ParsMinor,
    serializeStatum,
    StatusAdiectivi,
    StatusParticipii,
} from '../../../../lexis'
import { parseTabluamAdiectivi } from './wiktionaryAdjectiveTable'

export function parseTabluamPronominis(tableNode: CheerioElement,
                                       $: CheerioStatic,
                                       parsMinor?: ParsMinor): Inflectiones<StatusParticipii> {
    const inflectionsUtAdiectivum = parseTabluamAdiectivi(tableNode, $)
    const entries = Object.entries(inflectionsUtAdiectivum)
    for (const entry of entries) {
        const [series, formae] = entry
        const status: StatusAdiectivi = parseSeriemStatus(series)
        entry[0] = serializeStatum('pronomen', status, {parsMinor})
    }
    const inflectiones: Inflectiones<StatusParticipii> = {}
    for (const entry of entries) {
        inflectiones[entry[0]] = entry[1]
    }
    return inflectiones
}
