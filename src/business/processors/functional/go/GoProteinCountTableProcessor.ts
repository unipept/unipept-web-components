import CountTableProcessor from "./../../CountTableProcessor";
import { GoCode } from "./../../../ontology/functional/go/GoDefinition";
import { CountTable } from "./../../../counts/CountTable";
import ProteinProcessor from "./../../protein/ProteinProcessor";
import { Peptide } from "./../../../ontology/raw/Peptide";
import { GoNamespace } from "./../../../ontology/functional/go/GoNamespace";
import FunctionalTrust from "./../FunctionalTrust";
import GoOntologyProcessor from "./../../../ontology/functional/go/GoOntologyProcessor";

export default class GoProteinCountTableProcessor implements CountTableProcessor<GoCode>{
    private countTables: Map<GoNamespace, CountTable<GoCode>> = new Map();
    private generalCountTable: CountTable<GoCode>;
    private trust: FunctionalTrust;

    public constructor(
        public readonly peptide: Peptide,
        public readonly equateIl: boolean
    ) {}

    public async getCountTable(namespace?: GoNamespace): Promise<CountTable<GoCode>> {
        await this.compute();
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

    private async compute(): Promise<void> {
        if (this.countTables.size > 0) {
            return;
        }

        const proteinProcessor = new ProteinProcessor();
        const proteins = await proteinProcessor.getProteinsByPeptide(this.peptide, this.equateIl);

        // How many proteins are annotated with at least one GO-term?
        let annotatedCount: number = 0;

        const goTerms = proteins.reduce((acc, p) => {
            if (p.goTerms && p.goTerms.length > 0) {
                acc.push(...p.goTerms);
                return acc;
            } else {
                annotatedCount++;
            }
        }, []);

        const countsPerCode = new Map<GoCode, number>();
        for (const term of goTerms) {
            countsPerCode.set(term, (countsPerCode.get(term) || 0) + 1);
        }

        this.generalCountTable = new CountTable<GoCode>(countsPerCode);
        this.trust = new FunctionalTrust(annotatedCount, proteins.length);

        const ontologyProcessor = new GoOntologyProcessor();
        const ontology = await ontologyProcessor.getOntology(this.generalCountTable);

        // Split all the counts per namespace.
        const tablePerNamespace = new Map<GoNamespace, Map<GoCode, number>>();

        for (const ns of Object.values(GoNamespace)) {
            tablePerNamespace.set(ns, new Map<GoCode, number>());
        }

        for (const [term, counts] of countsPerCode) {
            const definition = ontology.getDefinition(term);

            if (definition) {
                const nsMap = tablePerNamespace.get(definition.namespace);
                nsMap.set(term, counts);
            }
        }

        for (const [ns, table] of tablePerNamespace) {
            this.countTables.set(ns, new CountTable<GoCode>(table));
        }
    }
}
