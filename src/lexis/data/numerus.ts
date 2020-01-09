import { NomenAdiectivum } from "../../lexis";

interface NumeriaTabula {
    cardinalis: NomenAdiectivum
    ordinalis: NomenAdiectivum
    distributum: NomenAdiectivum
}

const tabulae: {[numerus: number]: NumeriaTabula} = {
    1: {
        cardinalis: {
            inflectiones: {
                "nomen-adiectivum|-|singularis|-|masculinum|nominativus|positivus|-|-|-|-" : [ "unus" ],
                "nomen-adiectivum|-|singularis|-|femininum|nominativus|positivus|-|-|-|-" : [ "una" ],
                "nomen-adiectivum|-|singularis|-|neutrum|nominativus|positivus|-|-|-|-" : [ "unum" ],
                "nomen-adiectivum|-|pluralis|-|masculinum|nominativus|positivus|-|-|-|-" : [ "unī" ],
                "nomen-adiectivum|-|pluralis|-|femininum|nominativus|positivus|-|-|-|-" : [ "unae" ],
                "nomen-adiectivum|-|pluralis|-|neutrum|nominativus|positivus|-|-|-|-" : [ "una" ],
                "nomen-adiectivum|-|singularis|-|masculinum|genetivus|positivus|-|-|-|-" : [ "unī" ],
                "nomen-adiectivum|-|singularis|-|femininum|genetivus|positivus|-|-|-|-" : [ "unae" ],
                "nomen-adiectivum|-|singularis|-|neutrum|genetivus|positivus|-|-|-|-" : [ "unī" ],
                "nomen-adiectivum|-|pluralis|-|masculinum|genetivus|positivus|-|-|-|-" : [ "unōrum" ],
                "nomen-adiectivum|-|pluralis|-|femininum|genetivus|positivus|-|-|-|-" : [ "unārum" ],
                "nomen-adiectivum|-|pluralis|-|neutrum|genetivus|positivus|-|-|-|-" : [ "unōrum" ],
                "nomen-adiectivum|-|singularis|-|masculinum|dativus|positivus|-|-|-|-" : [ "unō" ],
                "nomen-adiectivum|-|singularis|-|femininum|dativus|positivus|-|-|-|-" : [ "unae" ],
                "nomen-adiectivum|-|singularis|-|neutrum|dativus|positivus|-|-|-|-" : [ "unō" ],
                "nomen-adiectivum|-|pluralis|-|masculinum|dativus|positivus|-|-|-|-" : [ "unīs" ],
                "nomen-adiectivum|-|pluralis|-|femininum|dativus|positivus|-|-|-|-" : [ "unīs" ],
                "nomen-adiectivum|-|pluralis|-|neutrum|dativus|positivus|-|-|-|-" : [ "unīs" ],
                "nomen-adiectivum|-|singularis|-|masculinum|accusativus|positivus|-|-|-|-" : [ "unum" ],
                "nomen-adiectivum|-|singularis|-|femininum|accusativus|positivus|-|-|-|-" : [ "unam" ],
                "nomen-adiectivum|-|singularis|-|neutrum|accusativus|positivus|-|-|-|-" : [ "unum" ],
                "nomen-adiectivum|-|pluralis|-|masculinum|accusativus|positivus|-|-|-|-" : [ "unōs" ],
                "nomen-adiectivum|-|pluralis|-|femininum|accusativus|positivus|-|-|-|-" : [ "unās" ],
                "nomen-adiectivum|-|pluralis|-|neutrum|accusativus|positivus|-|-|-|-" : [ "una" ],
                "nomen-adiectivum|-|singularis|-|masculinum|ablativus|positivus|-|-|-|-" : [ "unō" ],
                "nomen-adiectivum|-|singularis|-|femininum|ablativus|positivus|-|-|-|-" : [ "unā" ],
                "nomen-adiectivum|-|singularis|-|neutrum|ablativus|positivus|-|-|-|-" : [ "unō" ],
                "nomen-adiectivum|-|pluralis|-|masculinum|ablativus|positivus|-|-|-|-" : [ "unīs" ],
                "nomen-adiectivum|-|pluralis|-|femininum|ablativus|positivus|-|-|-|-" : [ "unīs" ],
                "nomen-adiectivum|-|pluralis|-|neutrum|ablativus|positivus|-|-|-|-" : [ "unīs" ],
                "nomen-adiectivum|-|singularis|-|masculinum|vocativus|positivus|-|-|-|-" : [ "une" ],
                "nomen-adiectivum|-|singularis|-|femininum|vocativus|positivus|-|-|-|-" : [ "una" ],
                "nomen-adiectivum|-|singularis|-|neutrum|vocativus|positivus|-|-|-|-" : [ "unum" ],
                "nomen-adiectivum|-|pluralis|-|masculinum|vocativus|positivus|-|-|-|-" : [ "unī" ],
                "nomen-adiectivum|-|pluralis|-|femininum|vocativus|positivus|-|-|-|-" : [ "unae" ],
                "nomen-adiectivum|-|pluralis|-|neutrum|vocativus|positivus|-|-|-|-" : [ "una" ]
            }
        }

    },
    2: {

    },
    3: {

    },
    4: {

    },
    5: {

    },
    6: {

    },
    7: {

    },
    8: {

    },
    9: {

    },
    10: {

    },
    20: {

    },
    30: {

    },
    100: {

    },
    1000: {

    },
}
