import { Casus, Inflectiones, Numerus, StatusSubstantivi, StatusSubstantiviGenereMutabile } from "lexis";
import { translateEnglishCase } from './translateCase'
import { serializeStatum } from 'serialization'
import { regularizeTable, splitMultipleFormaeFromDom } from "./nominalTableUtils";

const numeri: Numerus[] = ['singularis', 'pluralis']

export function parseTabluamSubstantivum(tableNode: CheerioElement, $: CheerioStatic): Inflectiones<StatusSubstantivi> {
    const inflectiones: Inflectiones<StatusSubstantivi> = {}
    for (const row of $(tableNode).find('tr').toArray()) {
        const cellHead = $(row).find('th')
        const contentCells = $(row).find('td')
        const header = $(cellHead).text()
        if (header.includes('Case')) {
            continue
        }
        const casus = translateEnglishCase(header)
        
        for (let i = 0; i < contentCells.length; i += 1) {
            const status: StatusSubstantivi = {
                casus,
                numerus: numeri[i],
                persona: 'tertia'
            }
            const clavis = serializeStatum('nomen-substantivum', status)
            inflectiones[clavis] = splitMultipleFormaeFromDom(contentCells[i], $)
        }
    }
    return inflectiones
}

const caseOrder: Casus[] = [
    'nominativus'
    , 'genetivus'
    , 'accusativus'
    , 'dativus'
    , 'ablativus'
    , 'locativus'
    , 'vocativus'
]

export function parseTabluamSubstantivumGenereMutabile(tableNode: CheerioElement, $: CheerioStatic): Inflectiones<StatusSubstantiviGenereMutabile> {
    const inflectiones: Inflectiones<StatusSubstantiviGenereMutabile> = {}
    const allRows = $(tableNode).find('tr').toArray()
    const rows = allRows
        .filter(row => {
            const rowText = $(row).text()
            return !rowText.includes('Number') && !rowText.includes('Case')
        })
    const table = regularizeTable(rows, $, true)
    for (let y = 0; y < table.length; y += 1) {
        const row = table[y]
        for (let x = 0; x < row.length; x += 1) {
            const casus = caseOrder[y]
            const forma = row[x]
            const status: StatusSubstantiviGenereMutabile = {
                casus,
                numerus: x <= 1 ? "singularis" : "pluralis",
                persona: 'tertia',
                genus: x % 2 === 0 ? "masculinum" : "femininum",
            }
            const clavis = serializeStatum(
                'nomen-substantivum',
                status,
                {parsMinor: 'nomen-substantivum-genere-mutabile'}
            )
            inflectiones[clavis] = [forma]
        }
    }
    return inflectiones
}

