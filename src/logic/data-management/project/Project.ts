import Study from "../study/Study";

export default class Project {
    private readonly studies: Study[];

    public name: string;
    
    constructor(id: string, name: string) {
        this.name = name;
    }

    public getStudies(): Study[] {
        return this.studies;
    }

    public setStudies(studies: Study[]): void {
        this.studies.splice(0, this.studies.length);
        this.studies.push(...studies);
    }

    public addStudy(study: Study): void {
        // TODO implement
    }
}
