import { FunctionalDefinition, FunctionalNamespace, Ontology, Peptide } from "@/logic/ontology";
import OntologyCode from "@/logic/ontology/OntologyCode";
import { ProteinDefinition } from "@/logic/ontology/protein";
import CountTable from "../CountTable";
import CountTableProcessor from "../CountTableProcessor";
import { ProteinProcessor } from "../protein";
import FunctionalTrust from "./FunctionalTrust";

export default abstract class FunctionalProteinCountTableProcessor<
    OntologyId extends OntologyCode,
    DefinitionType extends FunctionalDefinition
> implements CountTableProcessor<OntologyId> {
    private countTables: Map<FunctionalNamespace, CountTable<OntologyId>> = new Map();
    private generalCountTable: CountTable<OntologyId> | undefined;
    private trust: FunctionalTrust | undefined;

    protected constructor(
        public readonly peptide: Peptide,
        public readonly equateIl: boolean,
        protected readonly itemPrefix: string = ""
    ) {}

    public getCountTable(namespace?: FunctionalNamespace): CountTable<OntologyId> | undefined {
        if (namespace) {
            return this.countTables.get(namespace);
        } else {
            return this.generalCountTable;
        }
    }

    public getTrust(): FunctionalTrust | undefined {
        return this.trust;
    }

    public isCancelled(): boolean {
        return false;
    }

    public async compute(proteinProcessor: ProteinProcessor): Promise<void> {
        if (this.countTables.size > 0) {
            return;
        }

        const proteins = proteinProcessor.getProteins();

        // How many proteins are annotated with at least one item?
        let annotatedCount = 0;

        const items = proteins.reduce((acc: any, p: any) => {
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
                if(nsMap) {
                    nsMap.set(term, counts);
                }
            }
        }

        for (const [ns, table] of tablePerNamespace) {
            this.countTables.set(ns, new CountTable<OntologyId>(table));
        }
    }

    protected abstract getOntology(countTable: CountTable<OntologyId>): Promise<Ontology<OntologyId, DefinitionType>>;

    protected abstract getAnnotationsFromProtein(p: ProteinDefinition): OntologyId[];

    protected abstract getNamespaces(): FunctionalNamespace[];
}
