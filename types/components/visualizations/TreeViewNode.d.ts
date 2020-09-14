export default class TreeViewNode {
    id: any;
    name: string;
    data: any;
    children: TreeViewNode[];
    constructor(id: any, name: string, data: any, children: TreeViewNode[]);
}
