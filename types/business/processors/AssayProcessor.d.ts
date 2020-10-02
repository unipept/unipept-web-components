import { CountTable } from "./../counts/CountTable";
import { Peptide } from "./../ontology/raw/Peptide";
import CommunicationSource from "./../communication/source/CommunicationSource";
import Cancellable from "./../progress/Cancellable";
export default interface AssayProcessor extends Cancellable {
    processAssay(countTable: CountTable<Peptide>, forceUpdate: boolean): Promise<CommunicationSource>;
}
