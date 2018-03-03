import { getWiktionaryPage } from 'lexis/A-WiktionaryToPage/fetchPage'
import { getRedirectedLemma, parseWiktionaryHtml } from 'lexis/B-PageToParse/htmlParsers/parseWiktionaryHtml'
import { Lexis } from 'lexis'

export async function getBestDataForLemma(lemma: string, noRedirection?: boolean): Promise<Lexis[]> {
    const {html} = await getWiktionaryPage(lemma)
    let results: Lexis[] = []
    try {
        const {main, auxiliary} = parseWiktionaryHtml(html)
        results = [...main, ...auxiliary]
    }
    catch (error) {
        if (!noRedirection) {
            if (error.message === 'no-entry') {
                // Misplaced deponent
                if (lemma.endsWith('o')) {
                    lemma = `${lemma}r`
                    results = await getBestDataForLemma(lemma, true)
                }
                else {
                    // 'Did you mean ...?'
                    const alterLemma = getRedirectedLemma(html)
                    if (alterLemma) {
                        results = await getBestDataForLemma(alterLemma, true)
                    }
                    else {
                        throw error
                    }
                }
            }
            else {
                throw error
            }
        }
        else {
            throw error
        }
    }
    return results
}

