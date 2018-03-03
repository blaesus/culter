import * as http from 'http'
import { database } from 'lexis/database'

const server = http.createServer(async (request, response) => {
    await database.connect()
    if (request.url) {
        const query = request.url
                             .replace('\/wiki', '')
                             .replace('\/', '')
                             .replace(/#.*$/, '')
        const pages = await database.findPagesByEntry(decodeURIComponent(query))
        if (pages.length > 0) {
            const html = pages[pages.length - 1].html
                                                .replace(/<script.*<\/script>/g, '')
                                                .replace(/<link rel="stylesheet".*\/>/g, '')
            
            response.end(html)
        }
        else {
            response.statusCode = 404
            response.end('Not found')
        }
    }
    else {
        response.statusCode = 404
        response.end('Not found')
    }
})

const PORT = 9900

server.listen(9900, () => console.info(`http server running on ${PORT}`))
