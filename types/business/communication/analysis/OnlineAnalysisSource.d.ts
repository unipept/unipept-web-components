import AnalysisSource from "@/business/communication/analysis/AnalysisSource";
import { CommunicationSource } from "../source";
export default class OnlineAnalysisSource implements AnalysisSource {
    private readonly endpoint;
    /**
     * An OnlineAnalysisSource can be used to communicate with a remote Unipept service, running of a server somewhere
     * in the world.
     *
     * @param endpoint An URL that points to a valid online Unipept service instance.
     */
    constructor(endpoint: string);
    getCommunicationSource(): CommunicationSource;
    verifyEquality(hash: string): Promise<boolean>;
    computeFingerprint(): Promise<string>;
}
