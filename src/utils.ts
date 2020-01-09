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

export function demacron(s?: string): string {
    s = s || ''
    for (const pair of marcronsRegexPairs) {
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
            .map(s => s.replace(/\d$/, ''))
}

export function splitMultipleFormaeFromDom(node: CheerioElement, $: CheerioStatic): string[] {
    const html = $(node).html()
    if (!html) {
        return []
    }
    // handle words like Israhel, where multiple forms are separated by <br>
    const htmlWithNewline = html.replace("<br>", "<div>\n</div>")
    $(node).html(htmlWithNewline)
    return splitMultipleFormaeFromString($(node).text())
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

export function fixUV(s: string): string {
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
