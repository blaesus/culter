import { database, PageRecord, ParseResult } from 'lexis/database'
import { parseWiktionaryHtml } from 'lexis/B-PageToParse/htmlParsers/parseWiktionaryHtml'
import { getWiktionaryPage } from 'lexis/A-WiktionaryToPage/fetchPage'

export async function parsePage(page: PageRecord): Promise<ParseResult> {
    try {
        const {main, auxiliary} = parseWiktionaryHtml(page.html)
        const lexes = [...main, ...auxiliary]
        return database.upsertParse({
            success: true,
            entry: page.entry,
            pageUrl: page.remoteUrl,
            lexes,
        })
    }
    catch (error) {
        return database.upsertParse({
            success: false,
            entry: page.entry,
            pageUrl: page.remoteUrl,
            error: error.message,
        })
    }
}

export async function getParseByEntry(entry: string,
                                      options: {
                                          forceReparse?: boolean
                                          forceRefetch?: boolean
                                      } = {}): Promise<ParseResult> {
    const {forceReparse, forceRefetch} = options
    const existingParse = await database.getParseByEntry(entry)
    if (existingParse && !forceReparse) {
        return existingParse
    }
    else {
        const page = await getWiktionaryPage(entry, forceRefetch)
        return parsePage(page)
    }
}

export async function main() {
    await database.connect()
    const entry = process.argv[2]
    const refetch = process.argv[3] === 'refetch'
    const parse = await getParseByEntry(entry, {forceReparse: true, forceRefetch: refetch})
    console.info(JSON.stringify(parse, null, 4))
    process.exit()
}

if (require.main === module) {
    main()
}
