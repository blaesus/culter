import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import { data } from 'lexis/data'

async function main() {
    const initialIndexPage = `https://en.wiktionary.org/wiki/Category:Latin_lemmas`
    const wiktionaryRoot = `https://en.wiktionary.org/`
    
    const state = {
        allEntries: [] as string[],
        awaitIndex: true
    }
    
    function extractEntries($: CheerioStatic): string[] {
        return $('#mw-pages').find('li>a').toArray().map(node => $(node).text())
    }
    
    function extractNextIndexUrl($: CheerioStatic): string | undefined {
        return $('#mw-pages').find('a:contains(next page)').attr('href')
    }
    
    async function addEntries(pageUrl: string) {
        const html = await (await fetch(pageUrl)).text()
        const $ = cheerio.load(html)
        const newEntries = extractEntries($)
        state.allEntries = [
            ...state.allEntries,
            ...newEntries,
        ]
        console.info(`adding ${newEntries.length} entries; totaling ${state.allEntries.length}`)
        const nextIndex = extractNextIndexUrl($)
        if (nextIndex) {
            const path = `${wiktionaryRoot}${nextIndex}`
            await addEntries(path)
        }
        else {
            state.awaitIndex = false
            await data.setLemmata(state.allEntries)
        }
    }
    
    // Pass one
    await addEntries(initialIndexPage)
    
    process.exit()
}

main()
