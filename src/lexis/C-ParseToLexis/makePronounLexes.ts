import {
    Genus,
    Numerus,
    Pronomen,
    PronomenDemonstrativum,
    PronomenImmutabile,
    PronomenInterrogativum,
    PronomenPersonale,
    PronomenPossessivum,
    PronomenReflexivum,
    PronomenRelativum,
    serializeStatum,
    StatusPronomenInterrogativum,
    StatusPronominisDemonstrativi,
    StatusPronominisPersonalis,
    StatusPronominisPossessivi
} from 'lexis'
import { caseOrderPronominum, lemmataPronominis, personaePrononimis, tabulaPronominum } from 'lexis/data/pronomina'
import { LANG } from 'config'

const numeri: Numerus[] = ['singularis', 'pluralis']
const genera: Genus[] = ['masculinum', 'femininum', 'neutrum']

function makePronomenPersonale() {
    const pronomenPersonale: PronomenPersonale = {
        pars: 'pronomen',
        parsMinor: 'pronomen-personale',
        inflectiones: {},
        lexicographia: {
            lemma: 'egō',
            radices: ['egō', 'tu', 'sui'],
            etymologia: [],
            pronunciatio: [],
            references: [],
            lemmataAlterae: [],
        },
        interpretationes: {
            [LANG]: []
        }
    }
    for (const persona of personaePrononimis) {
        for (const numerus of numeri) {
            const row = tabulaPronominum.personale[persona][numerus]
            for (const casus of caseOrderPronominum) {
                const status: StatusPronominisPersonalis = {
                    casus,
                    numerus,
                    persona,
                }
                const index = caseOrderPronominum.indexOf(casus)
                const clavis = serializeStatum('pronomen', status, {parsMinor: 'pronomen-personale'})
                const formae = row[index]
                if (formae.length > 0) {
                    pronomenPersonale.inflectiones[clavis] = formae
                }
            }
        }
    }
    return pronomenPersonale
}

function makePronomenPossessivum() {
    const pronomenPossessivum: PronomenPossessivum = {
        pars: 'pronomen',
        parsMinor: 'pronomen-possessivum',
        inflectiones: {},
        lexicographia: {
            lemma: 'meus',
            radices: ['meus', 'tuus', 'suus'],
            etymologia: [],
            pronunciatio: [],
            references: [],
            lemmataAlterae: [],
            thema: 'a',
        },
        interpretationes: {
            [LANG]: []
        }
    }
    
    for (const persona of personaePrononimis) {
        for (const genus of genera) {
            for (const numerusPersonae of numeri) {
                for (const numerus of numeri) {
                    const row = tabulaPronominum.possessivum[persona][numerusPersonae][numerus][genus]
                    for (const casus of caseOrderPronominum) {
                        const status: StatusPronominisPossessivi = {
                            casus,
                            numerus,
                            genus,
                            persona,
                            numerusPersonae,
                        }
                        const index = caseOrderPronominum.indexOf(casus)
                        const clavis = serializeStatum('pronomen', status, {parsMinor: 'pronomen-possessivum'})
                        const formae = row[index]
                        if (formae.length > 0) {
                            pronomenPossessivum.inflectiones[clavis] = formae
                        }
                    }
                }
            }
        }
    }
    return pronomenPossessivum
}

function makePronominaDemonstrativos() {
    const pronomina: PronomenDemonstrativum[] = []
    
    for (const lemma of lemmataPronominis) {
        const pronomen: PronomenDemonstrativum = {
            pars: 'pronomen',
            parsMinor: 'pronomen-demonstrativum',
            inflectiones: {},
            lexicographia: {
                lemma: lemma,
                radices: [lemma],
                etymologia: [],
                pronunciatio: [],
                references: [],
                lemmataAlterae: [],
            },
            interpretationes: {
                [LANG]: []
            }
        }
        for (const genus of genera) {
            for (const numerus of numeri) {
                const row = tabulaPronominum.demonstrativum[lemma][numerus][genus]
                for (const casus of caseOrderPronominum) {
                    const status: StatusPronominisDemonstrativi = {
                        casus,
                        numerus,
                        genus,
                    }
                    const index = caseOrderPronominum.indexOf(casus)
                    const clavis = serializeStatum('pronomen', status, {parsMinor: 'pronomen-possessivum'})
                    const formae = row[index]
                    if (formae.length > 0) {
                        pronomen.inflectiones[clavis] = formae
                    }
                }
            }
        }
        pronomina.push(pronomen)
    }
    
    return pronomina
}

