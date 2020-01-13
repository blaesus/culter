export function flatten<T>(previous: T[], next: T[]): T[] {
    return previous.concat(next)
}

export const loggingProxy = <T extends {}>(obj: T, name: string, verbose = false) => new Proxy(obj, {
    set(target: T, key: keyof T, value: any) {
        target[key] = value
        if (verbose) console.info(`${name}.${key} = ${JSON.stringify(value)}`)
        return true
    },
})

const macronsPairs: [string, string][] = [
    ['ā', 'a'],
    ['ō', 'o'],
    ['ī', 'i'],
    ['ū', 'u'],
    ['ē', 'e'],
    ['Ā', 'A'],
    ['Ō', 'O'],
    ['Ī', 'I'],
    ['Ū', 'U'],
    ['Ē', 'E'],
]

const marcronsRegexPairs: [RegExp, string][] = macronsPairs.map(pair =>
    [new RegExp(pair[0], 'g'), pair[1]] as [RegExp, string]
)

const unknownLengthPairs: [string, string][] = [
    ['ā̆', 'a'],
    ['ē̆', 'e'],
    ['ī̆', 'i'],
    ['ō̆', 'o'],
    ['ū̆', 'u'],
    ['Ā̆', 'a'],
    ['Ē̆', 'e'],
    ['Ī̆', 'i'],
    ['Ō̆', 'o'],
    ['Ū̆', 'u'],
]

const unknownLengthRegexPairs: [RegExp, string][] = unknownLengthPairs.map(pair =>
    [new RegExp(pair[0], 'g'), pair[1]] as [RegExp, string]
)

export function demacron(s?: string): string {
    s = s || ''
    for (const pair of marcronsRegexPairs) {
        s = s.replace(pair[0], pair[1])
    }
    for (const pair of unknownLengthRegexPairs) {
        s = s.replace(pair[0], pair[1])
    }
    return s
}

type ObjectWithValueType = {
    [key in string]: any
}

export const fallbackProxy = <T extends ObjectWithValueType>(obj: T, fallback: () => any): T => new Proxy(obj, {
    get(target, key) {
        if (target[key]) {
            return target[key]
        }
        else {
            return fallback()
        }
    }
})

export function splitMultipleFormaeFromString(s: string): string[] {
    return s.trim()
            .split(',')
            .map(s => s.split('\n'))
            .reduce(flatten, [])
            .filter(Boolean)
            .map(s => s.trim())
            .filter(s => s !== "—")
            .map(s => s.replace(/\d$/, ''))
}

export function decapitalize(s: string): string {
    return s.charAt(0).toLowerCase() + s.slice(1)
}

export function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

export function isCapitalized(s: string): boolean {
    return s.charAt(0).toUpperCase() === s.charAt(0)
}

export function reverseCapitalize(s: string): string {
    if (isCapitalized(s)) {
        return decapitalize(s)
    }
    else {
        return capitalize(s)
    }
}

export function bruteForceFixUV(s: string): string {
    if (s[0] === 'u') {
        return ['v', s.slice(1)].join('')
    }
    else {
        return s
    }
}


export function removeNullItems<T>(accumulated: T[], next: T | null): T[] {
    if (next) {
        return accumulated.concat(next)
    }
    return accumulated
}

export function stripVoid<T extends ObjectWithValueType>(obj: T): T {
    const result: T = {...(obj as any)}
    for (const key in result) {
        if (typeof result[key] === 'undefined' || result[key] === null) {
            delete result[key]
        }
    }
    return result
}

