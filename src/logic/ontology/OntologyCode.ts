import FunctionalCode from "./functional/FunctionalCode";
import { UniprotAccessionId } from "./protein";
import { NcbiId } from "./taxonomic";

type OntologyCode = FunctionalCode | NcbiId | UniprotAccessionId;

export default OntologyCode;
