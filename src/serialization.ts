import { InflectedFormDesignation } from 'analysis/Model'
import {
    Aspectus,
    Casus, Genus, Gradus, Modus, Numerus, Pars, ParsMinor, Persona, SeriesStatus, Status,
    StatusAdiectivi,
    StatusFinitivi, StatusGerundii, StatusInfinitivi, StatusParticipii, StatusPronomenRelativum,
    StatusPronominis, StatusPronominisDemonstrativi, StatusPronominisInterrogativum, StatusPronominisPossessivi,
    StatusSubstantivi, StatusSupini,
    Tempus,
    Vox,
} from "lexis";

type StatusOmnibus =
    StatusSubstantivi

    & StatusPronominisPossessivi
    & StatusPronominisInterrogativum
    & StatusPronomenRelativum
    & StatusPronominisDemonstrativi
    & StatusPronominisPossessivi

    & StatusAdiectivi
    & StatusFinitivi
    & StatusInfinitivi
    & StatusGerundii
    & StatusSupini
    & StatusParticipii

type Informatio = string

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
    Aspectus,
    Informatio
]


const parameterSeparator = '|'
const nullPlaceholder = '-'

export function serializeStatum<T extends Status>(pars: Pars,
                                                  status: T,
                                                  options: {
                                                      parsMinor?: ParsMinor
                                                  } = {}): SeriesStatus<T> {
    const {parsMinor} = options
    const statusOmnibus = status as StatusOmnibus
    const {numerus, persona, genus, casus, gradus, modus, vox, tempus, aspectus, numerusPersonae} = statusOmnibus
    const informatio = numerusPersonae
    const linea: Linea = [pars, parsMinor, numerus, persona, genus, casus, gradus, modus, vox, tempus, aspectus, informatio]
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

const separator = '|'

export function serializeInflectedFormDesignation(designation: InflectedFormDesignation): string {
    if (!designation.status) {
        throw new Error("No status!" + designation)
    }
    return [
        designation.forma,
        designation.lemma,
        serializeStatum(designation.pars, designation.status, {parsMinor: designation.parsMinor})
    ].join(separator)
}

export function parseInflectionFormDesignationSeries<S extends Status = Status>(
    series: SeriesStatus<S>
): InflectedFormDesignation {
    const [
        forma,
        lemma,
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
    ] = series.split(separator).map(c => c === nullPlaceholder ? undefined : c)
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
