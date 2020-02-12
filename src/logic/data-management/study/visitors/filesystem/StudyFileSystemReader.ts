import FileSystemStudyVisitor from "./FileSystemStudyVisitor";
import Study from "../../Study";

/**
 * Class that's able to fully deserialize a study that's stored in the local filesystem of a user.
 */
export default class StudyFileSystemReader extends FileSystemStudyVisitor {
    public async visitStudy(study: Study): Promise<void> {
        
    }
}
