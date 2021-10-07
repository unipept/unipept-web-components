import FunctionalDefinition from "./../../ontology/functional/FunctionalDefinition";
import CountTableProcessor from "../CountTableProcessor";
import { FunctionalNamespace } from "./../../ontology/functional/FunctionalNamespace";
import { CountTable } from "./../../counts/CountTable";
import FunctionalTrust from "./FunctionalTrust";
import { Peptide } from "./../../ontology/raw/Peptide";
import ProteinProcessor from "./../protein/ProteinProcessor";
import ProteinDefinition from "./../../ontology/protein/ProteinDefinition";
import { Ontology, OntologyIdType } from "./../../ontology/Ontology";

export default abstract class FunctionalProteinCountTableProcessor<
    OntologyId extends OntologyIdType,
    DefinitionType extends FunctionalDefinition
> implements CountTableProcessor<OntologyId> {
    private countTables: Map<FunctionalNamespace, CountTable<OntologyId>> = new Map();
    private generalCountTable: CountTable<OntologyId>;
    private trust: FunctionalTrust;

    protected constructor(
        public readonly peptide: Peptide,
        public readonly equateIl: boolean,
        protected readonly itemPrefix: string = ""
    ) {}

    public getCountTable(namespace?: FunctionalNamespace): CountTable<OntologyId> {
        if (namespace) {
            return this.countTables.get(namespace);
        } else {
            return this.generalCountTable;
        }
    }

    public async getTrust(): Promise<FunctionalTrust> {
        await this.compute();
        return this.trust;
    }

    public cancel(): void {}

    public isCancelled(): boolean {
        return false;
    }

    private async compute(): Promise<void> {
        if (this.countTables.size > 0) {
            return;
        }

        const proteinProcessor = new ProteinProcessor();
        const proteins = await proteinProcessor.getProteinsByPeptide(this.peptide, this.equateIl);

        // How many proteins are annotated with at least one item?
        let annotatedCount: number = 0;

        const items = proteins.reduce((acc, p) => {
            const annotations = this.getAnnotationsFromProtein(p);
            if (annotations && annotations.length > 0) {
                annotatedCount++;
                acc.push(...annotations.map(e => this.itemPrefix + e));
            }
            return acc;
        }, []);

        const countsPerCode = new Map<OntologyId, number>();
        for (const item of items) {
            countsPerCode.set(item, (countsPerCode.get(item) || 0) + 1);
        }

        this.generalCountTable = new CountTable<OntologyId>(countsPerCode);
        this.trust = new FunctionalTrust(annotatedCount, proteins.length);

        const ontology = await this.getOntology(this.generalCountTable);

        // Split all the counts per namespace.
        const tablePerNamespace = new Map<FunctionalNamespace, Map<OntologyId, number>>();

        for (const ns of this.getNamespaces()) {
            tablePerNamespace.set(ns, new Map<OntologyId, number>());
        }

        for (const [term, counts] of countsPerCode) {
            const definition = ontology.getDefinition(term);

            if (definition) {
                const nsMap = tablePerNamespace.get(definition.namespace);
                nsMap.set(term, counts);
            }
        }

        for (const [ns, table] of tablePerNamespace) {
            this.countTables.set(ns, new CountTable<OntologyId>(table));
        }
    }

    protected async abstract getOntology(countTable: CountTable<OntologyId>): Promise<Ontology<OntologyId, DefinitionType>>;

    protected abstract getAnnotationsFromProtein(p: ProteinDefinition): OntologyId[];

    protected abstract getNamespaces(): FunctionalNamespace[];
}
