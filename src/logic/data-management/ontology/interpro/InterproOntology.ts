import { Ontology } from "../Ontology"
import { postJSON } from "../../../utils";
import { convertEcNumberToEcNameSpace } from "../../../functional-annotations/EcNameSpace";
import { InterproDefinition } from "./InterproDefinition";
import { InterproNameSpace, convertStringToInterproNameSpace } from "./../../../../logic/functional-annotations/InterproNameSpace";

type OntologyId = string;

const INTERPRO_BATCH_SIZE = 100;
const INTERPRO_URL = "/private_api/interpros";

export class InterproOntology extends Ontology<OntologyId, InterproDefinition> {
    async fetchDefinitions(ids: OntologyId[], baseUrl: string): Promise<Set<OntologyId>> {
        for (let i = 0; i < ids.length; i += INTERPRO_BATCH_SIZE) {
            const data = JSON.stringify({
                interpros: ids.slice(i, i + INTERPRO_BATCH_SIZE).map(id => id.substr(4))
            });

            const res = await postJSON(baseUrl + INTERPRO_URL, data);
            
            res.forEach(interpro => {
                const interproPrefixed: string = "IPR:" + interpro.code;
                if (!this._definitions.has(interproPrefixed)) {
                    this._definitions.set(interproPrefixed, 
                        {
                            code: interpro.code, 
                            name: interpro.name, 
                            namespace: convertStringToInterproNameSpace(interpro.category)
                        })
                }

            })
        }

        return new Set<string>(ids);
    }
}
