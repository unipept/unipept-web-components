import { Pept2DataCommunicator } from "..";

export default function usePept2DataCommunicator() {
    const pept2DataCommunicator = new Pept2DataCommunicator();

    return { pept2DataCommunicator };
}
