import { connect, Db } from 'mongodb'
import * as shortid from 'shortid'
import { Lexis } from 'lexis'

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_=')

export type Source = 'wiktionary'

export interface PageRecordInput {
    entry: string
    source: Source
    remoteUrl: string
    html: string
}

export interface PageRecord extends PageRecordInput {
    id: string
    time: number
}

export interface SuccessfulParseResultInput {
    success: true
    entry: string
    pageUrl: string
    lexes: Lexis[]
}

export interface FailedfulParseResultInput {
    success: false
    entry: string
    pageUrl: string
    error: string
}

type ParseResultInput = SuccessfulParseResultInput | FailedfulParseResultInput

interface ParseResultInternalFields {
    id: string
    time: number
}

type SuccessfulParseResult = SuccessfulParseResultInput & ParseResultInternalFields
type FailedParseResult = FailedfulParseResultInput & ParseResultInternalFields

export type ParseResult = SuccessfulParseResult | FailedParseResult

const url = 'mongodb://localhost:27017/lexes'

const PAGE = 'pagina'
const PARSE = 'parse'
const LEXIS = 'lexis'

let db: Db

export const database = {
    async connect() {
        if (!db) {
            db = await connect(url)
        }
    },
    async upsertPage(recordInput: PageRecordInput): Promise<PageRecord> {
        const query = {
            remoteUrl: recordInput.remoteUrl,
        }
        const oldPage: PageRecord | null = await db.collection(PAGE).findOne(query)
        const newPage: PageRecord = {
            ...recordInput,
            id: shortid.generate(),
            time: Date.now(),
        }
        if (oldPage) {
            await db.collection(PAGE).updateOne(query, newPage)
        }
        else {
            await db.collection(PAGE).insertOne(newPage)
        }
        return newPage
    },
    async findPagesByEntry(entry: string): Promise<PageRecord[]> {
        return db.collection(PAGE).find({entry}).toArray()
    },
    async findPageByUrl(remoteUrl: string): Promise<PageRecord | null> {
        return db.collection(PAGE).findOne({remoteUrl})
    },
    async findPagesByUrl(remoteUrl: string): Promise<PageRecord[]> {
        return db.collection(PAGE).find({remoteUrl}).toArray()
    },
    async removePageById(id: string) {
        return db.collection(PAGE).deleteOne({id})
    },
    async getPageUrls(): Promise<string[]> {
        return db.collection(PAGE).find({}).map((record: PageRecord) => record.remoteUrl).toArray()
    },
    async upsertParse(parseInput: ParseResultInput): Promise<ParseResult> {
        const query = {
            pageUrl: parseInput.pageUrl,
        }
        const oldParse = await this.getParseByPageUrl(parseInput.pageUrl)
        const newParse: ParseResult = {
            ...parseInput,
            id: shortid.generate(),
            time: Date.now(),
        }
        if (oldParse) {
            await db.collection(PARSE).updateOne(query, newParse)
        }
        else {
            await db.collection(PARSE).insertOne(newParse)
        }
        return newParse
    },
    async getAllParseIds(): Promise<string[]> {
        return db.collection(PARSE).find({}).map((record: ParseResult) => record.id).toArray()
    },
    async getSuccessfulParseIds(): Promise<string[]> {
        return db.collection(PARSE).find({success: true}).map((record: ParseResult) => record.id).toArray()
    },
    async getFailedParseIds(): Promise<string[]> {
        return db.collection(PARSE).find({success: false}).map((record: ParseResult) => record.id).toArray()
    },
    async getParseById(id: string): Promise<ParseResult | null> {
        return db.collection(PARSE).findOne({id})
    },
    async getParseByEntry(entry: string): Promise<ParseResult | null> {
        return db.collection(PARSE).findOne({entry})
    },
    async getParseByPageUrl(pageUrl: string): Promise<ParseResult | null> {
        return db.collection(PARSE).findOne({pageUrl})
    },
    async getLexesInternalIds(): Promise<string[]> {
        return db.collection(LEXIS).find({}).map((node: any) => node._id).toArray()
    },
    async getLexisByInternalId(_id: string): Promise<Lexis | null> {
        return db.collection(LEXIS).findOne({_id})
    },
    async getLexesByLemma(lemma: string): Promise<Lexis[]> {
        return db.collection(LEXIS).find({'lexicographia.lemma': lemma}).toArray()
    },
    async upsertLexis(lexis: Lexis) {
        const query = {
            pars: lexis.pars,
            'lexicographia.lemma': lexis.lexicographia.lemma,
            'lexicographia.etymologia': lexis.lexicographia.etymologia,
        }
        const oldLexis = await db.collection(LEXIS).findOne(query)
        if (oldLexis) {
            await db.collection(LEXIS).updateOne(query, lexis)
        }
        else {
            await db.collection(LEXIS).insertOne(lexis)
        }
    }
}
