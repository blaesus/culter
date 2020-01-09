import * as cheerio from 'cheerio'
import * as deepmerge from 'deepmerge'
import {
    Adverbium,
    Coniunctio,
    getBaseLexem,
    getLexicographiamCommunem,
    Gradus,
    Inflectiones,
    Interiecio,
    LexicographiaAdiectivum,
    LexicographiaLexisCommunis,
    LexicographiaLSubstantivi,
    LexicographiaVerbi,
    Lexis,
    Littera,
    NomenAdiectivum,
    NomenSubstantivum,
    ParsMinor,
    Participium,
    Postpositio,
    Praepositio,
    Pronomen,
    StatusAdverbii,
    Tempus,
    Verbum,
    Vox
} from 'lexis'
import { LANG } from 'config'
import {
    AuxiliaryOutcomeTabulaeVerbi,
    parseTabluamVerbiWiktionary,
    TabulaeInformatio,
} from './tabulae/wiktionaryVerbTable'
import { flatten, loggingProxy } from 'utils'
import { parseTabluamSubstantivum } from './tabulae/wiktionaryNounTable'
import { parseTabluamAdiectivi } from './tabulae/wiktionaryAdjectiveTable'
import { parseTabluamParticipii } from './tabulae/wiktionaryParticipleTable'
import { parseTabluamPronominis } from './tabulae/wiktionaryPronounTable'
import { serializeStatum } from 'serialization'

const nbsp = '\xa0'

type ErrorCode = 'no-entry' | 'no-relevant-entry'

type PartsWiktionary =
    'Verb'
    | 'Noun'
    | 'Proper noun'
    | 'Pronoun'
    | 'Adjective'
    | 'Adverb'
    | 'Conjunction'
    | 'Numeral'
    | 'Determiner'
    | 'Participle'
    | 'Anagrams'
    | 'Suffix'
    | 'Preposition'
    | 'Postposition'
    | 'Particle'
    | 'Article'
    | 'Letter'
    | 'Interjection'

export function getRedirectedLemma(html: string): string {
    const $ = cheerio.load(html)
    return $('#did-you-mean').text()
}

function getMeanings(node: CheerioElement, $: CheerioStatic): string[] {
    return $(node).children().toArray().map(child => {
        const text = $(child).text()
        const examples = $(child).children().toArray().map(grandchild => {
            if (grandchild.tagName === 'ul' || grandchild.tagName === 'dl') {
                return $(grandchild).text()
            }
            else {
                return ''
            }
        })
        let textWithoutExamples = text
        for (const example of examples) {
            textWithoutExamples = textWithoutExamples.replace(example, '')
        }
        return textWithoutExamples.replace(/\n/g, '')
    }).filter(Boolean)
}

type GeneralSection =
    'Etymology'
    | 'Pronunciation'
    | 'References'
    | 'Alternative forms'
    | 'See also'
    | 'Further reading'
    | 'Usage notes'
    | 'Declension'
    | 'Descendants'
    | 'Derived terms'
    | 'Inflection'
    | 'Related terms'
    | 'Quotations'
    | 'Coordinate terms'
    | 'Usage notes'
    | 'Synonyms'

type Section = GeneralSection | PartsWiktionary

function getGeneralSection(s: string | null): GeneralSection | null {
    if (s === 'Etymology'
        || s === 'Pronunciation'
        || s === 'References'
        || s === 'See also'
        || s === 'Further reading'
        || s === 'Alternative forms'
        || s === 'Usage notes'
        || s === 'Declension'
        || s === 'Descendants'
        || s === 'Derived terms'
        || s === 'Inflection'
        || s === 'Related terms'
        || s === 'Quotations'
        || s === 'Coordinate terms'
        || s === 'Usage notes'
        || s === 'Synonyms'
    ) {
        return s
    }
    else {
        return null
    }
}

function translateWiktionarySession(s: GeneralSection): keyof LexicographiaLexisCommunis | null {
    switch (s) {
        case 'Etymology':
            return 'etymologia'
        case 'Pronunciation':
            return 'pronunciatio'
        case 'References':
            return 'references'
        case 'Declension':
            return null
        case 'Descendants':
            return null
        case 'Usage notes':
            return null
        default: {
            throw new Error(`Unexpected general session: ${s}`)
        }
    }
}

