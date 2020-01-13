import { database } from "../lexis/database";
import { readFileAsync, writeFileAsync } from "../nodeUtils";

async function findDubious() {
    // let [id, lemma, partes, anglice, genus, ante, tags] = linea.split('\t')
    await database.connect()
    const lineae = (await readFileAsync('Lingua Latina.txt')).toString().split('\n')
    for (let i = 0; i < lineae.length; i++) {
        const linea = lineae[i]
        const [id, lemma, partes, anglice, genus, ante, tags] = linea.split('\t')
        const doc = await database.getLexesByLemma(lemma)
        if (doc.length >= 2) {
            console.info(lemma, '|', partes, '|',anglice)
        }

    }
    process.exit()
}

findDubious()
