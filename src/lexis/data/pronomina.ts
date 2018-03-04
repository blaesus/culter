import { Casus, Genus, Numerus, PersonaPrononimisPersonalis } from 'lexis'

type Sex<T> = [T, T, T, T, T, T]

export const caseOrderPronominum: Sex<Casus> = [
    'nominativus',
    'genetivus',
    'dativus',
    'accusativus',
    'ablativus',
    'vocativus',
]

type Row = Sex<string[]>

export const personaePrononimis: PersonaPrononimisPersonalis[] = ['prima', 'secunda', 'reflexiva']

export type LemmaPronominisDemonstrativi = 'is' | 'hic' | 'ille' | 'iste'
export const lemmataPronominis: LemmaPronominisDemonstrativi[] = ['is', 'hic', 'ille', 'iste']

export type ComboNumerusGenusCasus = {
    [numerus in Numerus]: {
        [genus in Genus]: Row
    }
}

interface TabulaPronominum {
    personale: {
        [persona in PersonaPrononimisPersonalis]: {
            [numerus in Numerus]: Row
        }
    }
    possessivum: {
        [persona in PersonaPrononimisPersonalis]: {
            [numerus in Numerus]: ComboNumerusGenusCasus
        }
    }
    demonstrativum: {
        [lemma in LemmaPronominisDemonstrativi]: ComboNumerusGenusCasus
    }
    interrogativum: ComboNumerusGenusCasus
    relativum: ComboNumerusGenusCasus
    refexivum: ComboNumerusGenusCasus
    nihil: {
        nominativus: string
        accusativus: string
    }
    nemo: Row
}