function getWiktionaryPart(s: string | null): PartsWiktionary | null {
    if (s === 'Noun'
        || s === 'Verb'
        || s === 'Proper noun'
        || s === 'Pronoun'
        || s === 'Adjective'
        || s === 'Adverb'
        || s === 'Conjunction'
        || s === 'Numeral'
        || s === 'Determiner'
        || s === 'Participle'
        || s === 'Anagrams'
        || s === 'Suffix'
        || s === 'Preposition'
        || s === 'Postposition'
        || s === 'Particle'
        || s === 'Article'
        || s === 'Letter'
        || s === 'Interjection'
    ) {
        return s
    }
    else {
        return null
    }
}

function translateWiktionaryPart(part: PartsWiktionary): Lexis['pars'] {
    switch (part) {
        case 'Verb':
            return 'verbum'
        case 'Noun':
            return 'nomen-substantivum'
        case 'Pronoun':
            return 'pronomen'
        case 'Proper noun':
            return 'nomen-substantivum'
        case 'Adjective':
            return 'nomen-adiectivum'
        case 'Adverb':
            return 'adverbium'
        case 'Conjunction':
            return 'coniunctio'
        case 'Numeral':
            return 'nomen-adiectivum'
        case 'Determiner':
            return 'nomen-adiectivum'
        case 'Participle':
            return 'participium'
        case 'Preposition':
            return 'praepositio'
        case 'Particle':
            return 'particula'
        case 'Postposition':
            return 'postpositio'
        case 'Letter':
            return 'littera'
        case 'Interjection':
            return 'interiectio'
        case 'Article':
            return 'articulus'
        default: {
            throw new Error(`Not know how to proceed with wiktionary part ${part}`)
        }
    }
    
}

function getSection(s: string): Section {
    s = s.replace(/(\d)/g, '').trim()
    const generalSection = getGeneralSection(s)
    const partsSection = getWiktionaryPart(s)
    if (generalSection) {
        return generalSection
    }
    else if (partsSection) {
        return partsSection
    }
    else {
        throw new Error(`Unexpected section: '${s}'`)
    }
}

function translateVerbalThemeVowel(s: string, lemma: string): LexicographiaVerbi['thema'] {
    switch (s) {
        case 'first':
            return 'ā'
        case 'second':
            return 'ē'
        case 'third':
            return lemma.endsWith('iō') ? 'e' : 'consonans'
        case 'fourth':
            return 'ī'
        case 'irregular':
            return 'irregularis'
        default: {
            throw new Error(`Unexpected verbal theme ${s}`)
        }
    }
}

function translateNominalThemeVowel(s: string): LexicographiaLSubstantivi['thema'] {
    switch (s) {
        case 'first':
            return 'a'
        case 'second':
            return 'o'
        case 'third':
            return 'consonans'
        case 'fourth':
            return 'u'
        case 'fifth':
            return 'e'
        case 'irregular':
            return 'irregularis'
        case '':
            return 'ignota'
        default: {
            throw new Error(`Unexpected nominal theme ${s}`)
        }
    }
}

type BriefParser<T extends Lexis> = (node: CheerioElement, $: CheerioStatic) => BriefInformatio<T>

const parseVerbBrief: BriefParser<Verbum> = (node, $) => {
    const s = $(node).text()
    const deponens = s.includes('deponent')
    const semiDeponens = s.includes('semi-deponent')
    const noPassive = s.includes('no passive')
    const noPerfect = s.includes('no perfect')
    const lemma = $(node).find('.headword').text()
    const formaeAltrae = $(node).find('b[lang=la]').toArray().map(b => $(b).text())
    const radices = [lemma, ...formaeAltrae]
    const thema = translateVerbalThemeVowel(
        $(node).find('a:contains(conjugation)').text().replace(' conjugation', ''),
        lemma
    )
    return {
        lexis: {},
        lexicographia: {
            lemma,
            thema,
            radices,
            noPassive,
            numquamPerfectum: noPerfect,
            deponens: semiDeponens ? 'semi-deponens' : deponens ? 'deponens' : 'non-deponens',
        }
    }
}

