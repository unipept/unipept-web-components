export default class AmountTableItem {
    constructor(
        public readonly count: number,
        public readonly relativeCount: number,
        public readonly name: string,
        public readonly code: string
    ) {}
}
