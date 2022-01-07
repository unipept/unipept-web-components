import NetworkUtils from "./../NetworkUtils";
import NetworkConfiguration from "@/business/communication/NetworkConfiguration";

export default class MetaDataCommunicator {
    public static VERSION_API_ENDPOINT = "/private_api/metadata.json";

    // We'll only check the version information from the private API once a day.
    private lastChecked: Date;
    private currentUniProtVersion: string;

    public constructor(
        private readonly endpointUrl: string
    ) {}

    /**
     * Connects with Unipept's private API and requests what UniProt version is currently set.
     *
     * @return The UniProt version that's currently supported by Unipept. If the network request fails for some reason,
     * undefined is returned.
     */
    async getCurrentUniprotVersion(): Promise<string | undefined> {
        if (
            !this.currentUniProtVersion ||
            !this.lastChecked ||
            new Date().getTime() - this.lastChecked.getTime() > 24 * 60 * 60 * 1000
        ) {
            try {
                const response: { uniprot_version: string } = await NetworkUtils.getJSON(
                    this.endpointUrl + MetaDataCommunicator.VERSION_API_ENDPOINT
                );

                this.currentUniProtVersion = response.uniprot_version;
                this.lastChecked = new Date();
            } catch (error) {
                console.warn(error);
                return undefined;
            }
        }
        return this.currentUniProtVersion;
    }
}
