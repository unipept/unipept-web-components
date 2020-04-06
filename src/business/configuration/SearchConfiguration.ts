export default class SearchConfiguration {
    constructor(
        public readonly equateIl: boolean = true,
        public readonly filterDuplicates: boolean = true,
        public readonly enableMissingCleavageHandling: boolean = false
    ) {}
}
