import AnalysisSource from "@/business/communication/analysis/AnalysisSource";
import { CommunicationSource } from "../source";
import { DefaultCommunicationSource, MetaDataCommunicator, NetworkUtils } from "@/business";
import sha256 from "crypto-js/sha256";

export default class OnlineAnalysisSource implements AnalysisSource {
    /**
     * An OnlineAnalysisSource can be used to communicate with a remote Unipept service, running of a server somewhere
     * in the world.
     *
     * @param endpoint An URL that points to a valid online Unipept service instance.
     */
    constructor(
        private readonly endpoint: string
    ) {}

    getCommunicationSource(): CommunicationSource {
        return new DefaultCommunicationSource(this.endpoint);
    }

    async verifyEquality(hash: string): Promise<boolean> {
        const currentHash = await this.computeFingerprint();
        return currentHash === hash;
    }

    public async computeFingerprint(): Promise<string> {
        const metadataCommunicator = new MetaDataCommunicator(this.endpoint);
        const dbVersion = await metadataCommunicator.getCurrentUniprotVersion();

        const hashDigest = sha256(
            this.endpoint +
            dbVersion
        );

        return hashDigest.toString(CryptoJS.enc.Base64);
    }
}