function makePronomenInterrogativum() {
    const pronomen: PronomenInterrogativum = {
        pars: 'pronomen',
        parsMinor: 'pronomen-interrogativum',
        inflectiones: {},
        lexicographia: {
            lemma: 'quis',
            radices: ['quis', 'quae', 'quid'],
            etymologia: [],
            pronunciatio: [],
            references: [],
            lemmataAlterae: [],
        },
        interpretationes: {
            [LANG]: []
        }
    }
    for (const genus of genera) {
        for (const numerus of numeri) {
            const row = tabulaPronominum.interrogativum[numerus][genus]
            for (const casus of caseOrderPronominum) {
                const status: StatusPronomenInterrogativum = {
                    casus,
                    numerus,
                    genus,
                }
                const index = caseOrderPronominum.indexOf(casus)
                const clavis = serializeStatum('pronomen', status, {parsMinor: 'pronomen-interrogativum'})
                const formae = row[index]
                if (formae.length > 0) {
                    pronomen.inflectiones[clavis] = formae
                }
            }
        }
    }
    return pronomen
}

function makePronomenRelativum() {
    const pronomen: PronomenRelativum = {
        pars: 'pronomen',
        parsMinor: 'pronomen-relativum',
        inflectiones: {},
        lexicographia: {
            lemma: 'quī',
            radices: ['quī', 'quae', 'quod'],
            etymologia: [],
            pronunciatio: [],
            references: [],
            lemmataAlterae: [],
        },
        interpretationes: {
            [LANG]: []
        }
    }
    for (const genus of genera) {
        for (const numerus of numeri) {
            const row = tabulaPronominum.relativum[numerus][genus]
            for (const casus of caseOrderPronominum) {
                const status: StatusPronomenInterrogativum = {
                    casus,
                    numerus,
                    genus,
                }
                const index = caseOrderPronominum.indexOf(casus)
                const clavis = serializeStatum('pronomen', status, {parsMinor: 'pronomen-relativum'})
                const formae = row[index]
                if (formae.length > 0) {
                    pronomen.inflectiones[clavis] = formae
                }
            }
        }
    }
    return pronomen
}

function makeNihil(): PronomenImmutabile {
    const nihil: PronomenImmutabile = {
        pars: 'pronomen',
        parsMinor: 'pronomen-immutabile',
        inflectiones: {
            [serializeStatum('pronomen', {casus: 'nominativus'}, {parsMinor: 'pronomen-immutabile'})]:
                [tabulaPronominum.nihil.nominativus],
            [serializeStatum('pronomen', {casus: 'accusativus'}, {parsMinor: 'pronomen-immutabile'})]:
                [tabulaPronominum.nihil.accusativus],
        },
        lexicographia: {
            lemma: tabulaPronominum.nihil.nominativus,
            radices: [tabulaPronominum.nihil.nominativus],
            etymologia: [],
            pronunciatio: [],
            references: [],
            lemmataAlterae: [],
        },
        interpretationes: {
            [LANG]: []
        }
    }
    return nihil
}

function makePronomenReflexivum() {
    const pronomen: PronomenReflexivum = {
        pars: 'pronomen',
        parsMinor: 'pronomen-reflexivum',
        inflectiones: {},
        lexicographia: {
            lemma: 'ipse',
            radices: ['ipse', 'ipsa', 'ipsum'],
            etymologia: [],
            pronunciatio: [],
            references: [],
            lemmataAlterae: [],
        },
        interpretationes: {
            [LANG]: []
        }
    }
    for (const genus of genera) {
        for (const numerus of numeri) {
            const row = tabulaPronominum.refexivum[numerus][genus]
            for (const casus of caseOrderPronominum) {
                const status: StatusPronomenInterrogativum = {
                    casus,
                    numerus,
                    genus,
                }
                const index = caseOrderPronominum.indexOf(casus)
                const clavis = serializeStatum('pronomen', status, {parsMinor: 'pronomen-relativum'})
                const formae = row[index]
                if (formae.length > 0) {
                    pronomen.inflectiones[clavis] = formae
                }
            }
        }
    }
    return pronomen
    
}

export function makePronounLexis(): Pronomen[] {
    const pronomina: Pronomen[] = [
        makePronomenPersonale(),
        makePronomenPossessivum(),
        ...makePronominaDemonstrativos(),
        makePronomenInterrogativum(),
        makePronomenRelativum(),
        makePronomenReflexivum(),
        makeNihil(),
    ]
    return pronomina
}

