import { getWiktionaryPage } from './fetchPage'
import { spawnConcurrent } from '../../nodeUtils'
import { database } from '../database'
import { parseWiktionaryHtml } from '../B-PageToParse/htmlParsers/parseWiktionaryHtml'
import { demacron } from '../../utils'
import { data } from '../data/data'

async function fetchEntries(entries: string[]) {
    const CONCURRENT_WORKERS = 8
    const state = {
        entries: entries,
        allEntries: entries,
    }
    
    async function fetchSingleEntry(): Promise<void> {
        const nextEntry = state.entries[0]
        state.entries = state.entries.filter(entry => entry !== nextEntry)
        if (nextEntry) {
            try {
                const data = await getWiktionaryPage(nextEntry)
                const parse = await parseWiktionaryHtml(data.html)
                for (const mainLexis of parse.main) {
                    if (mainLexis.pars === 'verbum') {
                        const participleEntries =
                            (Object.values(mainLexis.lemmataAlii.participii)
                                   .filter(Boolean) as string[])
                                .map(demacron)
                        state.entries = [
                            ...state.entries,
                            ...participleEntries,
                        ]
                        state.allEntries = [
                            ...state.allEntries,
                            ...participleEntries,
                        ]
                    }
                    if (mainLexis.pars === 'nomen-adiectivum') {
                        const comparativeEntries = (Object.values(mainLexis.lexicographia.lemmataAlii).filter(Boolean) as string[]).map(demacron)
                        
                        state.entries = [
                            ...state.entries,
                            ...comparativeEntries,
                        ]
                        state.allEntries = [
                            ...state.allEntries,
                            ...comparativeEntries,
                        ]
                    }
                }
            }
            catch (error) {
                console.error(error.message)
            }
            return fetchSingleEntry()
        }
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