function translateNominalGender(s: string): {
    genera: NomenSubstantivum['genera'],
    pluralisSolum: boolean
} {
    const [genera, pluralis] = s.split(nbsp)
    const pluralisSolum = pluralis === 'pl'
    switch (genera) {
        case 'm':
            return {
                genera: ['masculinum'],
                pluralisSolum,
            }
        case 'f':
            return {
                genera: ['femininum'],
                pluralisSolum,
            }
        case 'n':
            return {
                genera: ['neutrum'],
                pluralisSolum,
            }
        case 'm, f':
            return {
                genera: ['masculinum', 'femininum'],
                pluralisSolum,
            }
        case 'f, m':
            return {
                genera: ['femininum', 'masculinum'],
                pluralisSolum,
            }
        case 'm or f':
            return {
                genera: ['masculinum', 'femininum'],
                pluralisSolum,
            }
        case '?': {
            return {
                genera: [],
                pluralisSolum,
            }
        }
        case '': {
            return {
                genera: [],
                pluralisSolum,
            }
        }
        default: {
            throw new Error(`Cannot parse gender ${s}`)
        }
    }
}

const parseNounBrief: BriefParser<NomenSubstantivum> = (node, $) => {
    const lemma = $(node).find('.headword').text()
    const regexAltra = /\(genitive (.*)\)/
    const match = regexAltra.exec($(node).text())
    let formaAltra = match && match[1]
    const radices = formaAltra ? [lemma, formaAltra] : [lemma]
    
    const generaEtNumerus = $(node).find('.gender').text()
    const {genera, pluralisSolum} = translateNominalGender(generaEtNumerus)
    const declension = $(node).find('[title*=declension]').text().split(' ')[0]
    const thema = translateNominalThemeVowel(declension)
    const immutabile = $(node).find('a[title=indeclinable]').length
    const parsMinor: ParsMinor | undefined = immutabile ? 'nomen-immutabile' : undefined
    const inflectiones: Inflectiones<NomenSubstantivum> = {
        [serializeStatum('nomen-substantivum', {}, {parsMinor})]:
            [lemma]
    }
    return {
        lexis: {
            genera,
            parsMinor,
            inflectiones,
        },
        lexicographia: {
            lemma,
            radices,
            thema,
            pluralisSolum,
        }
    }
    // throw new Error(`Cannot parse nominal brief ${s}`)
}

const parsePronounBrief: BriefParser<Pronomen> = (node, $) => {
    const lemma = $(node).find('.headword, .infl-inline').text()
    const formaeAltrae = $(node).find('b[lang=la]').toArray().map(b => $(b).text())
    const fallbackInflectiones: Inflectiones<Pronomen> = {
        [serializeStatum('pronomen', {})]: [lemma]
    }
    return {
        lexis: {
            inflectiones: fallbackInflectiones
        },
        lexicographia: {
            lemma,
            radices: [lemma, ...formaeAltrae],
        }
    }
}

function translateAdjectivalThema(s: string): LexicographiaAdiectivum['thema'] {
    switch (s) {
        case 'firstsecond':
            return 'a'
        case 'firstsecond-declension':
            return 'a'
        case 'third-declension':
            return 'consonans'
        default: {
            throw new Error(`Unexpected adjectival theme ${s}`)
        }
    }
}

const parseAdjectiveBrief: BriefParser<NomenAdiectivum> = (node, $) => {
    const lemma = $(node).find('.headword').text()
    if ($(node).find('[title*=indeclinable]').length || $(node).text().includes("indeclinable")) {
        return {
            lexis: {},
            lexicographia: {
                parsMinor: 'adiectivum-immutable',
                lemma,
                radices: [lemma],
            },
            thema: 'alia'
        }
    }
    else {
        const declension = $(node).find('[title*=declension]').text().split(' ')[0]
        let thema: LexicographiaAdiectivum['thema'] = 'alia'
        if (lemma.endsWith('dam')) {
            thema = 'alia'
        }
        else {
            thema = translateAdjectivalThema(declension)
        }
        const formaeAltrae = $(node).find('b[lang=la]').toArray().map(b => $(b).text())
        return {
            lexis: {},
            lexicographia: {
                lemma,
                radices: [lemma, ...formaeAltrae],
                thema,
            }
        }
    }
}

