import FunctionalCode from "./functional/FunctionalCode";
import UniprotAccessionId from "./protein/UniprotAccessionId";
import NcbiId from "./taxonomic/NcbiId";

type OntologyCode = FunctionalCode | NcbiId | UniprotAccessionId;

export default OntologyCode;
