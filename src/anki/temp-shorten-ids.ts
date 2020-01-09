import {readFileAsync, writeFileAsync} from "../nodeUtils"
import {database} from '../lexis/database'
import {randomBytes} from 'crypto'
import { demacron } from "../utils";

async function getNewLemmata(n = 30000): Promise<string[]> {
    const text = (await readFileAsync('../../cache/parsingResults.txt')).toString()
    const lineae = text.split('\n')
    for (let i = 0; i < lineae.length; i += 1) {
        const linea = lineae[i]
        if (linea === 'knowns') {
            const lineaKnowns = lineae[i+1]
            const entries = lineaKnowns.split(' ')
            const lemmata = entries.map(entry => entry.split(',')[0])
            return lemmata.slice(0, n)
        }
    }
    return []
}

async function update() {
    // let [id, lemma, partes, anglice, genus, ante, tags] = linea.split('\t')
    await database.connect()
    const lineae = (await readFileAsync('Lingua Latina.txt')).toString().split('\n')
    for (let i = 0; i < lineae.length; i++) {
        let [id, shortId, lemma, partes, anglice, genus, ante, tags] = lineae[i].split('\t')
        if (id.startsWith('mea')) {
            shortId = lemma.slice(0, 4) + `ffff`
        }
        else {
            shortId = demacron(lemma).split('').filter(c => c.match("^[a-zA-Z]+$")).join('')
                                     .padEnd(4, '-').slice(0, 4)
                                     .toLocaleLowerCase()
                      + randomBytes(4).toString('hex')
        }
        lineae[i] = [id, shortId, lemma, partes, anglice, genus, ante, tags].join('\t')
    }
    for (const linea of lineae) {
    }
    await writeFileAsync('Lingua Latina Nova.txt', lineae.join('\n'))
    process.exit()
}

update()
