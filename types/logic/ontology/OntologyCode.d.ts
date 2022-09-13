import FunctionalCode from "./functional/FunctionalCode";
import { UniprotAccessionId } from "./protein";
import { NcbiId } from "./taxonomic";
declare type OntologyCode = FunctionalCode | NcbiId | UniprotAccessionId;
export default OntologyCode;
