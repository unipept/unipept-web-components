import Project from "./Project";

export default class FileSystemProject extends Project {
    private path: string;

    constructor(projectPath: string, id: string, name: string) {
        super(id, name);
        this.path = projectPath;
    }
}
