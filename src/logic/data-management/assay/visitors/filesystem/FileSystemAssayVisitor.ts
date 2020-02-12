export default abstract class FileSystemAssayVisitor {
    protected path: string;

    constructor(filePath: string) {
        this.path = filePath;
    }
}
