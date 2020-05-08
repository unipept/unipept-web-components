/**
 * This interface keeps track of all the different Communicators and returns a valid communicator-object per requested
 * type.
 */
import EcResponseCommunicator from "./../functional/ec/EcResponseCommunicator";
import GoResponseCommunicator from "./../functional/go/GoResponseCommunicator";
import InterproResponseCommunicator from "./../functional/interpro/InterproResponseCommunicator";
import NcbiResponseCommunicator from "./../taxonomic/ncbi/NcbiResponseCommunicator";
import Pept2DataCommunicator from "./../peptides/Pept2DataCommunicator";

export default interface CommunicationSource {
    // Functional communicators
    getEcCommunicator(): EcResponseCommunicator;
    getGoCommunicator(): GoResponseCommunicator;
    getInterproCommunicator(): InterproResponseCommunicator;

    // Taxonomic communicators
    getNcbiCommunicator(): NcbiResponseCommunicator;

    // Peptide communicators
    getPept2DataCommunicator(): Pept2DataCommunicator;
}
