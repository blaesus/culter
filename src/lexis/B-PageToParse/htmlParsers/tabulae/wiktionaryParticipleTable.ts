import {
    Inflectiones,
    parseSeriemStatus,
    serializeStatum,
    StatusAdiectivi,
    StatusParticipii,
    Tempus,
    Vox
} from '../../../../lexis'
import { parseTabluamAdiectivi } from './wiktionaryAdjectiveTable'

export function parseTabluamParticipii(tableNode: CheerioElement,
                                       $: CheerioStatic,
                                       vox: Vox,
                                       tempus: Tempus,): Inflectiones<StatusParticipii> {
    const inflectionsUtAdiectivum = parseTabluamAdiectivi(tableNode, $)
    const entries = Object.entries(inflectionsUtAdiectivum)
    for (const entry of entries) {
        const [series, formae] = entry
        const status: StatusAdiectivi = parseSeriemStatus(series)
        const statusParticipii: StatusParticipii = {
            vox,
            genus: status.genus,
            casus: status.casus,
            numerus: status.numerus,
            tempus,
        }
        entry[0] = serializeStatum('participium', statusParticipii)
    }
    const inflectiones: Inflectiones<StatusParticipii> = {}
    for (const entry of entries) {
        inflectiones[entry[0]] = entry[1]
    }
    return inflectiones
}
