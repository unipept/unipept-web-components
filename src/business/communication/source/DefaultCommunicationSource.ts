import CommunicationSource from "./CommunicationSource";
import EcResponseCommunicator from "@/business/communication/functional/ec/EcResponseCommunicator";
import GoResponseCommunicator from "./../functional/go/GoResponseCommunicator";
import InterproResponseCommunicator from "./../functional/interpro/InterproResponseCommunicator";
import NcbiResponseCommunicator from "./../taxonomic/ncbi/NcbiResponseCommunicator";
import Pept2DataCommunicator from "./../peptides/Pept2DataCommunicator";

export default class DefaultCommunicationSource implements CommunicationSource {
    public constructor(
        private readonly serviceUrl: string
    ) {}

    public getEcCommunicator(): EcResponseCommunicator {
        return new EcResponseCommunicator();
    }

    public getGoCommunicator(): GoResponseCommunicator {
        return new GoResponseCommunicator();
    }

    public getInterproCommunicator(): InterproResponseCommunicator {
        return new InterproResponseCommunicator();
    }

    public getNcbiCommunicator(): NcbiResponseCommunicator {
        return new NcbiResponseCommunicator();
    }

    public getPept2DataCommunicator(): Pept2DataCommunicator {
        return new Pept2DataCommunicator(this.serviceUrl);
    }
}
