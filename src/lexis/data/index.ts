import { readFileAsync, readJSONAsync, writeFileAsync } from 'nodeUtils'
import {
    viaFrequencyTable, viaInflectionDict, viaLemmata, viaPOSStat, viaTabulaeParticipiorum,
    viaTreebank,
} from 'config'
import { FrequencyTable } from 'analysis/makeCrudeFrequencyTable'
import { InflectionDict } from 'lexis/D-LexisToDict/makeInflectionDict'
import { TreebankSerialized, TreebankSource } from 'analysis/Model'
import { TabulaParticipiorum } from 'analysis/makeTabulamParticipiorum'

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
        return writeFileAsync(viaInflectionDict, beautyStringify(dict))
    },
    savePOSStat(data: any) {
        return writeFileAsync(viaPOSStat, compactstringify(data))
    },
    saveTreebank(data: TreebankSerialized, source: TreebankSource) {
        return writeFileAsync(viaTreebank(source), beautyStringify(data))
    },
    getTreebanks(source: TreebankSource): Promise<TreebankSerialized> {
        return readJSONAsync(viaTreebank(source))
    },
    saveTabulamParticipiorum(data: TabulaParticipiorum) {
        return writeFileAsync(viaTabulaeParticipiorum, beautyStringify(data))
    },
    getTabulamParticipiorum(): Promise<TabulaParticipiorum> {
        return readJSONAsync(viaTabulaeParticipiorum)
    },
}
