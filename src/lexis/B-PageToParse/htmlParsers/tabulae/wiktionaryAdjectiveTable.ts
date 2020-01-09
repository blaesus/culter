import { Casus, Genus, Gradus, Inflectiones, Numerus, StatusAdiectivi } from 'lexis'
import { translateEnglishCase } from './translateCase'
import { splitMultipleFormaeFromDom, splitMultipleFormaeFromString } from "utils";
import { serializeStatum } from 'serialization'
import { regularizeTable } from "./nominalTableUtils";

const firstOrder: { numerus: Numerus, genus: Genus }[] = [
    {numerus: 'singularis', genus: 'masculinum'},
    {numerus: 'singularis', genus: 'femininum'},
    {numerus: 'singularis', genus: 'neutrum'},
    {numerus: 'pluralis', genus: 'masculinum'},
    {numerus: 'pluralis', genus: 'femininum'},
    {numerus: 'pluralis', genus: 'neutrum'},
]

const thirdOrder: { numerus: Numerus, genera: Genus[] }[] = [
    {numerus: 'singularis', genera: ['masculinum', 'femininum']},
    {numerus: 'singularis', genera: ['neutrum']},
    {numerus: 'pluralis', genera: ['masculinum', 'femininum']},
    {numerus: 'pluralis', genera: ['neutrum']},
]

let casusOrder: Casus[] = []

export function parseTabluamAdiectivi(tableNode: CheerioElement,
                                      $: CheerioStatic,
                                      gradus: Gradus = 'positivus'): Inflectiones<StatusAdiectivi> {
    const inflectiones: Inflectiones<StatusAdiectivi> = {}
    const allRows = $(tableNode).find('tr').toArray()
    const mergeMF = allRows.every(row => $(row).find('th:contains(Feminine)').length === 0)
    
    const rows = allRows
        .filter(row => {
            const rowText = $(row).text()
            return !rowText.includes('Number') && !rowText.includes('Case')
        })
    const table = regularizeTable(rows, $, mergeMF)
    $(rows).find('th').toArray().forEach(header => {
        try {
            casusOrder.push(translateEnglishCase($(header).text()))
        }
        catch {
        }
    })
    
    for (let rowNumber = 0; rowNumber < table.length; rowNumber += 1) {
        const row = table[rowNumber]
        for (let columnNumber = 0; columnNumber < row.length; columnNumber += 1) {
            const formae = table[rowNumber][columnNumber]
            const casus = casusOrder[rowNumber]
            if (mergeMF) {
                const def = thirdOrder[columnNumber]
                for (const genus of def.genera) {
                    const status: StatusAdiectivi = {
                        numerus: def.numerus,
                        genus,
                        casus,
                        gradus,
                    }
                    const clavis = serializeStatum('nomen-adiectivum', status)
                    inflectiones[clavis] = splitMultipleFormaeFromString(formae)
                }
            }
            else {
                const def = firstOrder[columnNumber]
                const status: StatusAdiectivi = {
                    numerus: def.numerus,
                    genus: def.genus,
                    casus,
                    gradus,
                }
                const clavis = serializeStatum('nomen-adiectivum', status)
                inflectiones[clavis] = splitMultipleFormaeFromString(formae)
            }
        }
    }
    return inflectiones
}
