import fetch from 'node-fetch'
import { database, PageRecord } from '../database'

const wiktionaryUrl = (entry: string) =>
    `https://en.wiktionary.org/w/index.php?title=${encodeURIComponent(entry)}&printable=yes`

export async function fetchWiktionaryPage(entry: string): Promise<PageRecord> {
    const url = wiktionaryUrl(entry)
    const response = await fetch(url)
    const html = await response.text()
    const record = await database.upsertPage({
        entry,
        remoteUrl: url,
        source: 'wiktionary',
        html,
    })
    return record
}

export async function getWiktionaryPage(entry: string, forceRefetch = false): Promise<PageRecord> {
    if (forceRefetch) {
        return fetchWiktionaryPage(entry)
    }
    await database.connect()
    const url = wiktionaryUrl(entry)
    const page = await database.findPageByUrl(url)
    if (page) {
        return page
    }
    else {
        return fetchWiktionaryPage(entry)
    }
}

async function main() {
    await database.connect()
    const query = process.argv[2].toString()
    console.info(await getWiktionaryPage(query, true))
    process.exit()
}

if (require.main === module) {
    main()
}
