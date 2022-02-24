import NetworkUtils from "./../NetworkUtils";
import NetworkConfiguration from "@/business/communication/NetworkConfiguration";

export default class MetaDataCommunicator {
    public static VERSION_API_ENDPOINT = "/private_api/metadata.json";

    // We'll only check the version information from the private API once a day.
    private static lastChecked: Date;
    private static currentUniProtVersion: string;

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
            !MetaDataCommunicator.currentUniProtVersion ||
            !MetaDataCommunicator.lastChecked ||
            new Date().getTime() - MetaDataCommunicator.lastChecked.getTime() > 24 * 60 * 60 * 1000
        ) {
            try {
                const response: { db_version: string } = await NetworkUtils.getJSON(
                    this.endpointUrl + MetaDataCommunicator.VERSION_API_ENDPOINT
                );

                console.log(response);

                MetaDataCommunicator.currentUniProtVersion = "UniProt " + response.db_version;
                MetaDataCommunicator.lastChecked = new Date();
            } catch (error) {
                console.warn(error);
                return undefined;
            }
        }
        return MetaDataCommunicator.currentUniProtVersion;
    }
}
