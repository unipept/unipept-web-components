import { Ontology } from "../Ontology"
import { GODefinition } from "./GODefinition";
import { postJSON } from "../../../utils";

type OntologyId = string;

const GO_BATCH_SIZE = 100
const GO_URL = "/private_api/goterms"

export class GeneOntology extends Ontology<OntologyId, GODefinition> {
    async fetchDefinitions(ids: OntologyId[], baseUrl: string): Promise<Set<OntologyId>> {
        ids = ids.filter(id => !this._definitions.has(id));
        let missedIds = new Set<string>(ids);

        // get GO info
        for (let i = 0; i < ids.length; i += GO_BATCH_SIZE) {
            const data = JSON.stringify({
                goterms: ids.slice(i, i + GO_BATCH_SIZE)
            });

            const res = await postJSON(baseUrl + GO_URL, data);
            
            res.forEach(term => {
                if (!this._definitions.has(term.code)) {
                    this._definitions.set(term.code, term)
                }

                missedIds.delete(term.code);
            })
        }

        return missedIds;
    }
}