const parseAdverbBrief: BriefParser<Adverbium> = (node, $) => {
    const s = $(node).text()
    const lemma = $(node).find('.headword').first().text()
    const formaeAltrae = $(node).find('b[lang=la]').toArray().map(b => $(b).text())
    const radices = [lemma, ...formaeAltrae]
    const nonComparabilis: boolean = s.includes('not comparable')
    let inflectiones: Inflectiones<Adverbium> = {}
    if (radices.length === 3) {
        inflectiones = {
            [serializeStatum<StatusAdverbii>('adverbium', {gradus: 'positivus'})]: [radices[0]],
            [serializeStatum<StatusAdverbii>('adverbium', {gradus: 'comparativus'})]: [radices[1]],
            [serializeStatum<StatusAdverbii>('adverbium', {gradus: 'superlativus'})]: [radices[2]],
        }
    }
    else {
        inflectiones = {
            [serializeStatum<StatusAdverbii>('adverbium', {gradus: 'positivus'})]: [lemma],
        }
    }
    return {
        lexis: {
            inflectiones: inflectiones
        },
        lexicographia: {
            lemma,
            radices,
            comparabilis: !nonComparabilis,
        }
    }
}

type HeadwordOnlyLexis = Coniunctio | Praepositio | Postpositio | Participium | Littera | Interiecio

function headwordExtractor(pars: HeadwordOnlyLexis['pars']): BriefParser<HeadwordOnlyLexis> {
    const parser: BriefParser<HeadwordOnlyLexis> = (node, $) => {
        const lemma = $(node).find('.headword').text() || $(node).find('b').text()
        const informatio: BriefInformatio<HeadwordOnlyLexis> = {
            lexis: {
                inflectiones: {
                    [serializeStatum(pars, {})]: [lemma]
                },
            },
            lexicographia: {
                lemma: lemma,
                radices: [lemma],
            }
        }
        return informatio
    }
    return parser
}

function guessParticipleTemporem(s: string): Tempus {
    if (s.includes('present')) {
        return 'praesens'
    }
    else if (s.includes('perfect') || s.includes('past')) {
        return 'praeteritum'
    }
    else if (s.includes('future')) {
        return 'futurum'
    }
    else {
        throw new Error(`Cannot guess participle time from ${s}`)
    }
}

function guessOriginalVerb(node: CheerioElement, $: CheerioStatic): string {
    return $(node).find('.Latn.mention').text()
}

interface LexemeGroupParserState {
    section: Section | null
    multiEtymologies: boolean
    incomingBrief: boolean
    parsingResult: Lexis
    auxiliaryParsingResults: Lexis[]
    
    participium: {
        tempus: Tempus
        vox: Vox
    } | null
    
    adiectivum: {
        gradus: Gradus
    }
}

type BriefInformatio<LexisT extends Lexis> = {
    lexis: Partial<LexisT>
    lexicographia: Partial<LexisT['lexicographia']>
}

const briefParsers: {[part in Section]?: (node: CheerioElement, $: CheerioStatic) => BriefInformatio<Lexis>} = {
    Noun: parseNounBrief,
    'Proper noun': parseNounBrief,
    Pronoun: parsePronounBrief,
    Verb: parseVerbBrief,
    Adjective: parseAdjectiveBrief,
    Adverb: parseAdverbBrief,
    Determiner: parsePronounBrief,
    Numeral: parseAdjectiveBrief,
    Conjunction: headwordExtractor('coniunctio'),
    Participle: parseAdjectiveBrief,
    Preposition: headwordExtractor('praepositio'),
    Particle: headwordExtractor('participium'),
    Article: parsePronounBrief,
    Postposition: headwordExtractor('postpositio'),
    Letter: headwordExtractor('littera'),
    Interjection: headwordExtractor('interiectio')
}

function parsePartBrief(section: Section, node: CheerioElement, $: CheerioStatic): BriefInformatio<Lexis> {
    const parser = briefParsers[section]
    if (!parser) {
        throw new Error(`Section without parser: ${section}`)
    }
    const result: BriefInformatio<Lexis> = parser(node, $)
    if (!result.lexicographia.lemma) {
        throw new Error(`Parser output empty lemma for ${$(node).text()}`)
    }
    return result
}

