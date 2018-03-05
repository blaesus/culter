import { InflectedFormDesignation } from 'analysis/Model'
import {
    Aspectus,
    Casus, Genus, Gradus, Modus, Numerus, Pars, ParsMinor, Persona, SeriesStatus, Status,
    StatusAdiectivi,
    StatusFinitivi, StatusGerundii, StatusInfinitivi, StatusParticipii,
    StatusPronominis,
    StatusSubstantivi, StatusSupini,
    Tempus,
    Vox
} from 'lexis'

type StatusOmnibus =
    StatusSubstantivi
    & StatusAdiectivi
    & StatusPronominis
    & StatusFinitivi
    & StatusInfinitivi
    & StatusGerundii
    & StatusSupini
    & StatusParticipii


type Linea = [
    Pars,
    ParsMinor | undefined,
    Numerus,
    Persona,
    Genus,
    Casus,
    Gradus,
    Modus,
    Vox,
    Tempus,
    Aspectus
]

const seperator = '|'
const nullPlaceholder = '-'

export function serializeStatum<T extends Status>(pars: Pars,
                                                  status: T,
                                                  options: {
                                                      parsMinor?: ParsMinor
                                                  } = {}): SeriesStatus<T> {
    const {parsMinor} = options
    const statusOmnibus = status as StatusOmnibus
    const {numerus, persona, genus, casus, gradus, modus, vox, tempus, aspectus} = statusOmnibus
    const linea: Linea = [pars, parsMinor, numerus, persona, genus, casus, gradus, modus, vox, tempus, aspectus]
    return linea.map(node => node ? node : nullPlaceholder).join(seperator)
}

export function parseSeriemStatus<S extends StatusOmnibus>(series: SeriesStatus<S>): S {
    const [pars, parsMinor, numerus, persona, genus, casus, gradus, modus, vox, tempus, aspectus] = series.split(seperator)
    const result = {
        numerus, genus, casus, gradus, modus, vox, tempus, aspectus, persona
    } as S
    for (const key in result) {
        if (String(result[key]) === nullPlaceholder) {
            delete result[key]
        }
    }
    return result
}



