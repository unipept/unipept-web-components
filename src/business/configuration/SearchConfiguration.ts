export default class SearchConfiguration {
    constructor(
        public readonly equateIl: boolean = true,
        public readonly filterDuplicates: boolean = true,
        public readonly enableMissingCleavageHandling: boolean = false
    ) {}

    public toString() {
        return [this.equateIl, this.filterDuplicates, this.enableMissingCleavageHandling].map(
            t => t.toString()
        ).join(",");
    }
}

