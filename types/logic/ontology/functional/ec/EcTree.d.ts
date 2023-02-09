import { CountTable } from "@/logic/processing";
import { DataNodeLike } from "unipept-visualizations/types";
import Ontology from "../../Ontology";
import EcCode from "./EcCode";
import EcDefinition from "./EcDefinition";
declare const computeEcTree: (ecCountTable: CountTable<EcCode>, ecOntology: Ontology<EcCode, EcDefinition>) => DataNodeLike;
export default computeEcTree;
