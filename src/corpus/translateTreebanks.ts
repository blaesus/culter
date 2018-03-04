import * as cheerio from 'cheerio'
import { readdirAsync, readFileAsync } from 'nodeUtils'
import { radixCache } from 'config'
import { join } from 'path'
import { KnownTokenAnalysis } from 'analysis/analyse'
import {
    Aspectus, Casus, Genus, Gradus, Modus, Numerus, Pars, Persona, serializeStatum, Status, Tempus,
    Vox
} from 'lexis'
import { removeNullItems } from 'utils'

type Tabla<T> = {[key in string]?: T}

function translatePerseusTreebank(xml: string): KnownTokenAnalysis[][] {
    
    const perseusParsTable: Tabla<Pars> = {
        n: 'nomen-substantivum',
        v: 'verbum',
        a: 'nomen-adiectivum',
        d: 'adverbium',
        c: 'coniunctio',
        p: 'pronomen',
        i: 'interiectio',
        r: 'adpositum',
        m: 'nomen-adiectivum', // numeral
        e: 'exclamatio',
        u: 'punctum'
    }
    
    const perseusPersonaTable: Tabla<Persona> = {
        1: 'prima',
        2: 'secunda',
        3: 'tertia',
    }
    
    const perseusNumerusTable: Tabla<Numerus> = {
        s: 'singularis',
        p: 'pluralis',
    }
    
    const perseusTenseTable: Tabla<[Tempus, Aspectus]> = {
        p: ['praesens', 'imperfectivus'],
        i: ['praeteritum', 'imperfectivus'],
        r: ['praesens', 'perfectivus'],
        l: ['praeteritum', 'perfectivus'],
        t: ['futurum', 'perfectivus'],
        f: ['futurum', 'imperfectivus'],
    }
    
    const perseusMoodTable: Tabla<Modus | Pars> = {
        i: 'indicativus',
        s: 'coniunctivus',
        m: 'imperativus',
        n: 'infinitivum',
        p: 'participium',
        d: 'gerundium',
        g: 'participium', // "gerundive"
    }
    
    const perseusVoiceTable: Tabla<Vox> = {
        a: 'activa',
        p: 'passiva',
        d: 'activa', // deponens
    }
    
    const perseusGenderTable: Tabla<Genus> = {
        m: 'masculinum',
        f: 'femininum',
        n: 'neutrum',
    }
    
    const perseusCasusTable: Tabla<Casus> = {
        n: 'nominativus',
        g: 'genetivus',
        d: 'dativus',
        a: 'accusativus',
        v: 'vocativus',
        b: 'ablativus',
        l: 'locativus',
    }
    
    const perseusGradusTable: Tabla<Gradus> = {
        p: 'positivus',
        c: 'comparativus',
        s: 'superlativus',
    }
    
    function parseSeriesPerseum(series?: string): {pars: Pars, status: Status} {
        if (!series) {
            throw new Error('postag string is empty')
        }
        const characters = series.split('')
        const pars = perseusParsTable[characters[0]]
        const persona = perseusPersonaTable[characters[1]]
        const numerus = perseusNumerusTable[characters[2]]
        const [tempus, aspectus] = perseusTenseTable[characters[3]] || [null, null]
        const modus = perseusMoodTable[characters[4]]
        const vox = perseusVoiceTable[characters[5]]
        const genus = perseusGenderTable[characters[6]]
        const casus = perseusCasusTable[characters[7]]
        const gradus = perseusGradusTable[characters[8]]
        
        const status: Status = {
            casus,
            persona,
            numerus,
            tempus,
            aspectus,
            modus,
            vox,
            genus,
            gradus,
        }
        if (pars) {
            return {
                pars,
                status,
            }
        }
        else {
            throw new Error('Cannot determine part of speech for ' + series)
        }
    }
    
    function parseWordElement(word: CheerioElement): KnownTokenAnalysis | null {
        try {
            const parse = parseSeriesPerseum(word.attribs['postag'])
            const { pars, status } = parse
            const analysis: KnownTokenAnalysis = {
                type: 'notus',
                token: word.attribs['form'],
                lemma: word.attribs['lemma'],
                pars,
                status: serializeStatum(pars, status),
            }
            return analysis
        }
        catch (error) {
            console.error(`${word.attribs['form']}: ${error.message}`)
            return null
        }
    }

    const results: KnownTokenAnalysis[][] = []
    const $ = cheerio.load(xml, { xmlMode: true })
    
    for (const sentence of $('body sentence').toArray()) {
        const words = $(sentence).find('word').toArray()
        const analyses: KnownTokenAnalysis[] = words.map(parseWordElement).reduce(removeNullItems, [])
        results.push(analyses)
    }
    return results
}


async function main() {
    let results: KnownTokenAnalysis[][] = []
    const radixPersei = join(
        radixCache, 'perseus_treebank_data', 'v2.1', 'Latin', 'texts',
    )
    const files = await readdirAsync(radixPersei)
    for (const file of files) {
        const via = join(radixPersei, file)
        const text = await readFileAsync(via)
        results = results.concat(translatePerseusTreebank(text.toString()))
    }
    console.info(results.length)
}

main()
