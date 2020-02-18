import Study from "src/logic/data-management/study/Study";

export default abstract class StudyVisitor {
    public async abstract visitStudy(study: Study): Promise<void>;
}