export const tabulaPronominum: TabulaPronominum = {
    personale: {
        prima: {
            singularis: [
                ['ego', 'egō'],
                ['meī'],
                ['mihi', 'mihī', 'mī'],
                ['mē'],
                ['mē'],
                ['egō'],
            ],
            pluralis: [
                ['nōs'],
                ['nostrī', 'nostrum'],
                ['nōbīs'],
                ['nōs'],
                ['nōbīs'],
                ['nōs'],
            ],
        },
        secunda: {
            singularis: [
                ['tū'],
                ['tuī'],
                ['tibi'],
                ['tē'],
                ['tē'],
                ['tū'],
            ],
            pluralis: [
                ['vōs'],
                ['vestrī', 'vestrum'],
                ['vōbīs'],
                ['vōs'],
                ['vōbīs'],
                ['vōs'],
            ],
        },
        reflexiva: {
            singularis: [
                [],
                ['suī'],
                ['sibi'],
                ['sē', 'sēsē'],
                ['sē', 'sēsē'],
                [],
            ],
            pluralis: [
                [],
                ['suī'],
                ['sibi'],
                ['sē', 'sēsē'],
                ['sē', 'sēsē'],
                [],
            ]
        },
    },
    possessivum: {
        prima: {
            singularis: {
                singularis: {
                    masculinum: [
                        ['meus'],
                        ['meī'],
                        ['meō'],
                        ['meum'],
                        ['meō'],
                        ['mī'],
                    ],
                    femininum: [
                        ['mea'],
                        ['meae'],
                        ['meae'],
                        ['meam'],
                        ['meā'],
                        ['mea'],
                    ],
                    neutrum: [
                        ['meum'],
                        ['meī'],
                        ['meō'],
                        ['meum'],
                        ['meō'],
                        ['meum'],
                    ],
                },
                pluralis: {
                    masculinum: [
                        ['meī'],
                        ['meōrum'],
                        ['meīs'],
                        ['meōs'],
                        ['meīs'],
                        ['meī'],
                    ],
                    femininum: [
                        ['meae'],
                        ['meārum'],
                        ['meīs'],
                        ['meās'],
                        ['meīs'],
                        ['meae'],
                    ],
                    neutrum: [
                        ['mea'],
                        ['meōrum'],
                        ['meīs'],
                        ['mea'],
                        ['meīs'],
                        ['mea'],
                    ],
                }
            },
            pluralis: {
                singularis: {
                    masculinum: [
                        ['noster'],
                        ['nostrī'],
                        ['nostrō'],
                        ['nostrum'],
                        ['nostrō'],
                        ['noster'],
                    ],
                    femininum: [
                        ['nostra'],
                        ['nostrae'],
                        ['nostrae'],
                        ['nostram'],
                        ['nostrā'],
                        ['nostra'],
                    ],
                    neutrum: [
                        ['nostrum'],
                        ['nostrī'],
                        ['nostrō'],
                        ['nostrum'],
                        ['nostrō'],
                        ['nostrum']
                    ],
                },
                pluralis: {
                    masculinum: [
                        ['nostrī'],
                        ['nostrōrum'],
                        ['nostrīs'],
                        ['nostrōs'],
                        ['nostrīs'],
                        ['nostrī'],
                    ],
                    femininum: [
                        ['nostrae'],
                        ['nostrārum'],
                        ['nostrīs'],
                        ['nostrās'],
                        ['nostrīs'],
                        ['nostrae'],
                    ],
                    neutrum: [
                        ['nostra'],
                        ['nostrōrum'],
                        ['nostrīs'],
                        ['nostra'],
                        ['nostrīs'],
                        ['nostra']
                    ],
                }
            }
        },
        secunda: {
            singularis: {
                singularis: {
                    masculinum: [
                        ['tuus'],
                        ['tuī'],
                        ['tuō'],
                        ['tuum'],
                        ['tuō'],
                        ['tue'],
                    ],
                    femininum: [
                        ['tua'],
                        ['tuae'],
                        ['tuae'],
                        ['tuam'],
                        ['tuā'],
                        ['tua']
                    ],
                    neutrum: [
                        ['tuum'],
                        ['tuī'],
                        ['tuō'],
                        ['tuum'],
                        ['tuō'],
                        ['tuum'],
                    ],
                },
                pluralis: {
                    masculinum: [
                        ['tuī'],
                        ['tuōrum'],
                        ['tuīs'],
                        ['tuōs'],
                        ['tuīs'],
                        ['tuī'],
                    ],
                    femininum: [
                        ['tuae'],
                        ['tuārum'],
                        ['tuīs'],
                        ['tuās'],
                        ['tuīs'],
                        ['tuae']
                    ],
                    neutrum: [
                        ['tua'],
                        ['tuōrum'],
                        ['tuīs'],
                        ['tua'],
                        ['tuīs'],
                        ['tua'],
                    ],
                },
            },
            pluralis: {
                singularis: {
                    masculinum: [
                        ['vester'],
                        ['vestrī'],
                        ['vestrō'],
                        ['vestrum'],
                        ['vestrō'],
                        ['vester'],
                    ],
                    femininum: [
                        ['vestra'],
                        ['vestrae'],
                        ['vestrae'],
                        ['vestram'],
                        ['vestrā'],
                        ['vestra'],
                    ],
                    neutrum: [
                        ['vestrum'],
                        ['vestrī'],
                        ['vestrō'],
                        ['vestrum'],
                        ['vestrō'],
                        ['vestrum'],
                    ],
                },
                pluralis: {
                    masculinum: [
                        ['vestrī'],
                        ['vestrōrum'],
                        ['vestrīs'],
                        ['vestrōs'],
                        ['vestrīs'],
                        ['vestrī'],
                    ],
                    femininum: [
                        ['vestrae'],
                        ['vestrārum'],
                        ['vestrīs'],
                        ['vestrās'],
                        ['vestrīs'],
                        ['vestrae'],
                    ],
                    neutrum: [
                        ['vestra'],
                        ['vestrōrum'],
                        ['vestrīs'],
                        ['vestra'],
                        ['vestrīs'],
                        ['vestra'],
                    ],
                },
            }
        },
        reflexiva: {
            singularis: {
                singularis: {
                    masculinum: [
                        ['suus'],
                        ['suī'],
                        ['suō'],
                        ['suum'],
                        ['suō'],
                        ['sue'],
                    ],
                    femininum: [
                        ['sua'],
                        ['suae'],
                        ['suae'],
                        ['suam'],
                        ['suā'],
                        ['sua'],
                    ],
                    neutrum: [
                        ['suum'],
                        ['suī'],
                        ['suō'],
                        ['suum'],
                        ['suō'],
                        ['suum'],
                    ],
                },
                pluralis: {
                    masculinum: [
                        ['suī'],
                        ['suōrum'],
                        ['suīs'],
                        ['suōs'],
                        ['suīs'],
                        ['suī'],
                    ],
                    femininum: [
                        ['suae'],
                        ['suārum'],
                        ['suīs'],
                        ['suās'],
                        ['suīs'],
                        ['suae'],
                    ],
                    neutrum: [
                        ['sua'],
                        ['suōrum'],
                        ['suīs'],
                        ['sua'],
                        ['suīs'],
                        ['sua'],
                    ],
                },
            },
            pluralis: {
                singularis: {
                    masculinum: [
                        ['suus'],
                        ['suī'],
                        ['suō'],
                        ['suum'],
                        ['suō'],
                        ['sue'],
                    ],
                    femininum: [
                        ['sua'],
                        ['suae'],
                        ['suae'],
                        ['suam'],
                        ['suā'],
                        ['sua'],
                    ],
                    neutrum: [
                        ['suum'],
                        ['suī'],
                        ['suō'],
                        ['suum'],
                        ['suō'],
                        ['suum'],
                    ],
                },
                pluralis: {
                    masculinum: [
                        ['suī'],
                        ['suōrum'],
                        ['suīs'],
                        ['suōs'],
                        ['suīs'],
                        ['suī'],
                    ],
                    femininum: [
                        ['suae'],
                        ['suārum'],
                        ['suīs'],
                        ['suās'],
                        ['suīs'],
                        ['suae'],
                    ],
                    neutrum: [
                        ['sua'],
                        ['suōrum'],
                        ['suīs'],
                        ['sua'],
                        ['suīs'],
                        ['sua'],
                    ],
                },
            },
        }
    },
    demonstrativum: {
        is: {
            singularis: {
                masculinum: [
                    ['is'],
                    ['eius', 'ejus'],
                    ['eī'],
                    ['eum'],
                    ['eō'],
                    [],
                ],
                femininum: [
                    ['ea'],
                    ['eius', 'ejus'],
                    ['eī'],
                    ['eam'],
                    ['eā'],
                    [],
                ],
                neutrum: [
                    ['id'],
                    ['eius', 'ejus'],
                    ['eī'],
                    ['id'],
                    ['eō'],
                    [],
                ],
            },
            pluralis: {
                masculinum: [
                    ['eī', 'iī'],
                    ['eōrum'],
                    ['eīs', 'iīs'],
                    ['eōs'],
                    ['eīs', 'iīs'],
                    [],
                ],
                femininum: [
                    ['eae'],
                    ['eārum'],
                    ['eīs', 'iīs'],
                    ['eās'],
                    ['eīs', 'iīs'],
                    [],
                ],
                neutrum: [
                    ['ea'],
                    ['eōrum'],
                    ['eīs', 'iīs'],
                    ['eās'],
                    ['eīs', 'iīs'],
                    [],
                ],
            },
            
        },
        ille: {
            singularis: {
                masculinum: [
                    ['ille'],
                    ['illīus'],
                    ['illī'],
                    ['illum'],
                    ['illō'],
                    [],
                ],
                femininum: [
                    ['illa'],
                    ['illīus'],
                    ['illī'],
                    ['illam'],
                    ['illā'],
                    [],
                ],
                neutrum: [
                    ['illud'],
                    ['illīus'],
                    ['illī'],
                    ['illud'],
                    ['illō'],
                    [],
                ],
            },
            pluralis: {
                masculinum: [
                    ['illī'],
                    ['illōrum'],
                    ['illīs'],
                    ['illōs'],
                    ['illīs'],
                    [],
                ],
                femininum: [
                    ['illae'],
                    ['illārum'],
                    ['illīs'],
                    ['illās'],
                    ['illīs'],
                    [],
                ],
                neutrum: [
                    ['illa'],
                    ['illōrum'],
                    ['illīs'],
                    ['illa'],
                    ['illīs'],
                    [],
                ],
            },
            
        },
        iste: {
            singularis: {
                masculinum: [
                    ['iste'],
                    ['istīus'],
                    ['istī'],
                    ['istum'],
                    ['istō'],
                    [],
                ],
                femininum: [
                    ['ista'],
                    ['istīus'],
                    ['istī'],
                    ['istam'],
                    ['istā'],
                    [],
                ],
                neutrum: [
                    ['istud'],
                    ['istīus'],
                    ['istī'],
                    ['istud'],
                    ['istō'],
                    [],
                ],
            },
            pluralis: {
                masculinum: [
                    ['istī'],
                    ['istōrum'],
                    ['istīs'],
                    ['istōs'],
                    ['istīs'],
                    [],
                ],
                femininum: [
                    ['istae'],
                    ['istārum'],
                    ['istīs'],
                    ['istās'],
                    ['istīs'],
                    [],
                ],
                neutrum: [
                    ['ista'],
                    ['istōrum'],
                    ['istīs'],
                    ['ista'],
                    ['istīs'],
                    [],
                ],
            },
        },
        hic: {
            singularis: {
                masculinum: [
                    ['hic'],
                    ['huius'],
                    ['huic'],
                    ['hunc'],
                    ['hōc'],
                    [],
                ],
                femininum: [
                    ['haec'],
                    ['huius'],
                    ['huic'],
                    ['hanc'],
                    ['hāc'],
                    [],
                ],
                neutrum: [
                    ['hoc'],
                    ['huius'],
                    ['huic'],
                    ['hoc'],
                    ['hōc'],
                    [],
                ],
            },
            pluralis: {
                masculinum: [
                    ['hī'],
                    ['hōrum'],
                    ['hīs'],
                    ['hōs'],
                    ['hīs'],
                    [],
                ],
                femininum: [
                    ['hae'],
                    ['hārum'],
                    ['hīs'],
                    ['hās'],
                    ['hīs'],
                    [],
                ],
                neutrum: [
                    ['haec'],
                    ['hōrum'],
                    ['hīs'],
                    ['haec'],
                    ['hīs'],
                    [],
                ],
            },
            
        }
    },
    interrogativum: {
        singularis: {
            masculinum: [
                ['quis'],
                ['cuius'],
                ['cui'],
                ['quem'],
                ['quō'],
                [],
            ],
            femininum: [
                ['quis'],
                ['cuius'],
                ['cui'],
                ['quem'],
                ['quō'],
                [],
            ],
            neutrum: [
                ['quid'],
                ['cuius'],
                ['cui'],
                ['quid'],
                ['quō'],
                [],
            ],
        },
        pluralis: {
            masculinum: [
                ['quī'],
                ['quōrum'],
                ['quibus'],
                ['quōs'],
                ['quibus'],
                [],
            ],
            femininum: [
                ['quae'],
                ['quārum'],
                ['quibus'],
                ['quās'],
                ['quibus'],
                [],
            ],
            neutrum: [
                ['quae'],
                ['quōrum'],
                ['quibus'],
                ['quae'],
                ['quibus'],
                [],
            ],
        },
    },
    relativum: {
        singularis: {
            masculinum: [
                ['quī'],
                ['cuius'],
                ['cui'],
                ['quem'],
                ['quō'],
                [],
            ],
            femininum: [
                ['quae'],
                ['cuius'],
                ['cui'],
                ['quam'],
                ['quā'],
                [],
            ],
            neutrum: [
                ['quod'],
                ['cuius'],
                ['cui'],
                ['quod'],
                ['quō'],
                [],
            ],
        },
        pluralis: {
            masculinum: [
                ['quī'],
                ['quōrum'],
                ['quibus'],
                ['quōs'],
                ['quibus'],
                [],
            ],
            femininum: [
                ['quae'],
                ['quārum'],
                ['quibus'],
                ['quās'],
                ['quibus'],
                [],
            ],
            neutrum: [
                ['quae'],
                ['quōrum'],
                ['quibus'],
                ['quae'],
                ['quibus'],
                [],
            ],
        },
    },
    refexivum: {
        singularis: {
            masculinum: [
                ['ipse'],
                ['ipsīus'],
                ['ipsī'],
                ['ipsum'],
                ['ipsō'],
                [],
            ],
            femininum: [
                ['ipsa'],
                ['ipsīus'],
                ['ipsī'],
                ['ipsam'],
                ['ipsā'],
                [],
            ],
            neutrum: [
                ['ipsum'],
                ['ipsīus'],
                ['ipsī'],
                ['ipsum'],
                ['ipsō'],
                [],
            ],
        },
        pluralis: {
            masculinum: [
                ['ipsī'],
                ['ipsōrum'],
                ['ipsīs'],
                ['ipsōs'],
                ['ipsīs'],
                [],
            ],
            femininum: [
                ['ipsae'],
                ['ipsārum'],
                ['ipsīs'],
                ['ipsās'],
                ['ipsīs'],
                [],
            ],
            neutrum: [
                ['ipsa'],
                ['ipsōrum'],
                ['ipsīs'],
                ['ipsa'],
                ['ipsīs'],
                [],
            ],
        },
    },
    nihil: {
        nominativus: 'nihil',
        accusativus: 'nihil',
    },
    nemo: [
        ['nēmō'],
        ['nēminis'],
        ['nēminī'],
        ['nēminem'],
        ['nēmine'],
        ['nēmō'],
    ],
}
