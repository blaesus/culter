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

export function regularizeTable(rows: CheerioElement[], $: CheerioStatic, mergeMF: boolean): string[][] {
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

