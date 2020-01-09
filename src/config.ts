import { Lingua } from 'lexis'
import * as path from 'path'
import { TreebankSource } from 'analysis/Model'

export const radixCache = './cache'

export const radixTokens = path.resolve(radixCache, 'latin_library_tokens')
export const radixLatinLibrary = path.resolve(radixCache, 'latin_text_latin_library')

export const viaInflectionDict = path.resolve(radixCache, 'inflectionDict.json')

export const viaFrequencyTable = path.resolve(radixCache, 'frequencyTable.json')
export const viaLemmata = path.resolve(radixCache, 'lemmata.json')
export const viaFailureReport = path.resolve(radixCache, 'failures.json')
export const viaPOSStat = path.resolve(radixCache, 'post_stat.json')
export const viaTreebank = (source: TreebankSource) => path.resolve(radixCache, `treebank-${source}.json`)
export const viaTabulaeParticipiorum = path.resolve(radixCache, 'tabulaParticipiorum.json')
export const viaLemmataSummary = path.resolve(radixCache, 'summary.json')

export const LANG: Lingua = 'Anglica'
