import { database } from './database'

async function migrate() {
    await database.connect()
    const urls = await database.getPageUrls()
    for (const url of urls) {
        if (urls.indexOf(url) < 30000) {
            continue
        }
        const page = await database.findPageByUrl(url)
        if (page) {
            const similar = await database.findPagesByUrl(page.remoteUrl)
            if (similar.length > 1) {
                console.info('dropping similar pages from', page.entry)
                for (const duplicate of similar.slice(1)) {
                    await database.removePageById(duplicate.id)
                }
            }
        }
    }
}

migrate()
