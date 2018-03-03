import { spawnConcurrent } from 'nodeUtils'
import { database } from 'lexis/database'
import { parsePage } from 'lexis/B-PageToParse/parsePage'

interface CompilerState {
    urls: string[]
    failures: {
        [lemma in string]: string
        }
}

interface CompilerMetrics {
    totalTime: number
    N: number
}

async function parsePages(urls: string[]): Promise<{
    data: CompilerState
    metrics: CompilerMetrics
}> {
    const totalT0 = Date.now()
    const CONCURRENT_TRANSFORMERS = 16
    
    const state: CompilerState = {
        urls: [...urls],
        failures: {},
    }
    
    const metrics: CompilerMetrics = {
        totalTime: 0,
        N: state.urls.length
    }
    
    async function transform(task: string): Promise<void> {
        let url: string = ''
        if (state.urls.length) {
            url = state.urls[0]
            state.urls = state.urls.slice(1)
            if (state.urls.length % 100 === 0) {
                console.info(`transformer ${task}: parsing page ${url} (${state.urls.length} remaining)`)
            }
        }
        else {
            return
        }
        const page = await database.findPageByUrl(url)
        if (!page) {
            throw new Error(`Missing page for url ${url}`)
        }
        await parsePage(page)
        return transform(task)
    }
    
    await spawnConcurrent(transform, CONCURRENT_TRANSFORMERS)
    
    metrics.totalTime = Date.now() - totalT0
    return {
        data: state,
        metrics,
    }
}

async function main() {
    await database.connect()
    const urls = await database.getPageUrls()
    const {metrics} = await parsePages(urls)
    console.info(metrics)
    console.info(`average ${Math.round(metrics.totalTime * 100 / metrics.N) / 100}ms/entry`)
    
    process.exit()
}

if (require.main === module) {
    main()
}
