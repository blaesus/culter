import { database } from 'lexis/database'
import { demacron } from 'utils'
import { data } from 'lexis/data'
import { ThemaVerbi } from 'lexis'

export type TabulaParticipiorum = {
    [verbum in string]?: string
}

function getParticipium(forma: string, thema?: ThemaVerbi): string {
    if (!thema || thema === 'ignotum') {
        // heuristics
        if (forma.endsWith('eō')) {
            thema = 'ē'
        }
        else if (forma.endsWith('iō')) {
            thema = 'ī'
        }
    }
    switch (thema) {
        case 'ā': {
            console.info(forma.replace(/ō$/, 'ans'))
            return forma.replace(/ō$/, 'ans')
        }
        case 'ē': {
            return forma.replace(/eō$/, 'ens')
        }
        default: {
            return forma.replace(/ō$/, 'ens')
        }
    }
}

async function makeTabulamThematumVerborum() {
    await database.connect()
    const tabula: TabulaParticipiorum = {}
    const lexisIds = await database.getLexesInternalIds()
    for (const id of lexisIds) {
        const lexis = await database.getLexisByInternalId(id)
        if (lexis && lexis.pars === 'participium') {
            tabula[demacron(lexis.lexicographia.lemmaVerbi)] = demacron(lexis.lexicographia.lemma)
        }
    }
    for (const id of lexisIds) {
        const lexis = await database.getLexisByInternalId(id)
        if (lexis && lexis.pars === 'verbum' && !tabula[demacron(lexis.lexicographia.lemma)]) {
            tabula[demacron(lexis.lexicographia.lemma)] = demacron(getParticipium(lexis.lexicographia.lemma))
        }
    }
    await data.saveTabulamParticipiorum(tabula)
    process.exit()
}

makeTabulamThematumVerborum()
