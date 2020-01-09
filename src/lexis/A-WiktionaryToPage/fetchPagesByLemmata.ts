import { fetchWiktionaryPage, getWiktionaryPage } from "./fetchPage";
import { spawnConcurrent } from 'nodeUtils'
import { database } from 'lexis/database'
import { parseWiktionaryHtml } from 'lexis/B-PageToParse/htmlParsers/parseWiktionaryHtml'
import { demacron } from 'utils'
import { data } from 'lexis/data'

async function fetchEntries(entries: string[]) {
    const CONCURRENT_WORKERS = 8
    const state = {
        entriesToDownload: entries,
        allEntries: entries,
    }
    
    async function fetchSingleEntry(): Promise<void> {
        const nextEntry = state.entriesToDownload[0]
        state.entriesToDownload = state.entriesToDownload.filter(entry => entry !== nextEntry)
        if (!nextEntry) {
            return
        }
        try {
            const data = await fetchWiktionaryPage(nextEntry)
            const parse = await parseWiktionaryHtml(data.html)

            // Add participles for verbs and comparatives and superlatives for adjectives
            // As we need their full list of inflected forms
            for (const mainLexis of parse.main) {
                if (mainLexis.pars === 'verbum') {
                    const participleEntries =
                        (Object.values(mainLexis.lemmataAlii.participii)
                               .filter(Boolean) as string[])
                            .map(demacron)
                    state.entriesToDownload = [
                        ...state.entriesToDownload,
                        ...participleEntries,
                    ]
                    state.allEntries = [
                        ...state.allEntries,
                        ...participleEntries,
                    ]
                }
                if (mainLexis.pars === 'nomen-adiectivum') {
                    const derivativeEntries = (Object.values(mainLexis.lexicographia.lemmataAlii).filter(Boolean) as string[]).map(demacron)

                    state.entriesToDownload = [
                        ...state.entriesToDownload,
                        ...derivativeEntries,
                    ]
                    state.allEntries = [
                        ...state.allEntries,
                        ...derivativeEntries,
                    ]
                }
            }
        }
        catch (error) {
            console.error(`Error for "${nextEntry}": ${error.message}`)
        }
        return fetchSingleEntry()
    }

    await spawnConcurrent(fetchSingleEntry, CONCURRENT_WORKERS)
}

async function main() {
    await database.connect()
    const argument = process.argv[2]
    const entries = argument ? argument.split(',') : await data.getLemmata()
    await fetchEntries(entries)
    process.exit()
}

if (require.main === module) {
    main()
}

