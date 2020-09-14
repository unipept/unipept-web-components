import Study from "./Study";
export default abstract class StudyVisitor {
    abstract visitStudy(study: Study): Promise<void>;
}
