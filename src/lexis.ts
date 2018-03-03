export type Pars =
    // nomina
    | 'nomen-substantivum'
    | 'nomen-adiectivum'
    
    // ut adiectvium
    | 'adverbium'
    
    // pronomina
    | 'pronomen'
    
    // verba, vel "verba temporalia"
    | 'verbum'
    
    // verba -> nomina substantiva
    | 'infinitivum'
    | 'gerundium'
    | 'supinum'
    
    // verba -> nomina adiectiva
    | 'participium'
    
    // partes immutabiles
    | 'coniunctio'
    | 'prepositio'
    | 'particula'
    | 'postpositio'
    | 'littera'
    | 'interiectio'
    | 'articulus'
    
    | 'ignotus'

export type ParsMinor =
    | 'nomen-immutabile'
    | 'adiectivum-immutabile'
    | 'pronomen-demonstrativum'
    | 'pronomen-personale'
    | 'pronomen-possessivum'
    | 'pronomen-interrogativum'
    | 'pronomen-relativum'
    | 'pronomen-immutabile'
    | 'pronomen-reflexivum'
    | 'pronomen-nullum'


export type Numerus = 'singularis' | 'pluralis'

export type Genus = 'masculinum' | 'femininum' | 'neutrum' // "genus nominis"
export type Casus =
    'nominativus'
    | 'genetivus'
    | 'accusativus'
    | 'dativus'
    | 'ablativus'
    | 'locativus'
    | 'vocativus'

export type Modus = 'indicativus' | 'imperativus' | 'coniunctivus'
export type Vox = 'activa' | 'passiva' // "genus verbi"
export type Tempus = 'praesens' | 'praeteritus' | 'futurus'
export type Aspectus = 'imperfectivus' | 'perfectivus'
export type Persona = 'prima' | 'secunda' | 'tertia'

/*  tempus + aspectus = "tempus"
    praesens + imperfectus = "praesens"
    praesens + perfectus = "perfectus"
    praeteritus + imperfectus = "imperfectum"
    praeteritus + perfectus = "plus-quam-perfectum"
    futurus + imperfectus = "futurum"
    futurus + perfectus = "futurum perfectum" */

export type SeriesStatus<Status> = string

export type Inflectiones<S = Status> = {
    [key in SeriesStatus<S>]?: string[]
}

export type Lingua = 'Anglica'

interface Exemplum {
    phrasis: string
}

export type Interpretatio = {
    significatio: string
    exempli: Exemplum[]
}

export interface LexicographiaLexisCommunis {
    lemma: string
    radices: string[]
    etymologia: string[]
    pronunciatio: string[]
    references: string[]
    lemmataAlterae: string[]
}

interface LexisCommunis<Status,
    Lexicographia extends LexicographiaLexisCommunis = LexicographiaLexisCommunis> {
    pars: Pars
    parsMinor?: ParsMinor
    inflectiones: Inflectiones<Status>
    lexicographia: Lexicographia
    interpretationes: {
        [lingua in Lingua]?: Interpretatio[]
    }
}

/**
 * Nomina (substantivi)
 */

export interface StatusSubstantivi {
    casus: Casus
    numerus: Numerus
    persona: 'tertia'
}

export interface LexicographiaLSubstantivi extends LexicographiaLexisCommunis {
    thema: 'a' | 'o' | 'consonans' | 'u' | 'e' | 'irregularis' | 'ignota'
    pluralisSolum: boolean
}

export interface NomenSubstantivum extends LexisCommunis<StatusSubstantivi, LexicographiaLSubstantivi> {
    pars: 'nomen-substantivum'
    genera: Genus[]
}

/**
 * Nomina (adiectivi)
 */

export type Gradus = 'positivus' | 'comparativus' | 'superlativus'

export interface StatusAdiectivi {
    genus: Genus
    casus: Casus
    numerus: Numerus
    gradus: Gradus
}

export interface LexicographiaAdiectivum extends LexicographiaLexisCommunis {
    thema: 'a' | 'consonans' | 'alia'
    lemmataAlii: {
        comparativus: string
        superlativus: string
    }
}

export interface NomenAdiectivum extends LexisCommunis<StatusAdiectivi, LexicographiaAdiectivum> {
    pars: 'nomen-adiectivum'
}

export type Nomen = NomenSubstantivum | NomenAdiectivum

/**
 * Adverbium
 */

export interface StatusAdverbii {
    gradus: Gradus
}

export interface LexicographiaAdverbii extends LexicographiaLexisCommunis {
    nonComparabilis: boolean
}

