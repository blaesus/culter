import { writeFileAsync } from 'nodeUtils'
import { viaFailureReport } from 'config'
import { database } from 'lexis/database'
import { data } from 'lexis/data'

interface FailureReport {
    [lemma: string]: {
        order: number
        error: string
        frequency: number
    }
}

async function reportFailures() {
    await database.connect()
    const frequencyTable = await data.getFrequencyTable()
    let failureReport: FailureReport = {}
    
    const failedParseIds = await database.getFailedParseIds()
    for (const id of failedParseIds) {
        const parse = await database.getParseById(id)
        if (parse && !parse.success) {
            const lemma = parse.entry
            failureReport[lemma] = {
                error: parse.error,
                frequency: frequencyTable[lemma] || 0,
                order: 0
            }
        }
    }
    const failureEntries = Object.entries(failureReport).sort((f1, f2) => (f2[1].frequency || 0) - (f1[1].frequency || 0))
    failureReport = {}
    let order = 0
    for (const entry of failureEntries) {
        failureReport[entry[0]] = {
            ...entry[1],
            order
        }
        order += 1
    }
    
    await writeFileAsync(viaFailureReport, JSON.stringify(failureReport, null, 4))
    process.exit()
}

if (require.main === module) {
    reportFailures()
}
