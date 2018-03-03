import { getBestDataForLemma } from '../C-ParseToLexis/getDataForLemma'

async function testParse() {
    const lemma = process.argv[2]
    console.info(JSON.stringify(await getBestDataForLemma(lemma), null, 4))
    process.exit()
}

testParse()
