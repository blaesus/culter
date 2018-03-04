import { InflectionDict } from 'lexis/D-LexisToDict/makeInflectionDict'
import { FrequencyTable } from './makeCrudeFrequencyTable'
import { demacron, reverseCapitalize } from 'utils'
import { InflectedFormDesignation, TokenAnalysis } from 'analysis/Model'

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

function getResult(forma: string, data: AnalyserData): TokenAnalysis {
    if (shouldSkip(forma)) {
        return {
            type: 'neglectus',
            forma
        }
    }
    const {inflectionDict, frequencyTable} = data
    let designations: InflectedFormDesignation[] = []
    let originalDesignations = inflectionDict[forma]
    if (originalDesignations) {
        designations = originalDesignations
    }
    else {
        const altToken = reverseCapitalize(forma)
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
            forma,
            pars: designation.pars,
            lemma: designation.lemma,
            status: designation.status
        }
    }
    else {
        return {
            type: 'ignotus',
            forma,
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
