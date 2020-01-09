import { readdirAsync, readFileAsync, readJSONAsync, writeFileAsync } from 'nodeUtils'
import { radixLatinLibrary, radixTokens } from 'config'
import { join } from 'path'
import { FrequencyTable } from 'analysis/makeCrudeFrequencyTable'
import { data } from 'lexis/data'
import { praenomina } from 'lexis/data/praenomina'
import { tokenize } from 'corpus/tokenize'

async function readdirFullAsync(basePath: string): Promise<string[]> {
    const subs = await readdirAsync(basePath)
    return subs.map(sub => join(basePath, sub))
}

async function getTexts(author: string): Promise<string[]> {
    const baseUrl = radixLatinLibrary
    const authorBase = join(baseUrl, author)
    let paths: string[] = []
    try {
        paths = await readdirFullAsync(authorBase)
    }
    catch (error) {
        paths = [join(baseUrl, author + '.txt')]
    }
    try {
        const files = await Promise.all(paths.map(path => readFileAsync(path)))
        const texts = files.map(file => file.toString())
        return texts
    }
    catch {
        console.warn(`Cannot find files for ${author}`)
        return []
    }
}

function tokenizeBooks(books: string[], frequencyTable: FrequencyTable): string[] {
    let tokens: string[] = []
    let bookIndex = 0
    for (let book of books) {
        console.info(`tokenizing book ${bookIndex++}`)
        for (const praenomen of praenomina) {
            const regexPraenominis = new RegExp(`${praenomen[0]}\\.`, 'g')
            book = book.replace(regexPraenominis, praenomen[1])
        }
        const sentences = book.split('.')
        for (const sentence of sentences) {
            tokens = tokens.concat(tokenize(sentence, frequencyTable))
        }
    }
    return tokens
}

function getTokenCachePath(author: string): string {
    return join(radixTokens, author + '.json')
}

export async function getTokens(author: string): Promise<string[]> {
    const path = getTokenCachePath(author)
    return readJSONAsync(path)
}

export async function main() {
    const FORCE_RETOKENIZE = process.argv[2] === 'all'
    let targetAuthors: string[]
    const allAvailableAuthors = (await readdirAsync(radixLatinLibrary)).filter(author => !author.endsWith('.txt'))
    if (FORCE_RETOKENIZE) {
        targetAuthors = allAvailableAuthors
    }
    else {
        const tokenizedAuthors = (await readdirAsync(radixTokens)).map(author => author.replace('\.json', ''))
        targetAuthors = allAvailableAuthors.filter(author => !tokenizedAuthors.includes(author))
    }
    console.info(`Tokenizing books from authors ${targetAuthors}`)
    for (const author of targetAuthors) {
        console.info(`Tokenizing author ${author}`)
        const frequencyTable = await data.getFrequencyTable()
        const texts = await getTexts(author)
        const tokens = tokenizeBooks(texts, frequencyTable)
        await writeFileAsync(
            getTokenCachePath(author),
            JSON.stringify(tokens),
        )
    }
}

if (require.main === module) {
    main()
}

