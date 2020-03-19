import SampleAssay from "./SampleAssay";

export default class SampleAssayCollection {
    constructor(
        public readonly id: string,
        public readonly environment: string,
        public readonly projectWebsite: string,
        public readonly reference: string,
        public readonly url: string,
        public readonly datasets: SampleAssay[]
    ) {}
}

