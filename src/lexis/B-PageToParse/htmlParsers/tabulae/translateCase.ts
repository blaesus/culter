import { Casus } from '../../../../lexis'

export function translateEnglishCase(s: string): Casus {
    switch (s) {
        case 'nominative':
            return 'nominativus'
        case 'genitive':
            return 'genetivus'
        case 'dative':
            return 'dativus'
        case 'accusative':
            return 'accusativus'
        case 'ablative':
            return 'ablativus'
        case 'vocative':
            return 'vocativus'
        case 'locative':
            return 'locativus'
        default: {
            throw new Error(`Unexpected case ${s}`)
        }
    }
}

