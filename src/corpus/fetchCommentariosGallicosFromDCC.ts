import { writeFileAsync } from '../nodeUtils'
import fetch from 'node-fetch'
import * as cheerio from 'cheerio'

async function main() {
    const via = (capitulum: number) => {
        if (capitulum <= 7) {
            return `http://dcc.dickinson.edu/caesar/book-1/chapter-1-${capitulum}`
        }
        else {
            return `http://dcc.dickinson.edu/caesar/chapter-1-${capitulum}`
        }
    }
    let texts = ''
    for (let i = 1; i <= 54; i++) {
        console.info(via(i))
        const response = await fetch(via(i))
        const html = await response.text()
        const $ = cheerio.load(html)
        const text = $('.field-type-text-with-summary').text()
        texts += `1-${i}\n${text}`
    }
    writeFileAsync('./caesar-commentarii-de-bello-gallico-liber-i.txt', texts)
}

main()
