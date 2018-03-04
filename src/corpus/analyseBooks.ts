import { database } from 'lexis/database'
import { getTokens } from 'corpus/tokenizeBooks'
import { fallbackProxy, flatten } from 'utils'
import { analyse, KnownTokenAnalysis, UnknownTokenAnalysis } from 'analysis/analyse'
import { data } from 'lexis/data'

const fallbackAuthors = ['caesar', 'cicero', 'aquinas']

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
    const knownResults = results.filter(result => result.type === 'known') as KnownTokenAnalysis[]
    const unknownResults = results.filter(result => result.type === 'unknown') as UnknownTokenAnalysis[]
    const lemmata = knownResults.map(result => result.lemma)

    const verbCounter = fallbackProxy<{[key in string]: number}>({}, () => 0)
    for (const result of knownResults) {
        if (result.pars === 'verbum' && result.status) {
            verbCounter[result.status] += 1
        }
    }

    await data.savePOSStat(verbCounter)

    const counter = fallbackProxy<{[key in string]: number}>({}, () => 0)
    for (const lemma of lemmata) {
        counter[lemma] += 1
    }
    const unkownCounter = fallbackProxy<{[key in string]: number}>({}, () => 0)
    for (const result of unknownResults) {
        unkownCounter[result.token] += 1
    }
    const unkwownEntries = Object.entries(unkownCounter).sort((entryA, entryB) => entryB[1] - entryA[1])
    console.info('unknowns')
    console.info(unkwownEntries.map(entry => `${entry[0]}-${entry[1]}`).join(' '))

    const knownEntries = Object.entries(counter).sort((entryA, entryB) => entryB[1] - entryA[1])
    console.info('knowns')
    console.info(knownEntries.join(' '))
    console.info('unknown', unknownResults.length, 'known', knownResults.length,
        Math.floor(unknownResults.length * 1000 / (knownResults.length + unknownResults.length)) / 10 + '%'
    )

    process.exit()
}

if (require.main === module) {
    main()
}

