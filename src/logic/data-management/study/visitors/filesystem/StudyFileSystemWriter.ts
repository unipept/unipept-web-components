import FileSystemStudyVisitor from "./FileSystemStudyVisitor";
import Study from "../../Study";

/**
 * Class that's able to fully serialize a Study-object to the local filesystem.
 */
export default class StudyFileSystemWriter extends FileSystemStudyVisitor {
    public async visitStudy(study: Study): Promise<void> {
        
    }
}
