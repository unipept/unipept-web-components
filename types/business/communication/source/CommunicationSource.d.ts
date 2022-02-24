/**
 * This interface keeps track of all the different Communicators and returns a valid communicator-object per requested
 * type.
 */
import EcResponseCommunicator from "@/business/communication/functional/ec/EcResponseCommunicator";
import GoResponseCommunicator from "./../functional/go/GoResponseCommunicator";
import InterproResponseCommunicator from "./../functional/interpro/InterproResponseCommunicator";
import NcbiResponseCommunicator from "./../taxonomic/ncbi/NcbiResponseCommunicator";
import Pept2DataCommunicator from "./../peptides/Pept2DataCommunicator";
export default interface CommunicationSource {
    getEcCommunicator(): EcResponseCommunicator;
    getGoCommunicator(): GoResponseCommunicator;
    getInterproCommunicator(): InterproResponseCommunicator;
    getNcbiCommunicator(): NcbiResponseCommunicator;
    getPept2DataCommunicator(): Pept2DataCommunicator;
}
