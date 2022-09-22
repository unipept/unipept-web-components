import { CountTable } from "@/logic/processing";
import { DataNodeLike } from "unipept-visualizations/types";
import Ontology from "../../Ontology";
import EcCode from "./EcCode";
import EcDefinition from "./EcDefinition";

const computeEcTree = (ecCountTable: CountTable<EcCode>, ecOntology: Ontology<EcCode, EcDefinition>): DataNodeLike => {
    const codeNodeMap = new Map<EcCode, DataNodeLike>();

    codeNodeMap.set("-.-.-.-", {
        name: "-.-.-.-",
        children: [],
        count: 0,
        selfCount: 0,
        extra: {
            sequences: Object.create(null),
            self_sequences: Object.create(null),
            id: 0
        }
    });

    const getOrNew = (key: string) => {
        if (!codeNodeMap.has(key)) {
            codeNodeMap.set(
                key,
                {
                    name: key.split(".").filter((x) => x !== "-").join("."),
                    count: 0,
                    selfCount: 0,
                    children: [],
                    extra: {
                        code: key,
                        value: 0,
                        sequences: Object.create(null),
                        self_sequences: Object.create(null),
                        id: key.split(".").map((x) => ("0000" + x).slice(-4)).join(".")
                    }
                }
            );

            const ancestors = EcDefinition.computeAncestors(key, true);

            getOrNew(ancestors[0])?.children?.push(codeNodeMap.get(key)!);
        }
        return codeNodeMap.get(key);
    };

    const sortedEcs = ecCountTable.getOntologyIds()
        .map(id => ecOntology.getDefinition(id)!)
        // Only retain valid definitions
        .filter(def => def)
        .sort((a: EcDefinition, b: EcDefinition) => a.level - b.level);

    for (const ecDef of sortedEcs) {
        const toInsert = {
            name: ecDef.code.split(".").filter((x) => x !== "-").join("."),
            count: ecCountTable.getCounts(ecDef.code),
            selfCount: ecCountTable.getCounts(ecDef.code),
            children: [],
            extra: {
                definition: ecDef,
                id: ecDef.code.split(".").map((x) => ("0000" + x).slice(-4)).join(".")
            },
        };

        codeNodeMap.set(ecDef.code, toInsert);

        const ancestors = EcDefinition.computeAncestors(ecDef.code, true);
        getOrNew(ancestors[0])?.children?.push(toInsert);
        for (const a of ancestors) {
            getOrNew(a)!.count += toInsert.count;
        }
    }

    // Order the nodes by their id (order by EC number)
    for (const val of codeNodeMap.values()) {
        val.children?.sort((a, b) => a.extra.id.localeCompare(b.extra.id));
    }

    return codeNodeMap.get("-.-.-.-")!;
}

export default computeEcTree;
