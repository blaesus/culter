import {
    Aspectus,
    Casus,
    Gerundium,
    Infinitivum,
    Inflectiones,
    Lexis,
    Modus,
    Numerus,
    Pars,
    Participium,
    Status,
    StatusFinitivi,
    StatusGerundii,
    StatusInfinitivi,
    StatusSupini,
    Supinum,
    Tempus,
    Verbum,
    Vox,
} from 'lexis'
import { stringify } from 'querystring'
import { sum } from './sum'
import { splitMultipleFormae } from 'utils'
import { serializeStatum } from 'serialization'

/**
 * @see https://en.wiktionary.org/wiki/Category:Latin_verb_inflection-table_templates
 * @see https://en.wiktionary.org/wiki/Module:la-verb
 */

const finitivusCellOrder: { numerus: Numerus, persona: StatusFinitivi['persona'] }[] = [
    {numerus: 'singularis', persona: 'prima'},
    {numerus: 'singularis', persona: 'secunda'},
    {numerus: 'singularis', persona: 'tertia'},
    {numerus: 'pluralis', persona: 'prima'},
    {numerus: 'pluralis', persona: 'secunda'},
    {numerus: 'pluralis', persona: 'tertia'},
]

const infinitiveCellOrder: { vox: Vox, tempus: Tempus }[] = [
    {vox: 'activa', tempus: 'praesens'},
    {vox: 'activa', tempus: 'praeteritum'},
    {vox: 'activa', tempus: 'futurum'},
    {vox: 'passiva', tempus: 'praesens'},
    {vox: 'passiva', tempus: 'praeteritum'},
    {vox: 'passiva', tempus: 'futurum'},
]

const gerundiumCellOrder: Casus[][] = [
    ['nominativus'],
    ['genetivus'],
    ['dativus', 'ablativus'],
    ['accusativus'],
]

const supinumCellOrder: Casus[] = [
    'accusativus',
    'ablativus',
]


function translateTempus(s: string): [Tempus, Aspectus] {
    switch (s) {
        case 'present':
            return ['praesens', 'imperfectivus']
        case 'imperfect':
            return ['praeteritum', 'imperfectivus']
        case 'future':
            return ['futurum', 'imperfectivus']
        case 'perfect':
            return ['praesens', 'perfectivus']
        case 'pluperfect':
            return ['praeteritum', 'perfectivus']
        case 'future perfect':
            return ['futurum', 'perfectivus']
        default: {
            throw new Error(`Unknown tempus ${s}`)
        }
    }
}

export function translateVox(s: string): StatusFinitivi['vox'] {
    switch (s) {
        case 'active':
            return 'activa'
        case 'passive':
            return 'passiva'
        default: {
            throw new Error(`Unknown vox ${s}`)
        }
    }
}

function translateModus(s: string): Modus | ParserMode {
    switch (s) {
        case 'indicative':
            return 'indicativus'
        case 'subjunctive':
            return 'coniunctivus'
        case 'imperative':
            return 'imperativus'
        case 'non-finite forms':
            return 'infinitivus'
        case 'verbal nouns':
            return 'gerund+supine'
        default: {
            throw new Error(`Unknown mode ${s}`)
        }
    }
}

function getFormas(s: string): string[] {
    const formae = splitMultipleFormae(s.replace(/[0-9]/g, ''))
    return formae.filter(forma => forma !== '—')
}

type ParserMode = 'finitivus' | 'infinitivus' | 'gerund+supine'

export interface TabulaeInformatio<LexisT extends Lexis> {
    pars: LexisT['pars']
    lemma: string
    inflectiones: Lexis['inflectiones']
}

export interface TabulaeInformatioVerbi extends TabulaeInformatio<Verbum> {
    lemmaAlii: Verbum['lemmataAlii']
}

export type AuxiliaryOutcomeTabulaeVerbi = Infinitivum | Participium | Gerundium | Supinum
export type LemmataParticipii = Verbum['lemmataAlii']['participii']

