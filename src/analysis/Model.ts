import { Lexis, Pars, ParsMinor, SeriesStatus, Status } from 'lexis'

export interface InflectedFormDesignation {
    forma: string
    lemma: string
    pars: Pars
    parsMinor?: ParsMinor
    status?: SeriesStatus<Lexis>
}

export interface UnknownTokenAnalysis {
    type: 'ignotus'
    forma: string
}

export interface KnownTokenAnalysis extends InflectedFormDesignation {
    type: 'notus'
}

export interface SkipTokenAnalysis {
    type: 'neglectus'
    forma: string
}

export type TokenAnalysis = UnknownTokenAnalysis | KnownTokenAnalysis | SkipTokenAnalysis

export type Treebank = InflectedFormDesignation[][]

export type TreebankSource = 'perseus' | 'proiel' | 'thomisticus'

export interface TreebankStatistic {
    sentence: number
    token: number
}

export type TreebankSerialized = {
    statistics: TreebankStatistic
    treebank: Treebank
}
