import { Ontology } from "../Ontology"
import { NCBITaxon } from "./NCBITaxon";
import { postJSON } from "../../../utils";

type OntologyId = number;

const TAXA_BATCH_SIZE = 100
const LINEAGE_BATCH_SIZE = 100

const TAXA_URL =  "/private_api/taxa"
const LINEAGE_URL =  "/private_api/lineages"

export class NCBITaxonomy extends Ontology<OntologyId, NCBITaxon> {
    async fetchDefinitions(ids: number[], baseUrl: string): Promise<Set<OntologyId>> {
        let missedIds = new Set<number>();

        (await this.fetchTaxaInfo(ids, baseUrl)).forEach(id => missedIds.add(id));
        (await this.fetchLineages(ids, baseUrl)).forEach(id => missedIds.add(id));

        return missedIds;
    }

    async fetchTaxaInfo(ids: OntologyId[], baseUrl: string): Promise<Set<OntologyId>> {
        ids = ids.filter(id => 
            !this._definitions.has(id) 
            ||  !("name" in this._definitions.get(id)))

        let missedIds = new Set<number>(ids)

        // get taxa info
        for (let i = 0; i < ids.length; i += TAXA_BATCH_SIZE) {
            const data = JSON.stringify({
                taxids: ids.slice(i, i + TAXA_BATCH_SIZE)
            });

            const res = await postJSON(baseUrl + TAXA_URL, data);
            
            res.forEach(taxon => {
                if (!this._definitions.has(taxon.id)) {
                    this._definitions.set(taxon.id, taxon)
                } else {
                    let ncbiTaxon = this._definitions.get(taxon.id)
                    ncbiTaxon.name = taxon.name;
                    ncbiTaxon.rank = taxon.rank;
                }

                missedIds.delete(taxon.id);
            })
        }

        return missedIds;
    }

    async fetchLineages(ids: OntologyId[], baseUrl): Promise<Set<OntologyId>> {
        // first check which ids need to be fetched
        ids = ids.filter(id => 
            !this._definitions.has(id) 
            || !("lineage" in this._definitions.get(id)))

        let missedIds = new Set<number>(ids)

        // get lineage info
        for (let i = 0; i < ids.length; i += LINEAGE_BATCH_SIZE) {
            const data = JSON.stringify({
                taxids: ids.slice(i, i + LINEAGE_BATCH_SIZE)
            });

            const res = await postJSON(baseUrl + LINEAGE_URL, data);
            
            res.forEach(l => {
                if (!this._definitions.has(l.id)) {
                    this._definitions.set(l.id, l)
                } else {
                    this._definitions.get(l.id).lineage = l.lineage;
                }

                missedIds.delete(l.id);
            })
        }

        return missedIds;
    }

    setLineage(id: OntologyId, lineage: number[]) {
        if (!this._definitions.has(id)) {
            this._definitions.set(id, { id: id, lineage: lineage } as NCBITaxon)
        } else {
            this._definitions.get(id).lineage = lineage;
        }
    }
}
