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

export function demacron(s?: string): string {
    s = s || ''
    return s.replace(/ā/g, 'a').replace(/ō/g, 'o').replace(/ī/g, 'i').replace(/ū/g, 'u').replace(/ē/g, 'e')
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

export function splitMultipleFormae(s: string): string[] {
    return s.split(',')
            .map(s => s.split('\n'))
            .reduce(flatten, [])
            .map(s => s.trim())
            .map(s => s.replace(/\d$/, ''))
}

export function decapitalize(s: string): string {
    return s.charAt(0).toLowerCase() + s.slice(1)
}

export function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

function isCapitalized(s: string): boolean {
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

export function removeNullItems<T>(accumulated: T[], next: T | null): T[] {
    if (next) {
        return accumulated.concat(next)
    }
    return accumulated
}
