import { database } from 'lexis/database'
import { getTokens } from 'corpus/tokenizeBooks'
import { fallbackProxy, flatten } from 'utils'
import { data } from 'lexis/data'
import { KnownTokenAnalysis, UnknownTokenAnalysis } from 'analysis/Model'
import { analyse } from '../'
import { serializeStatum } from 'serialization'

const fallbackAuthors = ['caesar', 'cicero', 'aquinas']

export type LemmataSummary = {
    unknownForms: [string, number][]
    knownLemmata: [string, number][]
}

function printSummary(summary: LemmataSummary) {
    let output = ''

    output += `${summary.unknownForms.length} unknown forms, ${summary.knownLemmata.length} parsed lemmata`
    output += summary.unknownForms.map(form => form[0].padEnd(12, ' ') + ',' + form[1].toString()).join('\n')

    console.info(output)
}


function getAuthors(): string[] {
    if (process.argv[2]) {
        return process.argv[2].split(',')
    }
    else {
        return fallbackAuthors
    }
}

async function main() {
    await database.connect()

    const authors = getAuthors()
    console.info(`loading tokens for ${authors.join(', ')}`)
    const tokens = (await Promise.all(authors.map(getTokens))).reduce(flatten, [])
    console.info('loading precalculated data')
    const inflectionDict = await data.getInflectionDict()
    const frequencyTable = await data.getFrequencyTable()
    console.info('loaded')
    const results = analyse(tokens, {
        inflectionDict,
        frequencyTable,
    })
    const knownResults = results.filter(result => result.type === 'notus') as KnownTokenAnalysis[]
    const unknownResults = results.filter(result => result.type === 'ignotus') as UnknownTokenAnalysis[]
    const lemmata = knownResults.map(result => result.lemma)

    const verbCounter = fallbackProxy<{[key in string]: number}>({}, () => 0)
    for (const result of knownResults) {
        if (result.pars === 'verbum' && result.status) {
            const clavis = serializeStatum(result.pars, result.status, {parsMinor: result.parsMinor})
            verbCounter[clavis] += 1
        }
    }

    await data.savePOSStat(verbCounter)

    const counter = fallbackProxy<{[key in string]: number}>({}, () => 0)
    for (const lemma of lemmata) {
        counter[lemma] += 1
    }
    const unkownCounter = fallbackProxy<{[key in string]: number}>({}, () => 0)
    for (const result of unknownResults) {
        unkownCounter[result.forma] += 1
    }
    const unkwownEntries = Object.entries(unkownCounter).sort((entryA, entryB) => entryB[1] - entryA[1])
    const knownEntries = Object.entries(counter).sort((entryA, entryB) => entryB[1] - entryA[1])

    const summary: LemmataSummary = {
        unknownForms: unkwownEntries,
        knownLemmata: knownEntries
    }

    await data.saveLemmataSummary(summary)
    printSummary(summary)

    process.exit()
}

if (require.main === module) {
    main()
}

