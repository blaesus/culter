const text = require('fs').readFileSync('Lingua Latina Nova.txt').toString()
const lines = text.split('\n')

for (let i = 0; i< lines.length; i++) {
  const line = lines[i]
  let [id, lemma, partes, anglice, genus, ante, tags] = line.split('\t')
  if (!partes) continue
  if (partes.endsWith('-a -um') && lemma.endsWith('us')) {
    const partA = lemma
    const partB = lemma.replace(/us$/, 'a')
    const partC = lemma.replace(/us$/, 'um')
    partes = [partA, partB, partC].join(', ')
    lines[i] = [id, lemma, partes, anglice, genus, ante, tags].join('\t')
  }
  if (partes.endsWith('-ae -a') && lemma.endsWith('ī')) {
    const partA = lemma
    const partB = lemma.replace(/ī$/, 'ae')
    const partC = lemma.replace(/ī$/, 'a')
    partes = [partA, partB, partC].join(', ')
    lines[i] = [id, lemma, partes, anglice, genus, ante, tags].join('\t')
  }
  if (partes.endsWith('-ae') && lemma.endsWith('a')) {
    const partA = lemma
    const partB = lemma.replace(/a$/, 'ae')
    partes = [partA, partB].join(', ')
    lines[i] = [id, lemma, partes, anglice, genus, ante, tags].join('\t')
  }
}

const newText = lines.join('\n')
require('fs').writeFileSync('Lingua Latina Nova.txt', newText)

