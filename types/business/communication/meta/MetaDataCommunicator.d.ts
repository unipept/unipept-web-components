export default class MetaDataCommunicator {
    private readonly endpointUrl;
    static VERSION_API_ENDPOINT: string;
    private lastChecked;
    private currentUniProtVersion;
    constructor(endpointUrl: string);
    /**
     * Connects with Unipept's private API and requests what UniProt version is currently set.
     *
     * @return The UniProt version that's currently supported by Unipept. If the network request fails for some reason,
     * undefined is returned.
     */
    getCurrentUniprotVersion(): Promise<string | undefined>;
}
