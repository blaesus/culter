import { InflectionDict } from 'lexis/D-LexisToDict/makeInflectionDict'
import { FrequencyTable } from './makeCrudeFrequencyTable'
import { capitalize, demacron, reverseCapitalize, bruteForceFixUV, replaceUV, updateLine } from "utils";
import { InflectedFormDesignation, TokenAnalysis } from 'analysis/Model'
import { isRomanNumerals } from 'corpus/tokenize'
import { parseInflectionFormDesignationSeries } from 'serialization'

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

function shouldSkip(token: string): boolean {
    return isArabicNumerals(token) || isRomanNumerals(token)
}

function getPossibleAlternativeSpellings(forma: string): string[] {
    return [
        reverseCapitalize(forma),

        bruteForceFixUV(forma),
        replaceUV(forma, "v"),

        forma.toLowerCase(),
        capitalize(forma.toLowerCase()),
        forma.replace(/sset/, "visset"),
    ];
}

export function analyseToken(forma: string, data: AnalyserData): TokenAnalysis {
    if (shouldSkip(forma)) {
        return {
            type: 'neglectus',
            forma
        }
    }
    const {inflectionDict, frequencyTable} = data
    let designations: InflectedFormDesignation[] = []
    const designationSeries = inflectionDict[forma]
    if (designationSeries) {
        designations = designationSeries.map(parseInflectionFormDesignationSeries)
    }
    else {
        const possibleAlternativeTokens = getPossibleAlternativeSpellings(forma)
        for (const altToken of possibleAlternativeTokens) {
            const altDesignationSeries = inflectionDict[altToken]
            if (altDesignationSeries) {
                designations = altDesignationSeries.map(parseInflectionFormDesignationSeries)
                break
            }
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
        if (i % 10000 === 0) updateLine(`${i}/${tokens.length}`)
        const result = analyseToken(tokens[i], data)
        results[i] = result
    }
    return results
}
