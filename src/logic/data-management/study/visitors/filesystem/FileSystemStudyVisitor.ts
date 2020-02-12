import StudyVisitor from "../StudyVisitor";
import Study from "../../Study";

export default abstract class FileSystemStudyVisitor extends StudyVisitor {
    protected path: string;

    /**
     * @param filePath The location on disk where the study that should be visited resides. This should point to a
     * valid file.
     */
    constructor(filePath: string) {
        super();
        this.path = filePath;
    }
}
