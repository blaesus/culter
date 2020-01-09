import {NomenSubstantivum} from "../lexis";
import {readFileAsync, writeFileAsync} from "../nodeUtils";
import {database} from '../lexis/database'
import {randomBytes} from 'crypto'
import { demacron, isCapitalized } from "../utils";
import { data } from "../lexis/data";

function cleanMeaning(s: string): string {
    return s.replace(/I /g, '').replace(/\n/g, ' ')
}

async function getCandidateLemmata(n = 5000): Promise<string[]> {
    const summary = await data.getLemmataSummary();
    return summary.knownLemmata.slice(0, n).map(pair => pair[0])
}

async function update() {
    // let [id, lemma, partes, anglice, genus, ante, tags] = linea.split('\t')
    await database.connect()

    const candidates = await getCandidateLemmata()
    const lineae = (await readFileAsync('src/anki/Lingua Latina.txt')).toString().split('\n')
    const lineaeNovae = [...lineae]
    for (const lemma of candidates) {
        if (lineae.every(linea => !linea.includes(lemma))) {
            console.info(candidates.indexOf(lemma), candidates.length, lemma)
            try {
                const data = await database.getLexesByLemma(lemma)
                const lexis = data[0]
                if (
                    lexis.pars === 'participium'
                    || lexis.pars === 'infinitivum'
                    || lexis.pars === 'supinum'
                    || lexis.pars === 'gerundium'
                ) {
                    continue
                }
                if (isCapitalized(lexis.lexicographia.lemma)) {
                    continue
                }
                if (lexis.interpretationes.Anglica) {
                    if (lexis.interpretationes.Anglica.some(definition => definition.significatio.includes("Alternative form"))) {
                        continue
                    }
                    if (lexis.interpretationes.Anglica.some(definition => definition.significatio.includes("Alternative spelling"))) {
                        continue
                    }

                }
                const partes = lexis.lexicographia.radices.join(', ')
                let anglice = lemma
                const anglica = lexis.interpretationes['Anglica']
                if (anglica) {
                    anglice = anglica.map(interpretio => interpretio.significatio).map(s => cleanMeaning(s))[0]
                }
                const genera = (lexis as NomenSubstantivum).genera
                const genus = genera ? genera.map(genus => genus.charAt(0)).join('') : ''
                const ante = ''
                const tags = ''
                const id = demacron(lemma).split('').filter(c => c.match("^[a-zA-Z]+$")).join('')
                                         .padEnd(4, '-').slice(0, 4)
                                         .toLocaleLowerCase()
                           + randomBytes(4).toString('hex')
                const linea = [id, lemma, partes, anglice, genus, ante, tags].join('\t')
                lineaeNovae.push(linea)
            }
            catch (error) {
                console.warn(error.message)
            }
        }
    }
    await writeFileAsync('src/anki/Lingua Latina Nova.txt', lineaeNovae.join('\n'))
    process.exit()
}

update()
