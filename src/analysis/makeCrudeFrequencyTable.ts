import { readFileAsync } from 'nodeUtils'
import { data } from 'lexis/data'

export type FrequencyTable = {
    [key in string]?: number
    }

async function main() {
    const text = (await readFileAsync('data/crudeFrequencies.txt')).toString()
    const lines = text.split('\n')
    const table: FrequencyTable = {}
    for (const line of lines) {
        const [serial, lemma, frequency, cumulativeFrequency] = line.split('\t')
        if (lemma) {
            table[lemma] = +frequency
        }
    }
    await data.saveFrequencyTable(table)
}

if (require.main === module) {
    main()
}
