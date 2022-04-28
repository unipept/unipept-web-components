import NetworkManager from "./NetworkManager";
import NetworkUtils from "./NetworkUtils";
import sha256 from "crypto-js/sha256";
import Dexie from "dexie";

/**
 * This is a specific type of request cache that can use an IndexedDB-backed request / response cache in order to speed
 * reanalysing assays that have, for example, failed before. We take into account the maximum amount of storage
 * space that can be used by the cache and make sure that this does not overflow.
 *
 * @author Pieter Verschaffelt
 */
export default class RequestCacheNetworkManager implements NetworkManager {
    private indexedDb: CacheIndexedDatabase;

    // Max amount of entries in the request cache.
    private static readonly MAX_REQUEST_CACHE_SIZE = 5000;

    constructor(
        private readonly baseUrl: string
    ) {
        this.setupDb();
    }

    public async postJSON(url: string, data: any): Promise<any> {
        try {
            const dbVersion: string = JSON.parse(
                await NetworkUtils.get(this.baseUrl + "/private_api/metadata")
            ).db_version;

            const dataHash: string = sha256(this.baseUrl + url + JSON.stringify(data) + dbVersion).toString();

            const dbResult = await this.readRequestFromDb(dataHash);
            if (dbResult) {
                return JSON.parse(dbResult);
            }

            const response = await NetworkUtils.postJSON(url, data);
            await this.writeRequestToDb(dataHash, JSON.stringify(response));

            return response;
        } catch (err) {
            console.warn("Error while using HTTP request / response cache: " + err);
            return await NetworkUtils.postJSON(url, data);
        }
    }

    public async getJSON(url: string): Promise<any> {
        try {
            const dbVersion: string = JSON.parse(
                await NetworkUtils.get(this.baseUrl + "/private_api/metadata")
            ).db_version;

            const dataHash: string = sha256(this.baseUrl + url + dbVersion).toString();

            const dbResult = await this.readRequestFromDb(dataHash);
            if (dbResult) {
                return JSON.parse(dbResult);
            }

            const response = await NetworkUtils.getJSON(url);
            await this.writeRequestToDb(dataHash, JSON.stringify(response));

            return response;
        } catch (err) {
            console.warn("Error while using HTTP request / response cache: " + err);
            return await NetworkUtils.getJSON(url);
        }
    }

    private setupDb(): void {
        try {
            this.indexedDb = new CacheIndexedDatabase();
        } catch (err) {
            console.warn("IndexedDB storage not available. Feature has been disabled.");
        }
    }

    private async writeRequestToDb(key: string, response: any): Promise<void> {
        await this.indexedDb.cache.put({
            hash: key,
            response,
            epoch: new Date().getTime()
        });

        // We need to check if the database does not contain too many entries at this point. If it grows too large, we
        // will remove the oldest 100 entries in the cache to make room for more recent items. We need to check if
        // either the limit set by this application is exceeded or if the storage limits provided by the browser are
        // exceeded.
        const quota = await this.getEstimatedQuota();
        if (
            await this.indexedDb.cache.count() > RequestCacheNetworkManager.MAX_REQUEST_CACHE_SIZE ||
            quota.usage * 1.5 > quota.quota
        ) {
            await this.indexedDb.cache.orderBy("epoch").limit(100).delete();
        }
    }

    private async readRequestFromDb(key: string): Promise<any> {
        const result = await this.indexedDb.cache.get(key);
        if (result) {
            return result.response;
        } else {
            return undefined;
        }
    }

    private async getEstimatedQuota(): Promise<StorageEstimate | undefined> {
        return await navigator.storage && navigator.storage.estimate ? navigator.storage.estimate() : undefined;
    }
}

class CacheIndexedDatabase extends Dexie {
    cache!: Dexie.Table<IndexedCacheRecord, string>;

    constructor() {
        super("NetworkStore");
        this.version(1).stores({
            cache: "&hash,epoch"
        });
    }
}

interface IndexedCacheRecord {
    hash: string,
    response: string,
    epoch: number
}