export function parseTabluamVerbiWiktionary(tableNode: CheerioElement, $: CheerioStatic): {
    verbum: TabulaeInformatio<Verbum>,
    infinitivum: TabulaeInformatio<Infinitivum> | null,
    gerundium: TabulaeInformatio<Gerundium> | null,
    supinum: TabulaeInformatio<Supinum> | null
    participii: LemmataParticipii
} {
    
    let parseMode: ParserMode = 'finitivus'
    
    function getLemma(inflections: Inflectiones): string {
        const inflectioLemmae = Object.values(inflections)[0]
        if (inflectioLemmae && inflectioLemmae[0]) {
            return inflectioLemmae[0]
        }
        throw new Error(`Cannot get lemma for ${stringify(inflections)}`)
    }
    
    function guessModum($row: Cheerio): Modus | ParserMode {
        const text = $($row.find('th')[0]).text()
        return translateModus(text)
    }
    
    function guessVocem($row: Cheerio): Vox {
        const text = $($row.find('th')[0]).text()
        return translateVox(text)
    }
    
    function guessTempumEtAspectum($row: Cheerio, index?: number): [
        Tempus, Aspectus
        ] {
        let headers = $row.find('th')
        index = typeof index === 'number' ? index : headers.length - 1
        const text = $(headers[index]).text()
        return translateTempus(text)
    }
    
    const inflectionesVerbi: Inflectiones<StatusFinitivi> = {}
    
    function addInflectionem(formae: string[],
                             pars: Pars,
                             status: Status,
                             target: Inflectiones<Status> = inflectionesVerbi) {
        if (formae.length > 0) {
            target[serializeStatum(pars, status)] = formae
        }
    }
    
    function extractFiniteFormas($row: Cheerio) {
        const dataCells = $row.find('td').toArray()
        dataCells.forEach((cell, index) => {
            const formae = getFormas($(cell).text())
            if (modus && vox) {
                const status: StatusFinitivi = {
                    ...finitivusCellOrder[index],
                    modus,
                    vox,
                    tempus,
                    aspectus,
                }
                addInflectionem(formae, 'verbum', status)
            }
            else {
                throw new Error(`Cannot parse modus or genus line ${$row.text()}`)
            }
        })
    }
    
    function getPassivePerfectModifiers(line: string): {
        tempus: Tempus
        vox: Vox
        modus: Modus
    } {
        const regexMatch = /\+\s(.*)\sof/.exec(line)
        if (regexMatch) {
            const instruction = regexMatch[1]
            const [tempusS, genusS, modusS] = instruction.split(' ')
            const [tempus] = translateTempus(tempusS)
            const vox = translateVox(genusS)
            const modus = translateModus(modusS)
            if (modus === 'indicativus' || modus === 'imperativus' || modus === 'coniunctivus') {
                return {
                    tempus,
                    vox,
                    modus,
                }
            }
            else {
                console.warn('Unexpected mode', modus)
            }
        }
        console.warn('Unexpected extension instruction')
        return {
            tempus: 'praesens',
            vox: 'activa',
            modus: 'indicativus',
        }
    }
    
    function extractPassivePerfectsLinkedWithSum($row: Cheerio) {
        if (!sum) {
            console.info('no sum, skipping')
            return
        }
        if (!vox || !modus) {
            console.warn('?')
            return
        }
        for (const data of finitivusCellOrder) {
            const {numerus, persona} = data
            const lemma = $($row.find('th i')[0]).text()
            const query = serializeStatum('verbum', {
                ...getPassivePerfectModifiers($($row.find('th')[1]).text()),
                aspectus: 'imperfectivus',
                numerus,
                persona,
            })
            const sumConiugatio = sum[query]
            if (sumConiugatio) {
                const status: StatusFinitivi = {
                    modus,
                    vox,
                    tempus,
                    aspectus,
                    numerus,
                    persona,
                }
                const formae = [`${lemma} ${sumConiugatio[0]}`]
                addInflectionem(formae, 'verbum', status)
            }
            else {
                console.info('Cannot find match for', query)
            }
        }
    }
    
    const inflectionesInfinitivi: Inflectiones<StatusInfinitivi> = {}
    const inflectionesParticipii: Inflectiones<StatusInfinitivi> = {}
    
    function extractInfinitivum($row: Cheerio) {
        const dataCells = $row.find('td').toArray()
        dataCells.forEach((cell, index) => {
            const formae = getFormas($(cell).text())
            const status: StatusInfinitivi = {
                vox,
                ...infinitiveCellOrder[index],
            }
            addInflectionem(formae, 'infinitivum', status, inflectionesInfinitivi)
        })
    }
    
    const participleOrder: [(keyof LemmataParticipii), Tempus, Vox][] = [
        ['praesensActiva', 'praesens', 'activa'],
        ['praeteritumActiva', 'praeteritum', 'activa'],
        ['futurumActiva', 'futurum', 'activa'],

        ['praesensPassiva', 'praesens', 'passiva'],
        ['praeteritumPassiva', 'praeteritum', 'passiva'],
        ['futurumPassiva', 'futurum', 'passiva'],
    ]
    
    function getLemmataParticipii($row: Cheerio): LemmataParticipii {
        const result: Verbum['lemmataAlii']['participii'] = {}
        const dataCells = $row.find('td').toArray()
        dataCells
            .forEach((cell, index) => {
                const formae = getFormas($(cell).text())
                const state = participleOrder[index]
                const forma = formae[0]
                if (forma !== '—') {
                    result[state[0]] = forma
                }
            })
        return result
    }
    
    let modus: Modus | undefined
    let vox: Vox | undefined
    let tempus: Tempus
    let aspectus: Aspectus
    
    let gerundium: TabulaeInformatio<Gerundium> | null = null
    let supinum: TabulaeInformatio<Supinum> | null = null
    let infinitivum: TabulaeInformatio<Infinitivum> | null = null
    let participii: LemmataParticipii = {}
    
    for (const row of $(tableNode).find('tr.vsHide').toArray()) {
        const $row = $(row)
        const headerCount = $row.find('th').length
        const dataCellCount = $row.find('td').length
        if (headerCount === 3) {
            const mode = guessModum($row)
            if (mode === 'infinitivus' || mode === 'gerund+supine') {
                parseMode = mode
            }
            else if (mode === 'finitivus') {
                console.error('Unexpected mode switch: ', mode)
            }
            else {
                modus = mode
            }
        }
        if (parseMode === 'finitivus') {
            if (headerCount === 2) {
                if (dataCellCount === 6) {
                    vox = guessVocem($row)
                    ;[tempus, aspectus] = guessTempumEtAspectum($row)
                    extractFiniteFormas($row)
                }
                else if (dataCellCount === 0) {
                    if (sum) {
                        [tempus, aspectus] = guessTempumEtAspectum($row, 0)
                        extractPassivePerfectsLinkedWithSum($row)
                    }
                }
                else {
                    throw new Error(`Unrecognizable verb format ${$row.text()}`)
                }
            }
            if (headerCount === 1) {
                [tempus, aspectus] = guessTempumEtAspectum($row)
                extractFiniteFormas($row)
            }
        }
        else if (parseMode === 'infinitivus') {
            const cells = $row.find('th')
            const label = $(cells[0]).text()
            if (label === 'infinitives' && Object.keys(inflectionesInfinitivi).length >= 1) {
                extractInfinitivum($row)
                infinitivum = {
                    pars: 'infinitivum',
                    lemma: getLemma(inflectionesInfinitivi),
                    inflectiones: inflectionesInfinitivi,
                }
            }
            else if (label === 'participles') {
                participii = getLemmataParticipii($row)
            }
        }
        else if (parseMode === 'gerund+supine') {
            const cells = $row.find('td').toArray()
            if (cells.length === 6 && $(cells[0]).text() !== 'nominative') {
                gerundium = {
                    pars: 'gerundium',
                    lemma: '',
                    inflectiones: {},
                }
                supinum = {
                    pars: 'supinum',
                    lemma: '',
                    inflectiones: {},
                }
                for (let index = 0; index < cells.length; index += 1) {
                    const cell = cells[index]
                    const formae = getFormas($(cell).text())
                    if (formae.length > 0) {
                        if (index <= 3) {
                            const casūs = gerundiumCellOrder[index]
                            for (const casus of casūs) {
                                const status: StatusGerundii = {
                                    casus
                                }
                                gerundium.lemma = formae[0]
                                gerundium.inflectiones[serializeStatum('gerundium', status)] = formae
                            }
                        }
                        else {
                            const casus = supinumCellOrder[index - 4]
                            const status: StatusSupini = {
                                casus
                            }
                            supinum.lemma = formae[0]
                            supinum.inflectiones[serializeStatum('supinum', status)] = formae
                        }
                    }
                }
            }
        }
    }
    
    const verbum: TabulaeInformatioVerbi = {
        pars: 'verbum',
        lemma: getLemma(inflectionesVerbi),
        inflectiones: inflectionesVerbi,
        lemmaAlii: {
            supinum: supinum ? supinum.lemma : null,
            gerundium: gerundium ? gerundium.lemma : null,
            participii,
            infinitivum: infinitivum ? infinitivum.lemma : null,
        }
    }
    return {verbum, infinitivum, participii, gerundium, supinum}
}
