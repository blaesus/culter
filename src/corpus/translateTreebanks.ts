import * as cheerio from 'cheerio'
import { readdirAsync, readFileAsync, writeFileAsync } from 'nodeUtils'
import { radixCache } from 'config'
import { join } from 'path'
import { KnownTokenAnalysis } from 'analysis/analyse'
import {
    Aspectus, Casus, Genus, Gradus, modi, Modus, Numerus, Pars, ParsMinor, Persona, serializeStatum, Status, Tempus,
    Vox
} from 'lexis'
import { removeNullItems } from 'utils'

type Tabula<T> = {[key in string]?: T}

type Mood = Modus | Pars | 'gerundivus' // "gerundive"

function estneModus(s: string): boolean {
    return modi.includes(s as any)
}

function translateMood(mood?: string): {
    parsVera?: Pars
    statusMood?: Status
} {
    if (!mood) {
        return { }
    }
    else if (estneModus(mood)) {
        return {
            parsVera: undefined,
            statusMood: {
                modus: mood as Modus,
            },
        }
    }
    else if (mood === 'gerundivus') {
        return {
            parsVera: 'participium',
            statusMood: {
                tempus: 'futurum',
                vox: 'passiva',
                modus: undefined,
            }
        }
    }
    else {
        return {
            parsVera: mood as Pars,
            statusMood: {
                modus: undefined,
            }
        }
    }
}

