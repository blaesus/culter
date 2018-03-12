import { join } from 'path'
import * as cheerio from 'cheerio'
import { globAsync, readdirAsync, readFileAsync } from 'nodeUtils'
import { radixCache } from 'config'
import { data } from 'lexis/data'
import {
    Aspectus, Casus, Genus, Gradus, modi, Modus, Numerus, Pars, ParsMinor, Participium, Persona,
    Status, StatusFinitivi, StatusParticipii, Tempus, ThemaVerbi,
    Vox,
} from 'lexis'
import { removeNullItems, stripVoid } from 'utils'
import {
    InflectedFormDesignation, Treebank, TreebankSerialized, TreebankSource,
    TreebankStatistic
} from 'analysis/Model'
import { isRomanNumerals, punctuations } from 'corpus/tokenize'
import { TabulaParticipiorum } from 'analysis/makeTabulamParticipiorum'

type Tabula<T> = {[key in string]?: T}

type Mood = Modus | Pars | 'gerundivus' // "gerundive"

function cleanLemma(lemma: string): string {
    return lemma.replace(/\d/g, '').replace(/\(/g, '').replace(/\)/g, '')
}

function translatePerseusTreebank(xml: string): InflectedFormDesignation[][] {
    
    const perseusParsTable: Tabula<Pars> = {
        n: 'nomen-substantivum',
        v: 'verbum',
        a: 'nomen-adiectivum',
        d: 'adverbium',
        c: 'coniunctio',
        p: 'pronomen',
        i: 'interiectio',
        r: 'praepositio',
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
    
    function parseWordElement(word: CheerioElement): InflectedFormDesignation | null {
        try {
            const parse = parseSeriesPerseum(word.attribs['postag'])
            const { pars, status } = parse
            const analysis: InflectedFormDesignation = {
                forma: word.attribs['form'],
                lemma: cleanLemma(word.attribs['lemma']),
                pars,
                status,
            }
            return analysis
        }
        catch (error) {
            console.error(`${word.attribs['form']}: ${error.message}`)
            return null
        }
    }

    const results: InflectedFormDesignation[][] = []
    const $ = cheerio.load(xml, { xmlMode: true })
    
    for (const sentence of $('body sentence').toArray()) {
        const words = $(sentence).find('word').toArray()
        const analyses: InflectedFormDesignation[] = words.map(parseWordElement).reduce(removeNullItems, [])
        results.push(analyses)
    }
    return results
}

function translateProielTreebank(xml: string): InflectedFormDesignation[][] {
    
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
        'R-': ['praepositio', undefined],
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
    
    function parseStatusString(s: string): Status {
        const characters = s.split('')
        const persona = personTable[characters[0]]
        const numerus = numberTable[characters[1]]
        const [tempus, aspectus] = tenseTable[characters[2]] || [undefined, undefined]
        const mood = moodTable[characters[3]]
        const vox = voiceTable[characters[4]]
        const genus = genusTable[characters[5]]
        const casus = caseTable[characters[6]]
        const gradus = gradusTable[characters[7]]
        
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
        }
        return status
    }
    
    function parseTokenElement(token: CheerioElement): InflectedFormDesignation | null {
        const parsParse = parsTable[token.attribs['part-of-speech']]
        if (parsParse) {
            const [pars, parsMinor] = parsParse
            const status = parseStatusString(token.attribs['morphology'])
            const analysis: InflectedFormDesignation = {
                forma: token.attribs['form'],
                lemma: cleanLemma(token.attribs['lemma']),
                pars,
                parsMinor,
                status,
            }
            return analysis
        }
        else {
            console.error(`${token.attribs['form']}: cannot deduce pars from ${token.attribs['part-of-speech']}`)
            return null
        }
    }
    
    const results: InflectedFormDesignation[][] = []
    const $ = cheerio.load(xml, { xmlMode: true})
    for (const sentence of $('source sentence').toArray()) {
        const tokens = $(sentence).find('token').toArray()
        const analyses: InflectedFormDesignation[] = tokens.map(parseTokenElement).reduce(removeNullItems, [])
        results.push(analyses)
    }
    return results
}

