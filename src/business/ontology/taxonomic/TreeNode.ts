export default class TreeNode {
    public children: TreeNode[] = [];
    public data: { count: number, self_count: number } = { count: undefined, self_count: 0 };

    /**
     * Creates a node based on a mandatory id. Name and rank are optional.
     *
     * @param id The taxon id of the node
     * @param name The name of the organism
     * @param rank The taxonomic rank of the organism
     */
    constructor(
        public readonly id: number,
        public readonly name: string = "",
        public readonly rank: string = "no rank"
    ) {}

    /**
     * Searches for a node with the given taxon id in its children. Returns null if it is not found.
     *
     * @param taxonId NCBI taxon id to search for.
     * @return A matching TreeNode object or null.
     */
    public getChild(taxonId: number): TreeNode {
        const child = this.children.find(c => c.id === taxonId);
        return (child? child : null);
    }

    /**
     * Returns the number of children for this node.
     *
     * @return The number of children.
     */
    public getChildCount(): number {
        return this.children.length;
    }

    /**
     * !! Please use the addChild function of the parent tree instead !!
     * Adds a child to this node.
     *
     * @param node The child to add.
     */
    public addChild(node: TreeNode): void {
        this.children.push(node);
    }

    /**
     * Returns the number of peptides associated with this node and all of its children.
     *
     * @return The number of peptides.
     */
    public getCounts(): number {
        if (this.data.count === undefined) {
            this.data.count = this.data.self_count;
            if (this.getChildCount() !== 0) {
                this.data.count += this.children.reduce((sum, c) => sum + c.getCounts(), 0);
            }
        }
        return this.data.count;
    }

    /**
     * Recursively calls a function on this object and its children.
     *
     * @param f The function to call.
     */
    public callRecursively(f: (Node) => any) {
        f.call(this);
        if (this.children) {
            this.children.forEach(c => {
                c.callRecursively(f);
            });
        }
    }

    /**
     * Recursively calls a function on this object and its children + data of child
     *
     * @param f The function to call
     * @return cs
     */
    public callRecursivelyPostOder(f: (Node, any) => any): any {
        let childResults = [];
        if (this.children) {
            childResults = this.children.map(c =>
                c.callRecursivelyPostOder(f));
        }
        return f(this, childResults);
    }
}
