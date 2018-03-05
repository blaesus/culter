import * as fs from 'fs'
import * as glob from 'glob'
import { promisify } from 'util'

export const readdirAsync = promisify(fs.readdir)
export const readFileAsync = promisify(fs.readFile)
export const writeFileAsync = promisify(fs.writeFile)
export const globAsync = promisify(glob)

export const readJSONAsync = async (path: string) => JSON.parse((await readFileAsync(path)).toString())

export const spawnConcurrent = (fn: (task: string) => Promise<any>, n: number) => Promise.all([
    ...Array.from(Object.keys(Array(n).fill(null))).map(fn)
])