export function replaceUV(
    text: string,
    uvTarget: "u" | "v" = "v",
): string {
    // Translated from https://github.com/diyclassics/cltk/blob/uv-norm/cltk/stem/latin/j_v.py
    // Original license: MIT
    // Capitalization and Roman numeral handling is removed for simplicity

    const ENDINGS_PRESENT_3 = "o|is|it|imus|itis|unt|ebam|ebas|ebat|ebamus|ebatis|ebant|em|es|et|emus|etis|ent|am|as|at|amus|atis|ant|or|eris|itur|imur|imini|untur|ebar|ebaris|ebatur|ebamur|ebamini|ebantur|ar|eris|etur|emur|emini|entur"
    const ENDINGS_PERFECT = "i|isti|it|imus|istis|erunt|eram|eras|erat|eramus|eratis|erant|ero|eris|erit|erimus|eritis|erint|erim|isse|isses|isset|issemus|issetis|issent"
    const ENDINGS_12_DEC = "arum|orum|ae|am|as|us|um|is|os|a|i|o"
    const ENDINGS_3_DEC = "is|e|i|em|um|ibus|es"

    let replacePatterns: [string, string][] = []

    if (uvTarget === "u") {
        replacePatterns.push(['v', 'u'])
    }
    else {
        replacePatterns = replacePatterns.concat([
            ['(?<=\\bab|\\bad|\\bex|\\bin|\\bob)u(?=a|e|i|o|u)','v'],
            ['(?<=\\bcon|\\bper|\\bsub)u(?=a|e|i|o|u)','v'],
            ['(?<=\\btrans)u(?=a|e|i|o|u)','v'],
            ['(?<=\\bcircum)u(?=a|e|i|o|u)','v'],
            ['(?<=\\but)ue', 've'],
            ['(?<=\\bquam|\\bquem|\\bquid|\\bquod)u', 'v'],
            ['(?<=\\baliud|\\bcuius)u', 'v'],
            ['(?<=\\bquantas)u','v'],
            ['(?<=hel)u','v'],
            ['(?<=animad)u','v'],
        ])
        replacePatterns = replacePatterns.concat([
            ['vv','uv'],
            ['ivv','iuv'],
            ['luu','lvu'],
            ['muir','mvir'],
            ['(?<!a|e|i|o|u)lv','lu'],
            // (r'(?<!\br)u', 'v')
        ])
        replacePatterns = replacePatterns.concat([
            ['(?<=q)ve\\b','ue'],
            ['(?<=m|s)ue\\b', 've'],
        ])
        const excPatterns: [string, string][] = [
            [`\\bexv(${ENDINGS_PRESENT_3})(que)?\\b`,'exu\g<1>\g<2>'],
            [`\\beserui(${ENDINGS_PRESENT_3})(que)?\\b`,'servi\g<1>\g<2>'],
            [`\\b(ex)?arv(${ENDINGS_PERFECT})(que)?\\b`, '\g<1>aru\g<2>\g<3>'],
            [`\\b(con)?v(a|o)lv(${ENDINGS_PERFECT})(que)?\\b`, '\g<1>v\g<2>lu\g<3>\g<4>'],
            [`\\b(a|ad|ap)?p(a|e)rv(${ENDINGS_PERFECT})(que)?`, '\g<1>p\g<2>ru\g<3>\g<4>'],
            [`\\b(con|in|oc|per)?c(a|u)lv(${ENDINGS_PERFECT})(que)?`, '\g<1>c\g<2>lu\g<3>\g<4>'],
            [`\\b(e|pro)?rv(${ENDINGS_PERFECT})(que)?`,'\g<1>ru\g<2>\g<3>'],
            [`\\b(ab|dis|per|re)?solu(${ENDINGS_PERFECT})(que)?`, '\g<1>solv\g<2>\g<3>'],
            [`\\b(de)?serv(${ENDINGS_PERFECT})(que)?`, '\g<1>seru\g<2>\g<3>'],
            [`\\balv(${ENDINGS_PERFECT})(que)?`,'alu\g<1>\g<2>'],
            [`bsiluestr(is|e|i|em|um|ibus|es)`,'silvestr\g<1>'],
            [`\\bseruitu(s|t)(${ENDINGS_3_DEC})(que)?`,'servitu\g<1>\g<2>\g<3>'],
            [`\\bseruil(${ENDINGS_3_DEC})(que)?`,'servil\g<1>\g<2>'],
            [`\\b(ca|pa|se|si|va)(l|r)u(${ENDINGS_12_DEC})(que)?\\b`,'\g<1>\g<2>v\g<3>\g<4>'],
            [`\\bAdvatuc(${ENDINGS_12_DEC})(que)?\\b`,'Aduatuc\g<1>\g<2>'],
            [`\\bCaruili(${ENDINGS_12_DEC})(que)?\\b`,'Carvili\g<1>\g<2>'],
            [`\\bserui(an|re)(m|s|t|mus|tis|nt)(que)?`,'servi\g<1>\g<2>\g<3>'],
        ]
        replacePatterns = replacePatterns.concat(excPatterns)
    }

    for (const pair of replacePatterns) {
        const [regexString, replacment] = pair
        const regex = new RegExp(regexString, "i")
        text = text.replace(regex, replacment)
    }

    return text
}

export function updateLine(text: string) {
    (process.stdout as any).clearLine();
    (process.stdout as any).cursorTo(0);
    process.stdout.write(text);
}

// 'iū̆xtā' => ['iuxtā', 'iūxtā']
export function separateUnknownLength(forma: string): string[] {
    const BREVE = '̆'
    if (forma.includes(BREVE)) {
        let formae = [forma]
        for (let i = 0; i <formae.length; i += 1) {
            const characters = formae[i].split("")
            if (characters.includes(BREVE)) {
                const brevePos = characters.indexOf(BREVE)
                if (brevePos <= 0) {
                    continue
                }
                const previousCharacter = characters[brevePos-1]
                const correspondingShortForms = macronsPairs.find(pair => pair[0] === previousCharacter)
                if (!correspondingShortForms) {
                    continue
                }
                characters.splice(brevePos, 1)
                const originalFormWithoutBreve = characters.join("")
                const shortFormCharacters = [...characters]
                const shortCharacter = correspondingShortForms[1]
                shortFormCharacters[brevePos-1] = shortCharacter
                const shortFormWithoutBreve = shortFormCharacters.join("")

                formae.splice(i, 1)
                formae.push(originalFormWithoutBreve)
                formae.push(shortFormWithoutBreve)
            }
        }
        return formae
    }
    else {
        return [forma]
    }
}