function transformToCulterFormat(result: InflectedFormDesignation): InflectedFormDesignation {

    function estneModus(s: string): boolean {
        return modi.includes(s as any)
    }
    
    function translateStatus(status?: Status): {
        parsVera?: Pars
        statusMood?: Status
    } {
        if (!status) {
            return { }
        }
        const mood = (status as any).modus as Mood
        
        if (estneModus(mood)) {
            return {
                parsVera: undefined,
                statusMood: {
                    modus: mood as Modus,
                },
            }
        }
        if (mood === 'gerundivus') {
            return {
                parsVera: 'participium',
                statusMood: {
                    tempus: 'futurum',
                    vox: 'passiva',
                    modus: undefined,
                }
            }
        }
        if (mood === 'participium') {
            const statusParticipii = status as StatusParticipii & StatusFinitivi
            // "perfective participle" => "past participle"
            if (statusParticipii.tempus === 'praesens' && statusParticipii.aspectus === 'perfectivus') {
                return {
                    parsVera: 'participium',
                    statusMood: {
                        tempus: 'praeteritus',
                        aspectus: undefined,
                        modus: undefined,
                    }
                }
            }
        }
        
        return {
            parsVera: mood as Pars,
            statusMood: {
                modus: undefined,
            }
        }
    }
    
    if (result.status) {
        const status = result.status
        const { parsVera, statusMood } = translateStatus(status)
        const pars = parsVera || result.pars
        const newStatus = stripVoid({
            ...status,
            ...statusMood
        })
        return {
            ...result,
            pars,
            status: newStatus,
        }
    }
    else {
        return result
    }
}

async function getPerseusTreebank(): Promise<Treebank> {
    let results: Treebank = []
    
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
    
    return results
}

async function getProielTreebank(): Promise<Treebank> {
    let results: Treebank = []
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
    
    return results
}

function translateThomisticusTreebank(xml: string): InflectedFormDesignation[][] {
    
    const parsTable: Tabula<Pars> = {
        1: 'nomen-substantivum', // substantivum + adiectivum
        2: 'participium',
        3: 'verbum',
        4: 'praepositio',  //Invariable
        5: undefined,  //Pseudo-lemma
    }
    
    const gradusTable: Tabula<Gradus> = {
        1: 'positivus',
        2: 'comparativus',
        3: 'superlativus',
    }
    
    const voxMoodTable: Tabula<[Vox, Mood]> = {
        A: ['activa', 'indicativus'],
        J: ['passiva', 'indicativus'],
        B: ['activa', 'coniunctivus'],
        K: ['passiva', 'coniunctivus'],
        C: ['activa', 'imperativus'],
        L: ['passiva', 'imperativus'],
        D: ['activa', 'participium'],
        M: ['passiva', 'participium'],
        E: ['activa', 'gerundium'],
        N: ['passiva', 'gerundium'],
        O: ['passiva', 'gerundivus'],
        G: ['activa', 'supinum'],
        P: ['passiva', 'supinum'],
        H: ['activa', 'infinitivum'],
        Q: ['passiva', 'infinitivum'],
    }
    
    const tempusAspectusTable: Tabula<[Tempus, Aspectus]> = {
        1: ['praesens', 'imperfectivus'],
        2: ['praeteritum', 'imperfectivus'],
        3: ['futurum', 'imperfectivus'],
        4: ['praesens', 'perfectivus'],
        5: ['praeteritum', 'perfectivus'],
        6: ['futurum', 'perfectivus'],
    }
    
    const numerusCasusTable: Tabula<[Numerus | undefined, Casus | Pars]> = {
        A: ['singularis', 'nominativus'],
        J: ['pluralis', 'nominativus'],
        B: ['singularis', 'genetivus'],
        K: ['pluralis', 'genetivus'],
        C: ['singularis', 'dativus'],
        L: ['pluralis', 'dativus'],
        D: ['singularis', 'accusativus'],
        M: ['pluralis', 'accusativus'],
        E: ['singularis', 'vocativus'],
        N: ['pluralis', 'vocativus'],
        F: ['singularis', 'ablativus'],
        O: ['pluralis', 'ablativus'],
        G: [undefined, 'adverbium'],
        // H: Casus “plurimus”
    }
    
    const table8: Tabula<[Genus | undefined, Persona | undefined, Numerus | undefined]> = {
        1: ['masculinum', undefined, undefined],
        2: ['femininum', undefined, undefined],
        3: ['neutrum', undefined, undefined],
        4: [undefined, 'prima', 'singularis'],
        5: [undefined, 'secunda', 'singularis'],
        6: [undefined, 'tertia', 'singularis'],
        7: [undefined, 'prima', 'pluralis'],
        8: [undefined, 'secunda', 'pluralis'],
        9: [undefined, 'tertia', 'pluralis'],
    }
    
    function isPunctuation(s: string): boolean {
        return punctuations.includes(s)
    }
    
    function parseTag(tag: string, forma: string): {pars: Pars, status: Status} | null {
        const characters = tag.split('')
        let pars = parsTable[characters[0]]
        if (!pars) {
            if (isPunctuation(forma)) {
                pars = 'punctum'
            }
            else if (isRomanNumerals(forma)) {
                pars = 'nomen-adiectivum' // TODO: proper roman numeral handling
            }
        }
        let gradus = gradusTable[characters[1]] || gradusTable[characters[5]]
        let [vox, mood] = voxMoodTable[characters[3]] || [undefined, undefined]
        let [tempus, aspectus] = tempusAspectusTable[characters[4]] || [undefined, undefined]
        let [numerusNominis, casus] = numerusCasusTable[characters[6]] || [undefined, undefined]
        let [genus, persona, numerusVerbi] = table8[characters[7]] || [undefined, undefined, undefined]
        const numerus = numerusNominis || numerusVerbi
        if (casus === 'adverbium') {
            pars = 'adverbium'
            casus = undefined
        }
        if (pars) {
            return {
                pars,
                status: {
                    gradus,
                    tempus,
                    aspectus,
                    vox,
                    modus: mood,
                    numerus,
                    casus,
                    genus,
                    persona,
                }
            }
        }
        else {
            console.error(`${forma}: cannot guess pars`)
            return null
        }
    }
    
    const $ = cheerio.load(xml, { xmlMode: true })
    
    function parseWordElement(element: CheerioElement): InflectedFormDesignation | null{
        
        const forma = $(element).find('form').first().text()
        const lemma = cleanLemma($(element).find('lemma').first().text())
        const parse = parseTag($(element).find('tag').first().text(), forma)
        if (parse) {
            const { pars, status } = parse
            return {
                forma,
                lemma,
                pars,
                status,
            }
            
        }
        return null
    }
    
    const results: InflectedFormDesignation[][] = []
    $('s').each((sentenceIndex, sentence) => {
        const analyses: InflectedFormDesignation[] = []
        $(sentence).find('m').each((wordIndex, word) => {
            const analysis = parseWordElement(word)
            if (analysis) {
                analyses.push(analysis)
            }
        })
        results.push(analyses)
    })
    return results
}

