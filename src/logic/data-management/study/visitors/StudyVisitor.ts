import Study from "../Study";

export default abstract class StudyVisitor {
    public async abstract visitStudy(study: Study): Promise<void>;
}
