import { database } from './database'

async function migrate() {
    await database.connect()
    await database.setup()
    process.exit()
}

migrate()