async function getThomisticusTreebank(): Promise<Treebank> {
    let results: Treebank = []
    const radixThomisticus = join(
        radixCache,
        '15-01-2018_all_resources_all_formats',
        'IT-TB_PML_analytical-tectogrammatical_150118',
        'IT-TB_PML_analytical_150118',
    )
    const viae = await globAsync(join(radixThomisticus, '**', '*.m'))
    for (const via of viae) {
        const text = await readFileAsync(via)
        results = results.concat(translateThomisticusTreebank(text.toString()))
    }
    
    return results
}

function reformat(treebank: Treebank): Treebank {
    return treebank.map(sentence => sentence.map(transformToCulterFormat))
}

function translateLemmaParticipii(treebank: Treebank, tabulaParticipiorum: TabulaParticipiorum): Treebank {
    return treebank.map(sentence => sentence.map(designation => {
        if (designation.pars === 'participium') {
            const lemmaParticipium = tabulaParticipiorum[designation.lemma]
            if (lemmaParticipium) {
                return {
                    ...designation,
                    lemma: lemmaParticipium,
                }
            }
            console.info('Cannot find lemma participii of', designation.lemma)
        }
        return designation
    }))
}

function count(treebank: Treebank): TreebankStatistic {
    return {
        sentence: treebank.length,
        token: treebank.map(sentence => sentence.length).reduce((a, b) => a + b, 0)
    }
}

const treebankGetters: {[key in TreebankSource]: () => Promise<Treebank>} = {
    perseus: getPerseusTreebank,
    proiel: getProielTreebank,
    thomisticus: getThomisticusTreebank,
}

async function main() {
    const argv = process.argv[2]
    let sources: TreebankSource[] = ['perseus', 'proiel', 'thomisticus']
    if (argv) {
        sources = [argv as TreebankSource]
    }
    const tabulamThematum = await data.getTabulamParticipiorum()
    for (const source of sources) {
        const rawTreebank = await treebankGetters[source]()
        const treebank = translateLemmaParticipii(reformat(rawTreebank), tabulamThematum)
        const statistics = count(treebank)
        const treebankDump: TreebankSerialized = {
            statistics,
            treebank,
        }
        console.info(`Saving ${source}`, statistics)
        await data.saveTreebank(treebankDump, source)
    }
}

main()