export interface Adverbium extends LexisCommunis<StatusAdverbii, LexicographiaAdverbii> {
    pars: 'adverbium'
}

/**
 * Pronomina
 */

export type PersonaPrononimisPersonalis = 'prima' | 'secunda' | 'reflexiva'

export interface StatusPronominisPersonalis {
    casus: Casus
    numerus: Numerus
    persona: PersonaPrononimisPersonalis
}

export interface PronomenPersonale extends LexisCommunis<StatusPronominisPersonalis> {
    pars: 'pronomen'
    parsMinor: 'pronomen-personale'
}

export interface StatusPronominisPossessivi {
    casus: Casus
    numerus: Numerus
    genus: Genus
    persona: PersonaPrononimisPersonalis
    numerusPersonae: Numerus
}

export interface LexicographiaPronominis extends LexicographiaLexisCommunis {
    thema: 'a'
}

export interface PronomenPossessivum extends LexisCommunis<StatusPronominisPossessivi, LexicographiaPronominis> {
    pars: 'pronomen'
    parsMinor: 'pronomen-possessivum'
}

export interface StatusPronominisDemonstrativi {
    casus: Casus
    numerus: Numerus
    genus: Genus
}

export interface PronomenDemonstrativum extends LexisCommunis<StatusPronominisDemonstrativi> {
    pars: 'pronomen'
    parsMinor: 'pronomen-demonstrativum'
}

export interface StatusPronominis {
    casus: Casus
    numerus: Numerus
    genus: Genus
}

export interface StatusPronomenInterrogativum {
    casus: Casus
    numerus: Numerus
    genus: Genus
}

export interface PronomenInterrogativum extends LexisCommunis<StatusPronomenInterrogativum> {
    pars: 'pronomen'
    parsMinor: 'pronomen-interrogativum'
}

export interface StatusPronomenRelativum {
    casus: Casus
    numerus: Numerus
    genus: Genus
}

export interface PronomenRelativum extends LexisCommunis<StatusPronomenRelativum> {
    pars: 'pronomen'
    parsMinor: 'pronomen-relativum'
}

export interface StatusPronomenRelativum {
    casus: Casus
    numerus: Numerus
    genus: Genus
}

export interface PronomenReflexivum extends LexisCommunis<StatusPronomenRelativum> {
    pars: 'pronomen',
    parsMinor: 'pronomen-reflexivum'
}

export interface PronomenImmutabile extends LexisCommunis<{}> {
    pars: 'pronomen'
    parsMinor: 'pronomen-immutabile'
}

export interface PronomenNullum extends LexisCommunis<{}> {
    pars: 'pronomen'
    parsMinor: 'pronomen-nullum'
}

export type Pronomen =
    PronomenPersonale
    | PronomenPossessivum
    | PronomenDemonstrativum
    | PronomenInterrogativum
    | PronomenRelativum
    | PronomenReflexivum
    | PronomenImmutabile
    | PronomenNullum

/**
 * Verba templorale
 */

export interface StatusFinitivi {
    modus: Modus
    vox: Vox
    tempus: Tempus
    aspectus: Aspectus
    numerus: Numerus
    persona: Persona
}

export interface StatusInfinitivi {
    vox: Vox
    tempus: Tempus
}

export interface StatusGerundii {
    casus: Casus
}

export interface StatusSupini {
    casus: Casus
}

export interface StatusParticipii {
    vox: Vox
    genus: Genus
    casus: Casus
    numerus: Numerus
    tempus: Tempus
}

// Omnibus

export interface StatusImmutabilis {
}

export type Status =
    StatusSubstantivi
    | StatusPronominis
    | StatusAdiectivi
    | StatusAdverbii
    | StatusFinitivi
    | StatusInfinitivi
    | StatusGerundii
    | StatusSupini
    | StatusParticipii
    | StatusImmutabilis

export interface LexicographiaVerbi extends LexicographiaLexisCommunis {
    thema: 'ā' | 'ē' | 'e' | 'consonans' | 'ī' | 'irregularis' | 'ignotum'
    deponens: 'deponens' | 'semi-deponens' | 'non-deponens'
    numquamPerfectum: boolean
}

export interface Verbum extends LexisCommunis<StatusFinitivi, LexicographiaVerbi> {
    pars: 'verbum'
    lemmataAlii: {
        supinum: string | null
        gerundium: string | null
        participii: {
            praesensActiva?: string
            futurusActiva?: string
            praeteritusPassiva?: string
            futurusPassiva?: string
        }
        infinitivum: string | null
    }
}

