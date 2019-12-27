import { Ontology } from "../Ontology"
import { ECDefinition } from "./ECDefinition";
import { postJSON } from "../../../utils";
import { convertEcNumberToEcNameSpace } from "../../../functional-annotations/EcNameSpace";

type OntologyId = string;

const EC_BATCH_SIZE = 100
const EC_URL = "/private_api/ecnumbers"

export class ECOntology extends Ontology<OntologyId, ECDefinition> {
    async fetchDefinitions(ids: OntologyId[], baseUrl: string): Promise<Set<OntologyId>> {
        // TODO: check if this is still needed
        // calculate ids to fetch
        const todo = new Set<string>();
        for (const id of ids.map(id => id.substr(3))) {
            if (!this._definitions.has("EC:" + id)) {
                todo.add(id);
                const parts = id.split(".");
                const numSpecific = parts.includes("-") ? parts.indexOf("-") : parts.length;
                for (let i = numSpecific - 1; i >= 1; i--) {
                    parts[i] = "-";
                    const newKey = parts.join(".");
                    if (!this._definitions.has("EC:" + newKey)) {
                        todo.add(newKey);
                    } else {
                        break; // the key already exists (all following already done)
                    }
                }
            }
        }

        let todoList = Array.from(todo);

        // get EC info
        for (let i = 0; i < todoList.length; i += EC_BATCH_SIZE) {
            const data = JSON.stringify({
                ecnumbers: todoList.slice(i, i + EC_BATCH_SIZE)
            });

            const res = await postJSON(baseUrl + EC_URL, data);
            
            res.forEach(ecNumber => {
                let prefixedNumber = "EC:" + ecNumber.code
                if (!this._definitions.has(prefixedNumber)) {
                    this._definitions.set(prefixedNumber, 
                        {
                            code: ecNumber.code, 
                            name: ecNumber.name, 
                            namespace: convertEcNumberToEcNameSpace(ecNumber.code)
                        })
                }

                todo.delete(ecNumber.code);
            })
        }

        return new Set<string>(Array.from(todo.keys()).map(id => "EC:" + id));
    }
}
