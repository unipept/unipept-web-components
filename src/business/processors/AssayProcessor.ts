import { CountTable } from "./../counts/CountTable";
import { Peptide } from "./../ontology/raw/Peptide";
import CommunicationSource from "./../communication/source/CommunicationSource";
import Cancellable from "./../progress/Cancellable";
import SearchConfiguration from "@/business/configuration/SearchConfiguration";

export default interface AssayProcessor extends Cancellable {
    processAssay(
        countTable: CountTable<Peptide>,
        forceUpdate: boolean,
        searchSettings: SearchConfiguration
    ): Promise<CommunicationSource>;
}
