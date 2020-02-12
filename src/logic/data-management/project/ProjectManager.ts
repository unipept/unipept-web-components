import Project from "./Project";
import fs from "fs";
import FileSystemProject from "./FileSystemProject";
import uuidv4 from "uuid/v4";
import path from "path";
import IOException from "./../../exceptions/IOException";

export default class FileSystemProjectManager {
    public static readonly PROJECT_MAIN_FILE = "i_investigation.txt";

    /**
     * Create a new project and directly create the necessary files on disk. The project will be initialized with a
     * name and identifier. The name is derived from the folder that was selected for the project. The identifier is
     * simply a randomly generated GUID.
     * 
     * @param projectLocation The folder where the project should be stored.
     * @throws {IOException} Whenever something goes wrong while trying to write project files.
     */
    public async initializeProject(projectLocation: string): Promise<FileSystemProject> {
        if (!projectLocation.endsWith("/")) {
            projectLocation += "/";
        }
    
        const id = uuidv4();
        const name = path.basename(projectLocation);

        const dataToWrite: string[] = [
            "INVESTIGATION",
            `Investigation Identifier\t"${id}"`,
            `Investigation Title\t"${name}"`
        ];

        try {
            fs.writeFileSync(
                projectLocation + FileSystemProjectManager.PROJECT_MAIN_FILE, 
                dataToWrite.join("\n"), 
                "utf-8"
            );
        } catch (err) {
            throw new IOException();
        }

        return new FileSystemProject(projectLocation, id, name);
    }

    /**
     * Reconstruct a project from disk.
     * 
     * @param projectLocation A filepath at which the project resides.
     * @throws {FileNotFoundException} If no valid project folder / files are found at the given projectLocation.
     * @throws {IOException} Whenever something goes wrong while loading the project.
     */
    public async readProject(projectLocation: string): Promise<FileSystemProject> {
        if (!projectLocation.endsWith("/")) {
            projectLocation += "/";
        }
        const serializedProject: string = fs.readFileSync(
            projectLocation + FileSystemProjectManager.PROJECT_MAIN_FILE, 
            "utf-8"
        );
        return new FileSystemProject("1", "test", projectLocation);
    }
}
