import { FrequencyTable } from 'analysis/makeCrudeFrequencyTable'
import { decapitalize } from 'utils'

export const punctuations: string[] = [
    ',',
    '.',
    '[',
    ']',
    '(',
    ')',
    ';',
    '?',
    '!',
    ':',
    '"',
    "'",
    '*',
]

const punctuationRegex: RegExp[] = punctuations.map(punctuation => new RegExp(`\\${punctuation}`, 'g'))

const htmlTagPatterns = [
    ['&lt', ''],
    ['&gt', ''],
    ['&acirc', 'a'],
    ['&ecirc', '3'],
    ['&icirc', 'i'],
    ['&ocirc', 'o'],
    ['&ucirc', 'u'],
]

const spaces: RegExp[] = [
    /\n/g,
    /\t/g,
]


function cleanText(s: string): string {
    for (const regex of punctuationRegex) {
        s = s.replace(regex, '')
    }
    for (const htmlPattern of htmlTagPatterns) {
        const [tag, replacement] = htmlPattern
        const regex = new RegExp(tag, 'g')
        s = s.replace(regex, replacement)
    }
    for (const space of spaces) {
        s = s.replace(space, ' ')
    }
    return s
}

function isRomanNumeral(s: string): boolean {
    return ['I', 'V', 'X', 'D', 'C', 'L', 'M'].includes(s.toUpperCase())
}

export function isRomanNumerals(s: string): boolean {
    return s.split('').every(isRomanNumeral)
}


export function tokenize(sentence: string, frequencyTable: FrequencyTable): string[] {
    const tokens = cleanText(decapitalize(sentence)).split(' ')
    for (let i = 0; i < tokens.length; i += 1) {
        const token = tokens[i]
        if (token.endsWith('que') && !frequencyTable[token]) {
            tokens.splice(i, 1, token.replace(/que$/, ''), '-que')
            i += 1
        }
    }
    return tokens.filter(Boolean)
}

