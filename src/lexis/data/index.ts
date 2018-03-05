import { readFileAsync, readJSONAsync, writeFileAsync } from 'nodeUtils'
import { viaFrequencyTable, viaInflectionDict, viaLemmata, viaPOSStat, viaTreebank } from 'config'
import { FrequencyTable } from 'analysis/makeCrudeFrequencyTable'
import { InflectionDict } from 'lexis/D-LexisToDict/makeInflectionDict'
import { TreebankDatabase } from 'analysis/Model'

const beautyStringify = (obj: {}) => JSON.stringify(obj, null, 4)
const compactstringify = (obj: {}) => JSON.stringify(obj)

export const data = {
    getLemmata(): Promise<string[]> {
        return readJSONAsync(viaLemmata)
    },
    setLemmata(lemmata: string[]) {
        return writeFileAsync(viaLemmata, beautyStringify(lemmata))
    },
    getFrequencyTable(): Promise<FrequencyTable> {
        return readJSONAsync(viaFrequencyTable)
    },
    saveFrequencyTable(table: FrequencyTable) {
        return writeFileAsync(viaFrequencyTable, beautyStringify(table))
    },
    getInflectionDict(): Promise<InflectionDict> {
        return readJSONAsync(viaInflectionDict)
    },
    saveInflectionDict(dict: InflectionDict) {
        return writeFileAsync(viaInflectionDict, compactstringify(dict))
    },
    savePOSStat(data: any) {
        return writeFileAsync(viaPOSStat, compactstringify(data))
    },
    saveTreebanks(data: TreebankDatabase) {
        return writeFileAsync(viaTreebank, beautyStringify(data))
    },
    getTreebanks(): Promise<TreebankDatabase> {
        return readJSONAsync(viaTreebank)
    },
}
