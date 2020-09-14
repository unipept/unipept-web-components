export default class TreeNode {
    readonly id: number;
    readonly name: string;
    readonly rank: string;
    children: TreeNode[];
    data: {
        count: number;
        self_count: number;
    };
    /**
     * Creates a node based on a mandatory id. Name and rank are optional.
     *
     * @param id The taxon id of the node
     * @param name The name of the organism
     * @param rank The taxonomic rank of the organism
     */
    constructor(id: number, name?: string, rank?: string);
    /**
     * Searches for a node with the given taxon id in its children. Returns null if it is not found.
     *
     * @param taxonId NCBI taxon id to search for.
     * @return A matching TreeNode object or null.
     */
    getChild(taxonId: number): TreeNode;
    /**
     * Returns the number of children for this node.
     *
     * @return The number of children.
     */
    getChildCount(): number;
    /**
     * !! Please use the addChild function of the parent tree instead !!
     * Adds a child to this node.
     *
     * @param node The child to add.
     */
    addChild(node: TreeNode): void;
    /**
     * Returns the number of peptides associated with this node and all of its children.
     *
     * @return The number of peptides.
     */
    getCounts(): number;
    /**
     * Recursively calls a function on this object and its children.
     *
     * @param f The function to call.
     */
    callRecursively(f: (x: TreeNode) => any): void;
    /**
     * Recursively calls a function on this object and its children + data of child
     *
     * @param f The function to call
     * @return cs
     */
    callRecursivelyPostOder(f: (Node: TreeNode, any: any) => any): any;
}
