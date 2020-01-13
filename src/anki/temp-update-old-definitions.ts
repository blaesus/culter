import { database } from "../lexis/database";
import { readFileAsync, writeFileAsync } from "../nodeUtils";

async function update() {
    // let [id, lemma, partes, anglice, genus, ante, tags] = linea.split('\t')
    await database.connect()
    const lineae = (await readFileAsync('Lingua Latina.txt')).toString().split('\n')
    console.info(lineae.length)
    for (let i = 0; i < lineae.length; i++) {
        const linea = lineae[i]
        const [id, lemma, partes, anglice, genus, ante, tags] = linea.split('\t')
        const doc = await database.getLexesByLemma(lemma)
        if (doc.length >= 1) {
            const newPartes = doc[0].lexicographia.radices.join(', ')
            if (newPartes !== partes) {
                console.info(`${partes} => ${newPartes}`)
                lineae[i] = [id, lemma, newPartes, anglice, genus, ante, tags].join('\t')
            }
        }

    }
    await writeFileAsync('Lingua Latina Nova.txt', lineae.join('\n'))
    process.exit()
}

update()