export interface LexicographiaAbVerbo extends LexicographiaLexisCommunis {
    lemmaVerbi: string
}

export interface Infinitivum extends LexisCommunis<StatusInfinitivi, LexicographiaAbVerbo> {
    pars: 'infinitivum'
}

export interface Gerundium extends LexisCommunis<StatusGerundii, LexicographiaAbVerbo> {
    pars: 'gerundium'
}

export interface Supinum extends LexisCommunis<StatusSupini, LexicographiaAbVerbo> {
    pars: 'supinum'
}

export interface Participium extends LexisCommunis<StatusParticipii, LexicographiaAbVerbo> {
    pars: 'participium'
}

export interface Coniunctio extends LexisCommunis<{}> {
    pars: 'coniunctio'
}

export interface Prepositio extends LexisCommunis<{}> {
    pars: 'prepositio'
}

export interface Postpositio extends LexisCommunis<{}> {
    pars: 'postpositio'
}

export interface Particula extends LexisCommunis<{}> {
    pars: 'particula'
}

export interface Littera extends LexisCommunis<{}> {
    pars: 'littera'
}

export interface Interiecio extends LexisCommunis<{}> {
    pars: 'interiectio'
}

export interface Articulus extends LexisCommunis<{}> {
    pars: 'articulus'
}

export interface LexisIgnotus extends LexisCommunis<{}> {
    pars: 'ignotus'
}

export type Lexis =
    Nomen
    | Pronomen
    | Adverbium
    | Verbum
    | Infinitivum
    | Gerundium
    | Supinum
    | Participium
    | Coniunctio
    | Prepositio
    | Particula
    | Postpositio
    | Littera
    | Interiecio
    | Articulus
    | LexisIgnotus

/**
 * Participium
 */

const skippedStatus: string[] = [
    'indicativus',
    'activa',
    'praesens',
    'imperfectivus',
    'singularis',
]

export function representStatus(status: Status): string {
    return Object.values(status).filter(value => !skippedStatus.includes(value)).join(' ')
}

type StatusOmnibus =
    StatusSubstantivi
    & StatusAdiectivi
    & StatusPronominis
    & StatusFinitivi
    & StatusInfinitivi
    & StatusGerundii
    & StatusSupini
    & StatusParticipii

type Linea = [
    Pars,
    ParsMinor | undefined,
    Numerus,
    Persona,
    Genus,
    Casus,
    Gradus,
    Modus,
    Vox,
    Tempus,
    Aspectus
    ]

const seperator = '|'
const placeholder = '-'

export function serializeStatum<T extends Status>(pars: Pars,
                                                  status: T,
                                                  options: {
                                                      parsMinor?: ParsMinor
                                                  } = {}): SeriesStatus<T> {
    const {parsMinor} = options
    const statusOmnibus = status as StatusOmnibus
    const {numerus, persona, genus, casus, gradus, modus, vox, tempus, aspectus} = statusOmnibus
    const linea: Linea = [pars, parsMinor, numerus, persona, genus, casus, gradus, modus, vox, tempus, aspectus]
    return linea.map(node => node ? node : placeholder).join(seperator)
}

export function parseSeriemStatus<S extends StatusOmnibus>(series: SeriesStatus<S>): S {
    const [pars, parsMinor, numerus, persona, genus, casus, gradus, modus, vox, tempus, aspectus] = series.split(seperator)
    const result = {
        numerus, genus, casus, gradus, modus, vox, tempus, aspectus, persona
    } as S
    for (const key in result) {
        if (String(result[key]) === placeholder) {
            delete result[key]
        }
    }
    return result
}

export const numerus: Numerus[] = ['singularis', 'pluralis']
export const modus: Modus[] = ['indicativus', 'coniunctivus', 'imperativus']
export const vox: Vox[] = ['activa', 'passiva']
export const tempus: Tempus[] = ['praesens', 'praeteritus', 'futurus']
export const aspectus: Aspectus[] = ['imperfectivus', 'perfectivus']
export const persona: Persona[] = ['prima', 'secunda', 'tertia']

export const getLexicographiamCommunem = (): LexicographiaLexisCommunis => ({
    lemma: '',
    radices: [],
    etymologia: [],
    pronunciatio: [],
    references: [],
    lemmataAlterae: [],
})

export const getBaseLexem = (lang: Lingua): Pick<Lexis, 'inflectiones' | 'interpretationes' | 'lexicographia'> => ({
    inflectiones: {},
    interpretationes: {
        [lang]: [],
    },
    lexicographia: {
        ...getLexicographiamCommunem(),
    },
})
