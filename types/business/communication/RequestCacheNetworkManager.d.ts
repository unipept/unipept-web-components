import NetworkManager from "./NetworkManager";
/**
 * This is a specific type of request cache that can use an IndexedDB-backed request / response cache in order to speed
 * reanalysing assays that have, for example, failed before. We take into account the maximum amount of storage
 * space that can be used by the cache and make sure that this does not overflow.
 *
 * @author Pieter Verschaffelt
 */
export default class RequestCacheNetworkManager implements NetworkManager {
    private readonly baseUrl;
    private indexedDb;
    private uniprotVersion;
    private uniprotVersionLastChecked;
    private static readonly MAX_REQUEST_CACHE_SIZE;
    private static readonly UNIPROT_VERSION_INVALIDATE_MS;
    constructor(baseUrl: string);
    postJSON(url: string, data: any): Promise<any>;
    getJSON(url: string): Promise<any>;
    private setupDb;
    private writeRequestToDb;
    private readRequestFromDb;
    private getEstimatedQuota;
    private getUniprotDBVersion;
}
