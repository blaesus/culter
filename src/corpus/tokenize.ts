import { FrequencyTable } from 'analysis/makeCrudeFrequencyTable'
import { decapitalize } from 'utils'

const punctuations: RegExp[] = [
    /,/g,
    /\./g,
    /\[/g,
    /]/g,
    /\(/g,
    /\)/g,
    /;/g,
    /\?/g,
    /!/g,
    /:/g,
    /"/g,
    /'/g,
    /\*/g,
]

const spaces: RegExp[] = [
    /\n/g,
    /\t/g,
]


function cleanText(s: string): string {
    for (const punctuation of punctuations) {
        s = s.replace(punctuation, '')
    }
    for (const space of spaces) {
        s = s.replace(space, ' ')
    }
    return s
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