function getInitLexis(pars: Lexis['pars']): Lexis {
    switch (pars) {
        case 'nomen-substantivum': {
            return {
                ...getBaseLexem(LANG),
                pars: 'nomen-substantivum',
                genera: [],
                lexicographia: {
                    ...getLexicographiamCommunem(),
                    thema: 'a',
                    pluralisSolum: false,
                },
            }
        }
        case 'nomen-adiectivum': {
            return {
                ...getBaseLexem(LANG),
                pars: 'nomen-adiectivum',
                lexicographia: {
                    ...getLexicographiamCommunem(),
                    thema: 'a',
                    lemmataAlii: {
                        comparativus: '',
                        superlativus: '',
                    }
                },
            }
        }
        case 'pronomen': {
            return {
                ...getBaseLexem(LANG),
                pars: 'pronomen',
                parsMinor: 'pronomen-demonstrativum',
                lexicographia: {
                    ...getLexicographiamCommunem(),
                },
            }
        }
        case 'verbum': {
            return {
                ...getBaseLexem(LANG),
                pars: 'verbum',
                lemmataAlii: {
                    supinum: null,
                    gerundium: null,
                    participii: {},
                    infinitivum: null,
                },
                lexicographia: {
                    ...getLexicographiamCommunem(),
                    thema: 'ā',
                    deponens: 'non-deponens',
                    numquamPerfectum: false,
                },
            }
        }
        case 'gerundium': {
            return {
                ...getBaseLexem(LANG),
                pars: 'gerundium',
                lexicographia: {
                    ...getLexicographiamCommunem(),
                    lemmaVerbi: '',
                },
            }
        }
        case 'supinum': {
            return {
                ...getBaseLexem(LANG),
                pars: 'supinum',
                lexicographia: {
                    ...getLexicographiamCommunem(),
                    lemmaVerbi: '',
                },
            }
        }
        case 'participium': {
            return {
                ...getBaseLexem(LANG),
                pars: 'participium',
                lexicographia: {
                    ...getLexicographiamCommunem(),
                    lemmaVerbi: '',
                },
            }
        }
        case 'adverbium': {
            return {
                ...getBaseLexem(LANG),
                pars: 'adverbium',
                lexicographia: {
                    ...getLexicographiamCommunem(),
                    nonComparabilis: false,
                },
            }
        }
        case 'coniunctio': {
            return {
                ...getBaseLexem(LANG),
                pars: 'coniunctio',
            }
        }
        case 'praepositio': {
            return {
                ...getBaseLexem(LANG),
                pars: 'praepositio',
            }
        }
        case 'particula': {
            return {
                ...getBaseLexem(LANG),
                pars: 'particula',
            }
        }
        case 'postpositio': {
            return {
                ...getBaseLexem(LANG),
                pars: 'postpositio',
            }
        }
        case 'littera': {
            return {
                ...getBaseLexem(LANG),
                pars: 'littera',
            }
        }
        case 'interiectio': {
            return {
                ...getBaseLexem(LANG),
                pars: 'interiectio',
            }
        }
        case 'articulus': {
            return {
                ...getBaseLexem(LANG),
                pars: 'articulus',
            }
        }
        case 'ignotus': {
            return {
                ...getBaseLexem(LANG),
                pars: 'ignotus',
            }
        }
        default: {
            throw new Error(`Do not know how to initialize pars ${pars}`)
        }
    }
}

function parseComparativeAndSuperlative(node: CheerioElement, $: CheerioStatic): LexicographiaAdiectivum['lemmataAlii'] | null {
    let comparativus = ''
    let superlativus = ''
    const nodes = $(node).children('li').children('*').toArray()
    for (let i = 0; i < nodes.length; i += 1) {
        if ($(nodes[i]).text() === 'comparative') {
            comparativus = $(nodes[i + 1]).text()
        }
        if ($(nodes[i]).text() === 'superlative') {
            superlativus = $(nodes[i + 1]).text()
        }
    }
    if (comparativus && superlativus) {
        return {
            comparativus,
            superlativus
        }
    }
    else {
        return null
    }
}

function error(code: ErrorCode): void {
    throw new Error(code)
}

interface WiktionaryHtmlData {
    main: Lexis[]
    auxiliary: Lexis[]
}

const NODE_SELECTOR = 'div.mw-parser-output > *'

export function removeIrrelevantNodes($: CheerioStatic,
                                      languageId: string): void {
    const allNodes = $(NODE_SELECTOR).toArray()
    
    // Remove other languages
    let isLanguageWanted = false
    for (const node of allNodes) {
        if (node.tagName === 'h2') {
            const firstChild = $(node).children()[0]
            isLanguageWanted = !!firstChild && $(firstChild).attr('id') === languageId
        }
        if (!isLanguageWanted) {
            $(node).remove()
        }
    }
}

