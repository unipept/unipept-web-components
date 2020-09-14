import SampleAssay from "./SampleAssay";
export default class SampleAssayCollection {
    readonly id: string;
    readonly environment: string;
    readonly projectWebsite: string;
    readonly reference: string;
    readonly url: string;
    readonly datasets: SampleAssay[];
    constructor(id: string, environment: string, projectWebsite: string, reference: string, url: string, datasets: SampleAssay[]);
}
