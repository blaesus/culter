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

const regexesEnglish: RegExp[] = [
    /The Latin Library/,
    /The Classics Page/,
]

function cleanBook(text: string): string {
    for (const praenomen of praenomina) {
        const regexPraenominis = new RegExp(`${praenomen[0]}\\.`, 'g')
        text = text.replace(regexPraenominis, praenomen[1])
    }
    for (const regex of regexesEnglish) {
        text = text.replace(regex, "")
    }
    return text
}

function tokenizeBooks(books: string[], frequencyTable: FrequencyTable): string[] {
    let tokens: string[] = []
    let bookIndex = 0
    for (let book of books) {
        console.info(`tokenizing book ${bookIndex++}`)
        book = cleanBook(book)
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
    const target = process.argv[2]
    const tokenizeAll = target === "all"
    let targetAuthors: string[]
    if (tokenizeAll) {
        const allAvailableAuthors = (await readdirAsync(radixLatinLibrary)).filter(author => !author.endsWith('.txt'))
        targetAuthors = allAvailableAuthors
    }
    else {
        targetAuthors = target.split(',')
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

