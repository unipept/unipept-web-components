import {postJSON} from "../utils";
import {SingleFA} from "./FunctionalAnnotations.js";

/**
 * @typedef {Object} FACounts
 * @property {number} value count
 * @property {string} name  The name of the GO/EC number
 * @property {string} code  The code of the GO/EC number
 */

const BATCH_SIZE = 1000;

/**
 * Class to contain the results of a fetch of EC numbers.
 *
 * - fetch information about missing numbers in hierarchy
 * - Create a treeview
 *
 * The names associated with EC numbers are stored statically to prevent
 * useless queries
 *
 * @todo allow EC in name for more consistency
 * @type {ECNumbers}
 */
export default class ECNumbers extends SingleFA {
    /**
     * Static cache of EC number information
     * @access private
     */
    static ecData = new Map([["-.-.-.-", "Enzyme Commission Numbers"]]);

    /**
     * Use ECNumbers.make() and ECNumbers.makeAssured()
     * @param {FAInfo[]} data
     * @param {FATrustInfo} trust
     * @access private
     */
    constructor(data, trust = {trustCount: 0, annotatedCount: 0, totalCount: 0}) {
        super("EC numbers", data, trust);
    }

    // -------------- Factories ------------------------------
    /**
     *
     * @param {FAInfo[]} results
     * @param {FATrustInfo} trust
     * @return {ECNumbers}
     */
    static make(results, trust) {
        ECNumbers._addData(results);
        return new ECNumbers(results, trust);
    }

    /**
     *
     * @param {FAInfo[]} results
     * @param {FATrustInfo} trust
     * @return {Promise<ECNumbers>}
     */
    static async makeAssured(results, trust) {
        const obj = ECNumbers.make(results, trust);
        await obj.assureData();
        return obj;
    }

    /**
     * Clone an EC numbers instance
     * @param {ECNumbers} other
     * @return {ECNumbers}
     */
    static makeClone(other) {
        ECNumbers._addData(other._data);
        return new ECNumbers(other._data, other._trust);
    }

    /**
     * Ensure that all needed names are fetched (ancestors included).
     */
    async assureData() {
        await ECNumbers.fetch([...this].map(c => c.code));
    }

    // ------------------ Instance methods -------------

    /**
     * Get the data for a certain annotaion
     * @param {string} code
     * @param {string} key
     * @param {any} [fallback=0]
     * @return {any} The data for the annotaion of the code
     */
    valueOf(code, key = "value", fallback = 0) {
        if (this._map.has(code)) {
            return this._map.get(code)[key] || fallback;
        } else {
            if (code.startsWith("EC:")) {
                return this._map.get(code)[key.substr(3)] || fallback;
            }
        }
        return fallback;
    }

    /**
     * Make a tree structure of the EC numbers in the resultset if
     * for multiple sequences
     *
     * @return {Node} a treeview data model
     */
    treeSequencesData() {
        const map = Object.create(null);

        // The root node
        map["-.-.-.-"] = {
            id: 0, name: "-.-.-.-",
            children: [],
            data: {
                self_count: 0,
                count: 0,
                data: {
                    sequences: Object.create(null),
                    self_sequences: Object.create(null),
                },
            },
        };

        const getOrNew = key => {
            if (!(key in map)) {
                map[key] = {
                    id: key.split(".").map(x => ("0000" + x).slice(-4)).join("."),
                    name: key.split(".").filter(x => x !== "-").join("."),
                    children: [],
                    data: {self_count: 0, count: 0, data: {
                        code: key, value: 0,
                        sequences: Object.create(null),
                        self_sequences: Object.create(null),
                    }},
                };
                const ancestors = ECNumbers.ancestorsOf(key, true);
                getOrNew(ancestors[0]).children.push(map[key]);
            }
            return map[key];
        };

        // Sort from general to specific
        const sortedEC = Array.from(this._map.values())
            .sort((a, b) => ECNumbers.levelOf(a.code) - ECNumbers.levelOf(b.code));

        for (const data of sortedEC) {
            const {code, value: count, sequences} = data;

            // Create a node for the new EC-code and place it in the map
            const toInsert = {
                id: code.split(".").map(x => ("0000" + x).slice(-4)).join("."),
                name: code.split(".").filter(x => x !== "-").join("."),
                children: [],
                data: {
                    self_count: count,
                    count: count,
                    data: Object.assign({}, data, {sequences: sequences, self_sequences: sequences})},
            };

            map[code] = toInsert;

            const ancestors = ECNumbers.ancestorsOf(code, true);
            getOrNew(ancestors[0]).children.push(toInsert);
            for (const a of ancestors) {
                const ancestor = getOrNew(a);
                ancestor.data.count += toInsert.data.count;
                Object.assign(ancestor.data.data.sequences, sequences);
            }
        }

        // Order the nodes by their id (order by EC number)
        Object.values(map).forEach(obj => {
            obj.children.sort((a, b) => a.id.localeCompare(b.id));
            obj.count = Object.values(obj.data.data.sequences).reduce((a, v) => a + v, 0);
            obj.self_count = Object.values(obj.data.data.self_sequences).reduce((a, v) => a + v, 0);
            obj.data.count = obj.count;
            obj.data.self_count = obj.self_count;
        });
        return map["-.-.-.-"]; // the root node
    }