function translatePerseusTreebank(xml: string): KnownTokenAnalysis[][] {
    
    const perseusParsTable: Tabula<Pars> = {
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
    
    const perseusPersonaTable: Tabula<Persona> = {
        1: 'prima',
        2: 'secunda',
        3: 'tertia',
    }
    
    const perseusNumerusTable: Tabula<Numerus> = {
        s: 'singularis',
        p: 'pluralis',
    }
    
    const perseusTenseTable: Tabula<[Tempus, Aspectus]> = {
        p: ['praesens', 'imperfectivus'],
        i: ['praeteritum', 'imperfectivus'],
        r: ['praesens', 'perfectivus'],
        l: ['praeteritum', 'perfectivus'],
        t: ['futurum', 'perfectivus'],
        f: ['futurum', 'imperfectivus'],
    }
    
    const perseusMoodTable: Tabula<Mood> = {
        i: 'indicativus',
        s: 'coniunctivus',
        m: 'imperativus',
        n: 'infinitivum',
        p: 'participium',
        d: 'gerundium',
        g: 'gerundivus',
    }
    
    const perseusVoiceTable: Tabula<Vox> = {
        a: 'activa',
        p: 'passiva',
        d: 'activa', // deponens
    }
    
    const perseusGenderTable: Tabula<Genus> = {
        m: 'masculinum',
        f: 'femininum',
        n: 'neutrum',
    }
    
    const perseusCasusTable: Tabula<Casus> = {
        n: 'nominativus',
        g: 'genetivus',
        d: 'dativus',
        a: 'accusativus',
        v: 'vocativus',
        b: 'ablativus',
        l: 'locativus',
    }
    
    const perseusGradusTable: Tabula<Gradus> = {
        p: 'positivus',
        c: 'comparativus',
        s: 'superlativus',
    }
    
    function parseSeriesPerseum(series?: string): {pars: Pars, status: Status} {
        if (!series) {
            throw new Error('postag string is empty')
        }
        const characters = series.split('')
        let pars = perseusParsTable[characters[0]]
        const persona = perseusPersonaTable[characters[1]]
        const numerus = perseusNumerusTable[characters[2]]
        const [tempus, aspectus] = perseusTenseTable[characters[3]] || [null, null]
        const mood = perseusMoodTable[characters[4]]
        const vox = perseusVoiceTable[characters[5]]
        const genus = perseusGenderTable[characters[6]]
        const casus = perseusCasusTable[characters[7]]
        const gradus = perseusGradusTable[characters[8]]
        
        const {parsVera, statusMood} = translateMood(mood)
        
        const status: Status = {
            casus,
            persona,
            numerus,
            tempus,
            aspectus,
            vox,
            genus,
            gradus,
            modus: mood,
            ...statusMood,
        }
        if (pars) {
            return {
                pars: parsVera || pars,
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

function translateProielTreebank(xml: string): KnownTokenAnalysis[][] {
    
    const parsTable: Tabula<[Pars, ParsMinor | undefined]> = {
        'A-': ['nomen-adiectivum', undefined],
        'Df': ['adverbium', undefined],
        'S-': ['articulus', undefined],
        'Ma': ['nomen-adiectivum', undefined], // cardinal number
        'Nb': ['nomen-substantivum', undefined],
        'C-': ['coniunctio', undefined],
        'Pd': ['pronomen', 'pronomen-demonstrativum'],
        'F-': ['alienum', undefined],
        'Px': ['pronomen', undefined], // indefinite pronoun
        'I-': ['interiectio', undefined],
        'Du': ['adverbium', undefined], // interrogative adverb
        'Pi': ['pronomen', 'pronomen-interrogativum'],
        'Mo': ['nomen-adiectivum', undefined], // ordinal numeral
        'Pp': ['pronomen', 'pronomen-personale'],
        'Pk': ['pronomen', 'pronomen-personale'], // personal reflexive pronoun, 'se'
        'Ps': ['pronomen', 'pronomen-possessivum'],
        'Pt': ['pronomen', 'pronomen-possessivum'], // possessive reflexive pronoun, 'suus'
        'R-': ['prepositio', undefined],
        'Ne': ['nomen-substantivum', undefined], // proper noun
        'Dq': ['adverbium', undefined], // relative adverb
        'Pr': ['pronomen', 'pronomen-relativum'],
        'G-': ['coniunctio', undefined],
        'V-': ['verbum', undefined],
        'X-': ['ignotus', undefined],
        
        // 'Py': ['alia', 'quantifier'],
        // 'Pc': ['alia', 'reciprocal-pronoun']
        // 'N-': ['alia', 'signum-infinitivum'],
    }
    
    const personTable: Tabula<Persona> = {
        1: 'prima',
        2: 'secunda',
        3: 'tertia',
        x: undefined,
    }
    
    const numberTable: Tabula<Numerus> = {
        s: 'singularis',
        p: 'pluralis',
        d: undefined, // dual
        x: undefined,
    }
    
    const tenseTable: Tabula<[Tempus, Aspectus]> = {
        p: ['praesens', 'imperfectivus'],
        i: ['praeteritum', 'imperfectivus'],
        r: ['praesens', 'perfectivus'],
        l: ['praeteritum', 'perfectivus'],
        t: ['futurum', 'perfectivus'],
        f: ['futurum', 'imperfectivus'],
        s: undefined, // resultative
        a: undefined, // aorist
        u: undefined, // past
        x: undefined,
    }
    
    const moodTable: Tabula<Mood> = {
        i: 'indicativus',
        s: 'coniunctivus',
        m: 'imperativus',
        o: undefined, // optative
        n: 'infinitivum',
        p: 'participium',
        d: 'gerundium',
        g: 'gerundivus', // gerundive
        u: 'supinum',
        x: undefined, // uncertain
        y: undefined, // finiteness unspecified
        e: undefined, // indicative or subjunctive
        f: undefined, // indicative or imperative
        h: undefined, // subjunctive or imperative
        t: undefined, // finite
    }
    
    const voiceTable: Tabula<Vox> = {
        a: 'activa',
        p: 'passiva',
        m: undefined, // middle
        e: undefined, // middle or passive
        x: undefined,
    }
    
    const genusTable: Tabula<Genus> = {
        m: 'masculinum',
        f: 'femininum',
        n: 'neutrum',
        p: undefined, // masculine or feminine
        o: undefined, // masculine or neuter
        r: undefined, // feminine or neuter
        q: undefined, // masculine, feminine or neuter
        x: undefined,
    }
    
    const caseTable: Tabula<Casus> = {
        n: 'nominativus',
        a: 'accusativus',
        o: undefined, // oblique
        g: 'genetivus',
        c: undefined, // genitive or dative
        e: undefined, // accusative or dative
        d: 'dativus',
        b: 'ablativus',
        i: undefined, // instrumental
        l: 'locativus',
        v: 'vocativus',
        x: undefined,
        z: undefined,
    }
    
    const gradusTable: Tabula<Gradus> = {
        p: 'positivus',
        c: 'comparativus',
        s: 'superlativus',
        x: undefined,
        z: undefined,
    }
    
    function parseStatusString(s: string): {status: Status, pars: Pars | undefined} {
        const characters = s.split('')
        const persona = personTable[characters[0]]
        const numerus = numberTable[characters[1]]
        const [tempus, aspectus] = tenseTable[characters[2]] || [undefined, undefined]
        const mood = moodTable[characters[3]]
        const vox = voiceTable[characters[4]]
        const genus = genusTable[characters[5]]
        const casus = caseTable[characters[6]]
        const gradus = gradusTable[characters[7]]
        const {parsVera: pars, statusMood} = translateMood(mood)
        
        const status: Status = {
            persona,
            numerus,
            tempus,
            aspectus,
            modus: mood,
            vox,
            genus,
            casus,
            gradus,
            ...statusMood,
        }
        return {
            status,
            pars
        }
    }
    
    function parseTokenElement(token: CheerioElement): KnownTokenAnalysis | null {
        const parsParse = parsTable[token.attribs['part-of-speech']]
        if (parsParse) {
            const [pars, parsMinor] = parsParse
            const status = parseStatusString(token.attribs['morphology'])
            const analysis: KnownTokenAnalysis = {
                type: 'notus',
                token: token.attribs['form'],
                lemma: token.attribs['lemma'],
                pars,
                parsMinor,
                status: serializeStatum(pars, status),
            }
            return analysis
        }
        else {
            console.error(`${token.attribs['form']}: cannot deduce pars from ${token.attribs['part-of-speech']}`)
            return null
        }
    }
    
    const results: KnownTokenAnalysis[][] = []
    const $ = cheerio.load(xml, { xmlMode: true})
    for (const sentence of $('source sentence').toArray()) {
        const tokens = $(sentence).find('token').toArray()
        const analyses: KnownTokenAnalysis[] = tokens.map(parseTokenElement).reduce(removeNullItems, [])
        results.push(analyses)
    }
    return results
}


async function main() {
    let results: KnownTokenAnalysis[][] = []
    
    // Perseus
    const radixPersei = join(
        radixCache, 'perseus_treebank_data', 'v2.1', 'Latin', 'texts',
    )
    const filesPersei = await readdirAsync(radixPersei)
    for (const file of filesPersei) {
        const via = join(radixPersei, file)
        const text = await readFileAsync(via)
        results = results.concat(translatePerseusTreebank(text.toString()))
    }
    
    // Proiel
    const radixProiel = join(
        radixCache, 'proiel-treebank'
    )
    const filesProiel = [
        'latin-nt.xml', 'caes-gal.xml', 'cic-att.xml', 'per-aeth.xml'
    ]
    for (const file of filesProiel) {
        const via = join(radixProiel, file)
        const text = await readFileAsync(via)
        results = results.concat(translateProielTreebank(text.toString()))
    }
    
    await writeFileAsync(join(radixCache, 'treebanks.json'), JSON.stringify(results, null, 4))
}

main()
