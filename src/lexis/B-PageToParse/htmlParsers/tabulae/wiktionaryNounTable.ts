import { Inflectiones, Numerus, StatusSubstantivi } from 'lexis'
import { translateEnglishCase } from './translateCase'
import { splitMultipleFormae } from 'utils'
import { serializeStatum } from 'serialization'

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
            inflectiones[clavis] = splitMultipleFormae($(contentCells[i]).text())
        }
    }
    return inflectiones
}
