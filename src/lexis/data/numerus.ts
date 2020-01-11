import { Inflectiones, Interpretatio, Lingua, NomenAdiectivum, Pars, ParsMinor, Status } from "../../lexis";

function makeIndeclinableNumeralCardinal(lemma: string, meaning: string): NomenAdiectivum {
    return {
        pars: 'nomen-adiectivum',
        parsMinor: 'numerus-cardinalis-immutabilis',
        lexicographia: {
            lemma: lemma,
            radices: [lemma],
            etymologia: [],
            pronunciatio: [],
            references: [],
            lemmataAlterae: [],
            thema: 'alia',
            lemmataAlii: {
                comparativus: '',
                superlativus: '',
            }
        },
        interpretationes: {
            Anglica: [
                {
                    significatio: meaning,
                    exempli: []
                },
            ]
        },
        inflectiones: {
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|-|-|positivus|-|-|-|-" : [ lemma ],
        }
    }
}

export const numeri: NomenAdiectivum[] = [
    // 1
    {
        pars: 'nomen-adiectivum',
        parsMinor: "numerus-cardinalis",
        lexicographia: {
            lemma: 'ūnus',
            radices: ['ūnus', 'ūna', 'ūnum'],
            etymologia: [],
            pronunciatio: [],
            references: [],
            lemmataAlterae: [],
            thema: 'a',
            lemmataAlii: {
                comparativus: '',
                superlativus: '',
            }
        },
        interpretationes: {
            Anglica: [
                {
                    significatio: "one, single",
                    exempli: []
                },
                {
                    significatio: "alone",
                    exempli: []
                },
            ]
        },
        inflectiones: {
            "nomen-adiectivum|numerus-cardinalis|singularis|-|masculinum|nominativus|positivus|-|-|-|-" : [ "unus" ],
            "nomen-adiectivum|numerus-cardinalis|singularis|-|femininum|nominativus|positivus|-|-|-|-" : [ "una" ],
            "nomen-adiectivum|numerus-cardinalis|singularis|-|neutrum|nominativus|positivus|-|-|-|-" : [ "unum" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|masculinum|nominativus|positivus|-|-|-|-" : [ "unī" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|femininum|nominativus|positivus|-|-|-|-" : [ "unae" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|neutrum|nominativus|positivus|-|-|-|-" : [ "una" ],
            "nomen-adiectivum|numerus-cardinalis|singularis|-|masculinum|genetivus|positivus|-|-|-|-" : [ "unīus" ],
            "nomen-adiectivum|numerus-cardinalis|singularis|-|femininum|genetivus|positivus|-|-|-|-" : [ "unīus" ],
            "nomen-adiectivum|numerus-cardinalis|singularis|-|neutrum|genetivus|positivus|-|-|-|-" : [ "unīus" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|masculinum|genetivus|positivus|-|-|-|-" : [ "unōrum" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|femininum|genetivus|positivus|-|-|-|-" : [ "unārum" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|neutrum|genetivus|positivus|-|-|-|-" : [ "unōrum" ],
            "nomen-adiectivum|numerus-cardinalis|singularis|-|masculinum|dativus|positivus|-|-|-|-" : [ "unī" ],
            "nomen-adiectivum|numerus-cardinalis|singularis|-|femininum|dativus|positivus|-|-|-|-" : [ "unī" ],
            "nomen-adiectivum|numerus-cardinalis|singularis|-|neutrum|dativus|positivus|-|-|-|-" : [ "unī" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|masculinum|dativus|positivus|-|-|-|-" : [ "unīs" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|femininum|dativus|positivus|-|-|-|-" : [ "unīs" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|neutrum|dativus|positivus|-|-|-|-" : [ "unīs" ],
            "nomen-adiectivum|numerus-cardinalis|singularis|-|masculinum|accusativus|positivus|-|-|-|-" : [ "unum" ],
            "nomen-adiectivum|numerus-cardinalis|singularis|-|femininum|accusativus|positivus|-|-|-|-" : [ "unam" ],
            "nomen-adiectivum|numerus-cardinalis|singularis|-|neutrum|accusativus|positivus|-|-|-|-" : [ "unum" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|masculinum|accusativus|positivus|-|-|-|-" : [ "unōs" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|femininum|accusativus|positivus|-|-|-|-" : [ "unās" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|neutrum|accusativus|positivus|-|-|-|-" : [ "una" ],
            "nomen-adiectivum|numerus-cardinalis|singularis|-|masculinum|ablativus|positivus|-|-|-|-" : [ "unō" ],
            "nomen-adiectivum|numerus-cardinalis|singularis|-|femininum|ablativus|positivus|-|-|-|-" : [ "unā" ],
            "nomen-adiectivum|numerus-cardinalis|singularis|-|neutrum|ablativus|positivus|-|-|-|-" : [ "unō" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|masculinum|ablativus|positivus|-|-|-|-" : [ "unīs" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|femininum|ablativus|positivus|-|-|-|-" : [ "unīs" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|neutrum|ablativus|positivus|-|-|-|-" : [ "unīs" ],
            "nomen-adiectivum|numerus-cardinalis|singularis|-|masculinum|vocativus|positivus|-|-|-|-" : [ "une" ],
            "nomen-adiectivum|numerus-cardinalis|singularis|-|femininum|vocativus|positivus|-|-|-|-" : [ "una" ],
            "nomen-adiectivum|numerus-cardinalis|singularis|-|neutrum|vocativus|positivus|-|-|-|-" : [ "unum" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|masculinum|vocativus|positivus|-|-|-|-" : [ "unī" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|femininum|vocativus|positivus|-|-|-|-" : [ "unae" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|neutrum|vocativus|positivus|-|-|-|-" : [ "una" ]
        }
    },
    // 2
    {
        pars: 'nomen-adiectivum',
        parsMinor: "numerus-cardinalis",
        lexicographia: {
            lemma: 'duo',
            radices: ['duo', 'duae', 'duo'],
            etymologia: [],
            pronunciatio: [],
            references: [],
            lemmataAlterae: [],
            thema: 'a',
            lemmataAlii: {
                comparativus: '',
                superlativus: '',
            }
        },
        interpretationes: {
            Anglica: [
                {
                    significatio: 'two',
                    exempli: []
                },
            ]
        },
        inflectiones: {
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|masculinum|nominativus|positivus|-|-|-|-" : [ "duo" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|femininum|nominativus|positivus|-|-|-|-" : [ "duae" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|neutrum|nominativus|positivus|-|-|-|-" : [ "duo" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|masculinum|genetivus|positivus|-|-|-|-" : [ "duōrum" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|femininum|genetivus|positivus|-|-|-|-" : [ "duārum" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|neutrum|genetivus|positivus|-|-|-|-" : [ "duōrum" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|masculinum|dativus|positivus|-|-|-|-" : [ "duōbus" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|femininum|dativus|positivus|-|-|-|-" : [ "duābus" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|neutrum|dativus|positivus|-|-|-|-" : [ "duōbus" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|masculinum|accusativus|positivus|-|-|-|-" : [ "duōs", "duo" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|femininum|accusativus|positivus|-|-|-|-" : [ "duās" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|neutrum|accusativus|positivus|-|-|-|-" : [ "duo" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|masculinum|ablativus|positivus|-|-|-|-" : [ "duōbus" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|femininum|ablativus|positivus|-|-|-|-" : [ "duābus" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|neutrum|ablativus|positivus|-|-|-|-" : [ "duōbus" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|masculinum|vocativus|positivus|-|-|-|-" : [ "duo" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|femininum|vocativus|positivus|-|-|-|-" : [ "duae" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|neutrum|vocativus|positivus|-|-|-|-" : [ "duo" ]
        }
    },
    // 3
    {
        pars: 'nomen-adiectivum',
        parsMinor: "numerus-cardinalis",
        lexicographia: {
            lemma: 'trēs',
            radices: ['trēs'],
            etymologia: [],
            pronunciatio: [],
            references: [],
            lemmataAlterae: [],
            thema: 'consonans',
            lemmataAlii: {
                comparativus: '',
                superlativus: '',
            }
        },
        interpretationes: {
            Anglica: [
                {
                    significatio: 'three',
                    exempli: []
                },
            ]
        },
        inflectiones: {
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|masculinum|nominativus|positivus|-|-|-|-" : [ "trēs" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|femininum|nominativus|positivus|-|-|-|-" : [ "trēs" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|neutrum|nominativus|positivus|-|-|-|-" : [ "tria" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|masculinum|genetivus|positivus|-|-|-|-" : [ "trium" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|femininum|genetivus|positivus|-|-|-|-" : [ "trium" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|neutrum|genetivus|positivus|-|-|-|-" : [ "trium" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|masculinum|dativus|positivus|-|-|-|-" : [ "tribus" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|femininum|dativus|positivus|-|-|-|-" : [ "tribus" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|neutrum|dativus|positivus|-|-|-|-" : [ "tribus" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|masculinum|accusativus|positivus|-|-|-|-" : [ "trēs", "trīs" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|femininum|accusativus|positivus|-|-|-|-" : [ "trēs", "trīs" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|neutrum|accusativus|positivus|-|-|-|-" : [ "tria" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|masculinum|ablativus|positivus|-|-|-|-" : [ "tribus" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|femininum|ablativus|positivus|-|-|-|-" : [ "tribus" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|neutrum|ablativus|positivus|-|-|-|-" : [ "tribus" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|masculinum|vocativus|positivus|-|-|-|-" : [ "trēs" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|femininum|vocativus|positivus|-|-|-|-" : [ "trēs" ],
            "nomen-adiectivum|numerus-cardinalis|pluralis|-|neutrum|vocativus|positivus|-|-|-|-" : [ "tria" ]
        }
    },
    makeIndeclinableNumeralCardinal("quattuor", "four"),
    makeIndeclinableNumeralCardinal("quīnque", "five"),
    makeIndeclinableNumeralCardinal("sex", "six"),
    makeIndeclinableNumeralCardinal("septem", "seven"),
    makeIndeclinableNumeralCardinal("octō", "eight"),
    makeIndeclinableNumeralCardinal("novem", "nine"),
    makeIndeclinableNumeralCardinal("decem", "ten"),
]

