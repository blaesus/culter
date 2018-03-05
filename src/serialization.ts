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

export type MinimusSeriesStatus<S extends Status = Status> = string

type DictionaryType<T extends string> = {
    [key in T]: number
}

type AnyDictionary = {
    [key in string]?: number
}

type Dictionary<T extends string> = DictionaryType<T> & AnyDictionary

/**
 *  Order of entries is crucial here
 */

const parsDict: Dictionary<Pars> = {
    'nomen-substantivum': 0,
    'nomen-adiectivum': 1,
    'adverbium': 2,
    'pronomen': 3,
    'verbum': 4,
    'infinitivum': 5,
    'gerundium': 6,
    'supinum': 7,
    'participium': 8,
    'coniunctio': 9,
    'praepositio': 10,
    'particula': 11,
    'postpositio': 12,
    'littera': 13,
    'interiectio': 14,
    'articulus': 15,
    'punctum': 16,
    'adpositum': 17,
    'exclamatio': 18,
    'alienum': 19,
    'alia': 20,
    'ignotus': 21,
}

const parsMinorDict: Dictionary<ParsMinor> = {
    'nomen-immutabile': 0,
    'adiectivum-immutabile': 1,
    'pronomen-demonstrativum': 2,
    'pronomen-personale': 3,
    'pronomen-possessivum': 4,
    'pronomen-interrogativum': 5,
    'pronomen-relativum': 6,
    'pronomen-immutabile': 7,
    'pronomen-reflexivum': 8,
    'pronomen-nullum': 9,
}

const numerusDict: Dictionary<Numerus> = {
    singularis: 0,
    pluralis: 1,
}


const genusDict: Dictionary<Genus> = {
    masculinum: 0,
    femininum: 1,
    neutrum: 2,
}

const casusDict: Dictionary<Casus> = {
    'nominativus': 0,
    'genetivus': 1,
    'accusativus': 2,
    'dativus': 3,
    'ablativus': 4,
    'locativus': 5,
    'vocativus': 6,
}


const modusDict: Dictionary<Modus> = {
    indicativus: 0,
    imperativus: 1,
    coniunctivus: 2,
}

const voxDict: Dictionary<Vox> = {
    activa: 0,
    passiva: 1,
}

const tempusDict: Dictionary<Tempus> = {
    praesens: 0,
    praeteritum: 1,
    futurum: 2,
}

const aspectusDict: Dictionary<Aspectus> = {
    imperfectivus: 0,
    perfectivus: 1,
}

const personaDict: Dictionary<Persona> = {
    prima: 0,
    secunda: 1,
    tertia: 2,
}

const gradusDict: Dictionary<Gradus> = {
    positivus: 0,
    comparativus: 1,
    superlativus: 2,
}

type Undecim<T> = [T, T, T, T, T, T, T, T, T, T, T]

const dicts: Undecim<Dictionary<string>> = [
    parsDict,
    parsMinorDict,
    numerusDict,
    personaDict,
    genusDict,
    casusDict,
    gradusDict,
    modusDict,
    voxDict,
    tempusDict,
    aspectusDict,
]

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


const parameterSeparator = '|'
const nullPlaceholder = '-'

function applyDict(data: (string | undefined)[], dicts: Dictionary<string>[]): (number | null)[] {
    return [...data].map((datum, index) =>
        typeof dicts[index][datum || ''] === 'number'
            ? dicts[index][datum || '']
            : null
    )
}

function lookupDict(data: number[], dicts: Dictionary<string>[]): (string | undefined)[] {
    const entriesList = dicts.map(dict => Object.entries(dict))
    return [...data].map((datum, index) => {
        const entries = entriesList[index]
        for (const entry of entries) {
            if (entry[1] === datum) {
                return entry[0]
            }
        }
    })
}

export function serializeStatum<T extends Status>(pars: Pars,
                                                  status: T,
                                                  options: {
                                                      parsMinor?: ParsMinor
                                                  } = {}): SeriesStatus<T> {
    const {parsMinor} = options
    const statusOmnibus = status as StatusOmnibus
    const {numerus, persona, genus, casus, gradus, modus, vox, tempus, aspectus} = statusOmnibus
    const linea: Linea = [pars, parsMinor, numerus, persona, genus, casus, gradus, modus, vox, tempus, aspectus]
    return linea.map(node => node ? node : nullPlaceholder).join(parameterSeparator)
}

export function parseSeriemStatus<S extends StatusOmnibus>(series: SeriesStatus<S>): S {
    const [pars, parsMinor, numerus, persona, genus, casus, gradus, modus, vox, tempus, aspectus] = series.split(parameterSeparator)
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

export function minimizeStatus<S extends Partial<StatusOmnibus>>(
    pars: Pars,
    parsMinor: ParsMinor | undefined,
    status: S | undefined,
): MinimusSeriesStatus<S> {
    if (!status) {
        return ''
    }
    const {
        numerus,
        persona,
        genus,
        casus,
        gradus,
        modus,
        vox,
        tempus,
        aspectus
    } = status
    const linea = [
        pars,
        parsMinor,
        numerus,
        persona,
        genus,
        casus,
        gradus,
        modus,
        vox,
        tempus,
        aspectus
    ]
    return applyDict(linea, dicts).map(x => typeof x === 'number' ? x.toString(36) : nullPlaceholder).join('')
}

const separator = '|'

export function serializeInflectedFormDesignation(designation: InflectedFormDesignation): string {
    return [
        designation.forma,
        designation.lemma,
        minimizeStatus(designation.pars, designation.parsMinor, designation.status as any)
    ].join(separator)
}

export function parseInflectionFormDesignationSeries<S extends Status = Status>(
    series: MinimusSeriesStatus<S>
): InflectedFormDesignation {
    const [forma, lemma, minimusStatusSeries] = series.split(separator)
    const [
        pars,
        parsMinor,
        numerus,
        persona,
        genus,
        casus,
        gradus,
        modus,
        vox,
        tempus,
        aspectus,
    ] = lookupDict(minimusStatusSeries.split('').map(Number), dicts)
    const status = {
        numerus,
        persona,
        genus,
        casus,
        gradus,
        modus,
        vox,
        tempus,
        aspectus,
    }
    const result = {
        forma,
        lemma,
        pars,
        parsMinor,
        status,
    } as InflectedFormDesignation
    return result
}
