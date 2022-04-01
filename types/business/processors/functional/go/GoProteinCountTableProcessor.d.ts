import GoDefinition, { GoCode } from "./../../../ontology/functional/go/GoDefinition";
import { CountTable } from "./../../../counts/CountTable";
import FunctionalProteinCountTableProcessor from "./../FunctionalProteinCountTableProcessor";
import ProteinDefinition from "./../../../ontology/protein/ProteinDefinition";
import { FunctionalNamespace } from "./../../../ontology/functional/FunctionalNamespace";
import { Ontology } from "./../../../ontology/Ontology";
import { Peptide } from "./../../../ontology/raw/Peptide";
import { GoResponseCommunicator } from "@/business";
export default class GoProteinCountTableProcessor extends FunctionalProteinCountTableProcessor<GoCode, GoDefinition> {
    private readonly goCommunicator;
    constructor(peptide: Peptide, equateIl: boolean, goCommunicator: GoResponseCommunicator);
    protected getAnnotationsFromProtein(p: ProteinDefinition): GoCode[];
    protected getNamespaces(): FunctionalNamespace[];
    protected getOntology(countTable: CountTable<GoCode>): Promise<Ontology<GoCode, GoDefinition>>;
}