    /**
     * Make a tree structure of the EC numbers in the resultset based
     * on proteoms
     *
     * @return {Node} a treeview data model
     */
    treeData() {
        const map = Object.create(null);

        // The root node
        map["-.-.-.-"] = {id: 0, name: "-.-.-.-", children: [], data: {self_count: 0, count: 0}};

        const getOrNew = key => {
            if (!(key in map)) {
                map[key] = {
                    id: key.split(".").map(x => ("0000" + x).slice(-4)).join("."),
                    name: key.split(".").filter(x => x !== "-").join("."),
                    children: [],
                    data: {self_count: 0, count: 0, data: {code: key, value: 0}},
                };
                const ancestors = ECNumbers.ancestorsOf(key, true);
                getOrNew(ancestors[0]).children.push(map[key]);
            }
            return map[key];
        };

        // Sort from general to specific
        const sortedEC = Array.from(this._map.values())
            .sort((a, b) => ECNumbers.levelOf(a.code) - ECNumbers.levelOf(b.code));

        for (const data of sortedEC) {
            const {code, value: count} = data;

            // Create a node for the new EC-code and place it in the map
            const toInsert = {
                id: code.split(".").map(x => ("0000" + x).slice(-4)).join("."),
                name: code.split(".").filter(x => x !== "-").join("."),
                children: [],
                data: {self_count: count, count: count, data: data},
            };

            map[code] = toInsert;

            const ancestors = ECNumbers.ancestorsOf(code, true);
            getOrNew(ancestors[0]).children.push(toInsert);
            for (const a of ancestors) {
                getOrNew(a).data.count += toInsert.data.count;
            }
        }

        // Order the nodes by their id (order by EC number)
        Object.values(map).forEach(obj => obj.children.sort((a, b) => a.id.localeCompare(b.id)));
        return map["-.-.-.-"]; // the root node
    }

    // ------------------- Static getters ---------------
    /**
     * @param {string} ecNum The EC number to get information on
     * @param {?string} [fallback="Unknown"] value to use ecNum not found
     * @return {?string} The value of the name property of `ecNum`
     */
    static nameOf(ecNum, fallback = "Unknown") {
        if (ECNumbers.ecData.has(ecNum)) {
            return ECNumbers.ecData.get(ecNum);
        }
        return fallback;
    }

    /**
     * Gets the full name of an EC number.
     *
     * For classes, subclasses and sub-subclasses this means
     * prepending the names of their ancestors.
     *
     * @param {string} ecNum The EC number to get information on
     * @param {?string} [fallback="Unknown"] value to use ecNum not found
     * @return {?string}
     */
    static fullNameOf(ecNum, fallback = "Unknown") {
        if (ecNum.endsWith("-")) {
            const ancestors = ECNumbers.ancestorsOf(ecNum).reverse();
            ancestors.push(ecNum);
            const result = ancestors.map(x => ECNumbers.nameOf(x, null)).filter(x => x !== null);
            if (result.length > 0) {
                return result.join(" ");
            } else {
                return fallback;
            }
        } else {
            return ECNumbers.nameOf(ecNum, fallback);
        }
    }

    /**
     * Gets a list of ancestors of a given EC number.
     *
     * "2.1.3.-" would give ["2.1.-.-","2.-.-.-"]
     *
     * @param  {string} ecNum The code of the EC number
     * @param {boolean} [includeRoot=false] weather to include the root (-.-.-.-)
     * @return {string[]}  Ancestors of the EC number (from specific to generic)
     */
    static ancestorsOf(ecNum, includeRoot = false) {
        const result = [];
        const parts = ecNum.split(".");
        const numSpecific = parts.includes("-") ? parts.indexOf("-") : parts.length;

        for (let i = numSpecific - 1; i >= 1; i--) {
            parts[i] = "-";
            result.push(parts.join("."));
        }

        if (includeRoot) {
            result.push("-.-.-.-");
        }
        return result;
    }


    /**
     * Calculates how specific the EC number is as int form
     * 0 (generic) to 4 (specific). Counts the number of non "-" in
     * the ec number
     *
     * @param  {string} ecNum an EC number (form "2.1.3.-")
     * @return {number}  Ancestors of the EC number (from specific to generic)
     */
    static levelOf(ecNum) {
        return (ecNum + ".-").split(".").indexOf("-");
    }


    // ----------- FETCH ---------------

    /**
     *
     * @param {*} newECs
     */
    static _addData(newECs) {
        for (let ec of newECs) {
            if (!this.ecData.has(ec.code) && ec.name) {
                ECNumbers.ecData.set(ec.code, ec.name);
            }
        }
    }

    /**
     * Fetch the names and data of the EC numbers that are not yet in the static map of
     * names
     * @param {string[]} codes array of EC numbers that should be in the cache
     * @access private
     */
    static async fetch(codes) {
        const todo = [];
        for (const curEc of codes) {
            if (!this.ecData.has(curEc)) {
                todo.push(curEc);
                const parts = curEc.split(".");
                const numSpecific = parts.includes("-") ? parts.indexOf("-") : parts.length;
                for (let i = numSpecific - 1; i >= 1; i--) {
                    parts[i] = "-";
                    const newKey = parts.join(".");
                    if (!this.ecData.has(newKey)) {
                        todo.push(newKey);
                    } else {
                        break; // the key already exists (all following already done)
                    }
                }
            }
        }

        if (todo.length > 0) {
            for (let i = 0; i < todo.length; i += BATCH_SIZE) {
                const res = await postJSON("/private_api/ecnumbers", JSON.stringify({
                    ecnumbers: todo.slice(i, i + BATCH_SIZE),
                }));
                ECNumbers._addData(res);
            }
        }
    }

    /**
     * @return {ECNumbers}
     */
    clone() {
        return ECNumbers.makeClone(this);
    }
}
