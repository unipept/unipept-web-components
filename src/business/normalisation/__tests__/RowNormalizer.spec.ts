import RowNormalizer from "@/business/normalisation/RowNormalizer";

describe("RowNormalizer", () => {
    it("normalizes a complete grid correctly", () => {
        const normalizer = new RowNormalizer();
        const data = [
            [4, 4, 2, 1],
            [1, 2, 1, 0],
            [4, 3, 0, 4]
        ];

        const normalizedResult = normalizer.normalize(data);
        expect(normalizedResult).toMatchSnapshot();

        // Every row should contain a 1
        expect(normalizedResult.every(row => row.indexOf(1) !== -1)).toBeTruthy();
        // Every row should contain a 0
        expect(normalizedResult.every(row => row.indexOf(0) !== -1)).toBeTruthy();
    });

    it("normalizes a grid with negative values correctly", () => {
        const normalizer = new RowNormalizer();
        const data = [
            [4, 4, -2, 1],
            [-1, 2, 1, 0],
            [-4, 3, 0, 4]
        ];

        const normalizedResult = normalizer.normalize(data);
        // There should no longer be negative values in the result, since everything is mapped onto the [0, 1] interval.
        expect(normalizedResult).toMatchSnapshot();

        // Every row should contain a 1
        expect(normalizedResult.every(row => row.indexOf(1) !== -1)).toBeTruthy();
        // Every row should contain a 0
        expect(normalizedResult.every(row => row.indexOf(0) !== -1)).toBeTruthy();
    });

    it("does not crash on all-zero grids", () => {
        const normalizer = new RowNormalizer();
        const data = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];

        const normalizedResult = normalizer.normalize(data);
        // There should no longer be negative values in the result, since everything is mapped onto the [0, 1] interval.
        expect(normalizedResult).toMatchSnapshot();
    });
});
