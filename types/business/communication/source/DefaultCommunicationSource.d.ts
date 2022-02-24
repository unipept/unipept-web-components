import CommunicationSource from "./CommunicationSource";
import EcResponseCommunicator from "@/business/communication/functional/ec/EcResponseCommunicator";
import GoResponseCommunicator from "./../functional/go/GoResponseCommunicator";
import InterproResponseCommunicator from "./../functional/interpro/InterproResponseCommunicator";
import NcbiResponseCommunicator from "./../taxonomic/ncbi/NcbiResponseCommunicator";
import Pept2DataCommunicator from "./../peptides/Pept2DataCommunicator";
export default class DefaultCommunicationSource implements CommunicationSource {
    private readonly serviceUrl;
    constructor(serviceUrl: string);
    getEcCommunicator(): EcResponseCommunicator;
    getGoCommunicator(): GoResponseCommunicator;
    getInterproCommunicator(): InterproResponseCommunicator;
    getNcbiCommunicator(): NcbiResponseCommunicator;
    getPept2DataCommunicator(): Pept2DataCommunicator;
}
