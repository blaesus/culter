import { Lexis, Pars, ParsMinor, SeriesStatus } from 'lexis'
import { InflectedFormDesignation, InflectionDict } from 'lexis/D-LexisToDict/makeInflectionDict'
import { FrequencyTable } from './makeCrudeFrequencyTable'
import { demacron, reverseCapitalize } from 'utils'

export interface UnknownTokenAnalysis {
    type: 'ignotus'
    token: string
}

export interface KnownTokenAnalysis {
    type: 'notus'
    token: string
    lemma: string
    pars: Pars
    parsMinor?: ParsMinor
    status?: SeriesStatus<Lexis>
}

export interface SkipTokenAnalysis {
    type: 'neglectus'
    token: string
}

export type TokenAnalysis = UnknownTokenAnalysis | KnownTokenAnalysis | SkipTokenAnalysis

export interface AnalyserData {
    inflectionDict: InflectionDict
    frequencyTable: FrequencyTable
}

function pickHighest<T>(candidates: T[], evaluate: (candidate: T) => number): T {
    return candidates.sort((c1, c2) => evaluate(c2) - evaluate(c1))[0]
}

function getFrequency(lemma: string, frequencyTable: FrequencyTable): number {
    return frequencyTable[lemma] || 0
}

function isArabicNumerals(s: string): boolean {
    return /\d+/.test(s)
}

function isRomanNumeral(s: string): boolean {
    return ['I', 'V', 'X', 'D', 'C', 'L', 'M'].includes(s.toUpperCase())
}

function isRomanNumerals(s: string): boolean {
    return s.split('').every(isRomanNumeral)
}

function shouldSkip(token: string): boolean {
    return isArabicNumerals(token) || isRomanNumerals(token)
}

function getResult(token: string, data: AnalyserData): TokenAnalysis {
    if (shouldSkip(token)) {
        return {
            type: 'neglectus',
            token
        }
    }
    const {inflectionDict, frequencyTable} = data
    let designations: InflectedFormDesignation[] = []
    let originalDesignations = inflectionDict[token]
    if (originalDesignations) {
        designations = originalDesignations
    }
    else {
        const altToken = reverseCapitalize(token)
        designations = inflectionDict[altToken]
        if (!designations) {
            designations = originalDesignations || []
        }
    }
    if (designations.length > 0) {
        const designation = pickHighest(
            designations,
            designation => getFrequency(demacron(designation.lemma), frequencyTable)
        )
        return {
            type: 'notus',
            token,
            pars: designation.pars,
            lemma: designation.lemma,
            status: designation.status
        }
    }
    else {
        return {
            type: 'ignotus',
            token,
        }
    }
}

export function analyse(tokens: string[], data: AnalyserData): TokenAnalysis[] {
    const results: TokenAnalysis[] = []
    for (let i = 0; i < tokens.length; i += 1) {
        if (i % 1000 === 0) console.info(`${i}/${tokens.length}`)
        const result = getResult(tokens[i], data)
        results[i] = result
    }
    return results
}
