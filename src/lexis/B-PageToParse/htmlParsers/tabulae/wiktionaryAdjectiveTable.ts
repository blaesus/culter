import { Casus, Genus, Gradus, Inflectiones, Numerus, StatusAdiectivi } from 'lexis'
import { translateEnglishCase } from './translateCase'
import { splitMultipleFormae } from 'utils'
import { serializeStatum } from 'serialization'

function makeEmptyMFNTable(): string[][] {
    return [
        ['', '', '', '', '', ''],
        ['', '', '', '', '', ''],
        ['', '', '', '', '', ''],
        ['', '', '', '', '', ''],
        ['', '', '', '', '', ''],
        ['', '', '', '', '', ''],
    ]
}

function makeEmptyMNTable(): string[][] {
    return [
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
    ]
}

function regularizeTable(rows: CheerioElement[], $: CheerioStatic, mergeMF: boolean): string[][] {
    const table = mergeMF ? makeEmptyMNTable() : makeEmptyMFNTable()
    for (let rowNumber = 0; rowNumber < rows.length; rowNumber += 1) {
        const row = rows[rowNumber]
        const cells = $(row).find('td').toArray().filter(cell => !!$(cell).text().trim())
        let columnOffset = 0
        for (let cellNumber = 0; cellNumber < cells.length; cellNumber += 1) {
            const cell = cells[cellNumber]
            const $cell = $(cell)
            const text =$cell.text().trim()
            const rowSpan = +$cell.attr('rowspan')
            const colSpan = +$cell.attr('colspan')
            if (rowSpan) {
                for (let extraRow = 1; extraRow < rowSpan; extraRow += 1) {
                    table[rowNumber + extraRow][cellNumber + columnOffset] = text
                }
            }
            if (colSpan) {
                for (let extraColumn = 1; extraColumn < colSpan; extraColumn += 1) {
                    table[rowNumber][cellNumber + extraColumn + columnOffset] = text
                }
            }
            while (table[rowNumber][cellNumber + columnOffset]) {
                columnOffset += 1
            }
            table[rowNumber][cellNumber + columnOffset] = text
            if (colSpan) {
                columnOffset += colSpan - 1
            }
        }
    }
    
    // Fill vocative with nomative if empty
    if (table[table.length - 1].every(cell => !cell)) {
        table[table.length - 1] = [...table[0]]
    }
    
    if (table.some(row => row.some(cell => !cell))) {
        throw new Error('Cannot fill adjective table')
    }
    
    return table
}

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
                    inflectiones[clavis] = splitMultipleFormae(formae)
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
                inflectiones[clavis] = splitMultipleFormae(formae)
            }
        }
    }
    return inflectiones
}
