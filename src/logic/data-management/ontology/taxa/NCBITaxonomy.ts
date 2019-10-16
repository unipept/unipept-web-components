import { Ontology } from "../Ontology"
import { NCBITaxon } from "./NCBITaxon";
import { postJSON } from "../../../utils";
import { BASE_URL } from "../../../Constants";

type OntologyId = number;

const TAXA_BATCH_SIZE = 100
const LINEAGE_BATCH_SIZE = 100

const TAXA_URL = BASE_URL + "/private_api/taxa"
const LINEAGE_URL = BASE_URL + "/private_api/lineages"

export class NCBITaxonomy extends Ontology<OntologyId, NCBITaxon> {
    async fetchDefinitions(ids: number[]): Promise<void> {
        await this.fetchTaxaInfo(ids);
        await this.fetchLineages(ids);
    }

    async fetchTaxaInfo(ids: OntologyId[]) {
        ids = ids.filter(id =>  !this._definitions.has(id) ||  !this._definitions.get(id).hasOwnProperty("name"))

        // get taxa info
        for (let i = 0; i < ids.length; i += TAXA_BATCH_SIZE) {
            const data = JSON.stringify({
                taxids: ids.slice(i, i + TAXA_BATCH_SIZE)
            });

            const res = await postJSON(TAXA_URL, data);
            
            res.forEach(taxon => {
                if (!this._definitions.has(taxon.id)) {
                    this._definitions.set(taxon.id, taxon)
                } else {
                    let ncbiTaxon = this._definitions.get(taxon.id)
                    ncbiTaxon.name = taxon.name;
                    ncbiTaxon.rank = taxon.rank;
                }
            })
        }
    }

    async fetchLineages(ids: OntologyId[]) {
        // first check which ids need to be fetched
        ids = ids.filter(id => 
            !this._definitions.has(id) 
            || !this._definitions.get(id).hasOwnProperty("lineage"))

        // get lineage info
        for (let i = 0; i < ids.length; i += LINEAGE_BATCH_SIZE) {
            const data = JSON.stringify({
                taxids: ids.slice(i, i + LINEAGE_BATCH_SIZE)
            });

            const res = await postJSON(LINEAGE_URL, data);
            
            res.forEach(l => {
                if (!this._definitions.has(l.id)) {
                    this._definitions.set(l.id, l)
                } else {
                    this._definitions.get(l.id).lineage = l.lineage;
                }
            })
        }
    }

    setLineage(id: OntologyId, lineage: number[]) {
        if (!this._definitions.has(id)) {
            this._definitions.set(id, { id: id, lineage: lineage } as NCBITaxon)
        } else {
            this._definitions.get(id).lineage = lineage;
        }
    }
}