// Hack to smooth over irregularities and inconsistencies in Wiktioanry writing
export function removeProblematicNodes($: CheerioStatic) {
    const allNodes = $(NODE_SELECTOR).toArray()
    for (let i = 0; i < allNodes.length; i += 1) {
        const node = allNodes[i]
        const lookAhead = allNodes[i + 1]
        if ($(node).text() === 'Declension') {
            $(node).remove()
            if (lookAhead
                && lookAhead.tagName === 'p'
                && !$(lookAhead).text().includes('comparative variant')
            ) {
                $(lookAhead).remove()
            }
        }
        if (lookAhead && isRedirection(lookAhead, $) && $(node).find('.gender').length > 0) {
            $(node).remove()
            $(lookAhead).remove()
        }
    }
}

export function parseWiktionaryLexemeGroup(nodes: CheerioElement[], $: CheerioStatic): WiktionaryHtmlData {
    if (nodes.length === 0) {
        error('no-relevant-entry')
    }
    const state: LexemeGroupParserState = loggingProxy({
        section: null,
        incomingBrief: false,
        multiEtymologies: false,
        parsingResult: getInitLexis('ignotus'),
        auxiliaryParsingResults: [],
        participium: null,
        adiectivum: {
            gradus: 'positivus' as 'positivus'
        },
    }, 'state')

    function isEtymologyDescriptionOfParticipium(text: string): boolean {
        // Need to tell part "Present active participle of amō (“love”)."
        // and "Apparently denominative from Proto-Indo-European *ph₁-tós, participle of *peh₁- (“to hurt”)."
        return text.includes('participle') && text.length < 100
    }
    
    function initParsingResult(part: PartsWiktionary) {
        const initData = getInitLexis(translateWiktionaryPart(part))
        state.parsingResult = deepmerge(
            getInitLexis(translateWiktionaryPart(part)),
            {
                ...state.parsingResult,
                pars: initData.pars,
            }
        )
        state.incomingBrief = true
    }
    
    for (const node of nodes) {
        switch (node.tagName) {
            case 'h3': {
                const header = $($(node).children()[0]).text().trim()
                state.section = getSection(header)
                
                const multiEtymologyRegex = /Etymology\s(\d)/
                const match = multiEtymologyRegex.exec(header)
                if (match) {
                    state.section = 'Etymology'
                    state.multiEtymologies = true
                    state.incomingBrief = false
                }
                else if (header === 'Etymology') {
                    state.section = 'Etymology'
                }
                
                const part = getWiktionaryPart(state.section)
                if (part) {
                    initParsingResult(part)
                    state.incomingBrief = true
                }
                break
            }
            case 'h4': {
                if (state.multiEtymologies) {
                    const header = $($(node).children()[0]).text().trim()
                    state.section = getSection(header)
                    const part = getWiktionaryPart(state.section)
                    if (part) {
                        initParsingResult(part)
                        state.incomingBrief = true
                    }
                }
                break
            }
            case 'p': {
                const text = $(node).text()
                const generalSection = getGeneralSection(state.section)
                if (generalSection) {
                    const field = translateWiktionarySession(generalSection)
                    if (field) {
                        const lexis = state.parsingResult
                        if (lexis.lexicographia) {
                            lexis.lexicographia[field] = [
                                ...lexis.lexicographia[field],
                                text
                            ]
                        }
                    }
                }
                const partsSection = getWiktionaryPart(state.section)
                if (partsSection) {
                    // Brief
                    if (state.incomingBrief) {
                        const informatio = parsePartBrief(partsSection, node, $)
                        state.parsingResult = {
                            ...state.parsingResult,
                            ...(informatio.lexis as any),
                            lexicographia: {
                                ...state.parsingResult.lexicographia,
                                ...informatio.lexicographia,
                            } as any // TODO: Check better typing
                        }
                        state.incomingBrief = false
                    }
                }
                if (generalSection === 'Etymology' && isEtymologyDescriptionOfParticipium(text)) {
                    const loweredText = text.toLowerCase()
                    state.participium = {
                        vox: loweredText.includes('passive') ? 'passiva' : 'activa',
                        tempus: guessParticipleTemporem(loweredText),
                    }
                    const target = state.parsingResult as Participium
                    state.parsingResult.lexicographia = {
                        ...target.lexicographia,
                        lemmaVerbi: guessOriginalVerb(node, $),
                    }
                    state.parsingResult.lexicographia.lemmataAlterae = ['he']
                }
                if (text.includes('comparative variant')) {
                    state.adiectivum = {
                        gradus: 'comparativus'
                    }
                }
                break
            }
            case 'ol': {
                const meanings = getMeanings(node, $)
                if (state.section) {
                    const partsSection = getWiktionaryPart(state.section)
                    if (partsSection) {
                        state.parsingResult = {
                            ...state.parsingResult,
                            interpretationes: {
                                ...state.parsingResult.interpretationes,
                                [LANG]: meanings.map(meaning => ({
                                    significatio: meaning,
                                    exempli: []
                                }))
                            },
                        }
                        if (partsSection === 'Adjective') {
                            if ($(node).find('.form-of-definition').text().includes('superlative degree')) {
                                state.adiectivum.gradus = 'superlativus'
                            }
                        }
                    }
                }
                break
            }
            case 'table': {
                switch (state.section) {
                    case 'Noun': {
                        const inflectiones = parseTabluamSubstantivum(node, $)
                        const target = state.parsingResult as NomenSubstantivum
                        target.inflectiones = inflectiones
                        break
                    }
                    case 'Proper noun': {
                        const inflectiones = parseTabluamSubstantivum(node, $)
                        const target = state.parsingResult as NomenSubstantivum
                        target.inflectiones = inflectiones
                        break
                    }
                    case 'Verb': {
                        const {verbum, infinitivum, participii, gerundium, supinum} =
                            parseTabluamVerbiWiktionary(node, $)
                        const target = state.parsingResult as Verbum
                        target.inflectiones = verbum.inflectiones
                        
                        function inflateLemma(data: TabulaeInformatio<AuxiliaryOutcomeTabulaeVerbi>): AuxiliaryOutcomeTabulaeVerbi {
                            return ({
                                ...getBaseLexem(LANG),
                                pars: data.pars as any,
                                inflectiones: data.inflectiones,
                                lexicographia: {
                                    ...getLexicographiamCommunem(),
                                    lemma: data.lemma,
                                    lemmaVerbi: target.lexicographia.lemma,
                                },
                            })
                            
                        }
                        
                        if (supinum) {
                            state.auxiliaryParsingResults.push(inflateLemma(supinum))
                        }
                        if (infinitivum) {
                            state.auxiliaryParsingResults.push(inflateLemma(infinitivum))
                        }
                        if (gerundium) {
                            state.auxiliaryParsingResults.push(inflateLemma(gerundium))
                        }
                        target.lemmataAlii = {
                            supinum: supinum ? supinum.lemma : null,
                            gerundium: gerundium ? gerundium.lemma : null,
                            infinitivum: infinitivum ? infinitivum.lemma : null,
                            participii,
                        }
                        break
                    }
                    case 'Adjective': {
                        const inflectiones = parseTabluamAdiectivi(node, $, state.adiectivum.gradus)
                        const target = state.parsingResult as NomenAdiectivum
                        target.inflectiones = inflectiones
                        break
                    }
                    case 'Pronoun': {
                        const inflectiones = parseTabluamPronominis(node, $, state.parsingResult.parsMinor)
                        const target = state.parsingResult as Pronomen
                        target.inflectiones = inflectiones
                        break
                    }
                    case 'Determiner': {
                        const inflectiones = parseTabluamAdiectivi(node, $)
                        const target = state.parsingResult as Pronomen
                        target.inflectiones = inflectiones
                        break
                    }
                    case 'Participle': {
                        if (!state.participium) {
                            // Guess participle tempus and vox when the information cannot be gathered from page
                            const lemma = state.parsingResult.lexicographia.lemma
                            if (lemma.endsWith('ns')) {
                                state.participium = {
                                    tempus: "praesens",
                                    vox: "activa"
                                }
                            }
                            else if (lemma.endsWith('urus')) {
                                state.participium = {
                                    tempus: "futurum",
                                    vox: "activa"
                                }
                            }
                            else if (lemma.endsWith('us')) {
                                state.participium = {
                                    tempus: "praeteritum",
                                    vox: "passiva"
                                }
                            }
                            else {
                                throw new Error('Encountered participle content without knowing its tempus and vox')
                            }
                        }
                        const inflectiones = parseTabluamParticipii(node, $, state.participium.vox, state.participium.tempus)
                        const target = state.parsingResult as Participium
                        target.inflectiones = inflectiones
                        break
                    }
                }
                break
            }
            case 'ul': {
                if (state.section === 'Adjective') {
                    const lemmata = parseComparativeAndSuperlative(node, $)
                    if (lemmata) {
                        const target = state.parsingResult as NomenAdiectivum
                        target.lexicographia = {
                            ...target.lexicographia,
                            lemmataAlii: lemmata
                        }
                    }
                }
                break
            }
            default: {
            }
        }
    }
    
    if (state.parsingResult.pars === 'ignotus') {
        throw new Error('Unkonwn pars unprocessed')
    }
    
    return {
        main: [state.parsingResult],
        auxiliary: state.auxiliaryParsingResults,
    }
}

function isRedirection(node: CheerioElement, $: CheerioStatic): boolean {
    const listItems = $(node).children('li').toArray()
    return node.tagName === 'ol'
        && listItems.length > 0
        && listItems.every(li => {
                const definition = $(li).find('.form-of-definition')
                const definitionText = definition.text()
                const isRedirection =
                    definition.length
                    && definitionText
                    && !definitionText.includes('Alternative form of')
                    && !definitionText.includes('Alternative spelling of')
                    && !definitionText.includes('superlative degree of')
                    && !definitionText.includes('Diminutive of')
                return !!isRedirection
            }
        )
}

function hasContent(nodes: CheerioElement[], $: CheerioStatic): boolean {
    return nodes.some(node => !!getWiktionaryPart($(node).text()))
}

function separateIntoLexemeGroups(nodes: CheerioElement[], $: CheerioStatic): CheerioElement[][] {
    
    interface SeparatorState {
        groups: CheerioElement[][]
        currentGroup: CheerioElement[]
        skippedGroups: number
        skipCurrentGroup: boolean
        contentNodeFound: boolean
        groupByEtymology: boolean
    }
    
    const state: SeparatorState = loggingProxy({
        groups: [],
        currentGroup: loggingProxy([], 'separator.currentGroup'),
        skippedGroups: 0,
        contentNodeFound: false,
        skipCurrentGroup: false,
        groupByEtymology: $('body').find('h3').text().includes('Etymology 1')
    }, 'separator')
    
    function detectGroupStart(node: CheerioElement): boolean {
        if (state.groupByEtymology) {
            return $(node).text().startsWith('Etymology')
        }
        else {
            return !!getWiktionaryPart($(node).text())
        }
    }
    
    for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i]
        if (isRedirection(node, $)) {
            state.skipCurrentGroup = true
        }
        
        const newGroupStarts = detectGroupStart(node)
        if (newGroupStarts && hasContent(state.currentGroup, $)) {
            if (!state.skipCurrentGroup) {
                state.groups.push(state.currentGroup)
            }
            state.currentGroup = []
            state.contentNodeFound = true
            state.skipCurrentGroup = false
        }
        state.currentGroup.push(node)
    }
    
    if (state.currentGroup.length > 0 && !state.skipCurrentGroup) {
        state.groups.push(state.currentGroup)
    }
    else {
        state.skippedGroups += 1
    }
    
    if (state.groups.length === 0) {
        if (state.skippedGroups) {
            throw new Error(`Only skipped groups(${state.skippedGroups}) for ${$('title').text()}`)
        }
        else {
            throw new Error(`Cannot extract groups for ${$('title').text()}`)
        }
    }
    
    return state.groups
}

export function parseWiktionaryHtml(html: string): WiktionaryHtmlData {
    if (html.includes('Wiktionary does not yet have an entry')) {
        error('no-entry')
    }
    const $ = cheerio.load(html)
    removeIrrelevantNodes($, 'Latin')
    removeProblematicNodes($)
    const nodes = $(NODE_SELECTOR).toArray()
    const lexemeGroups = separateIntoLexemeGroups(nodes, $)
    const data = lexemeGroups.map(nodes => parseWiktionaryLexemeGroup(nodes, $))
    
    return {
        main: data.map(node => node.main).reduce(flatten, []),
        auxiliary: data.map(node => node.auxiliary).reduce(flatten, []),
    }
}
