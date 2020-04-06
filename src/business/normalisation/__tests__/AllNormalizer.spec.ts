import AllNormalizer from "@/business/normalisation/AllNormalizer";

describe("AllNormalizer", () => {
    it("normalizes a complete grid correctly", () => {
        const normalizer = new AllNormalizer();
        const data = [
            [4, 4, 2, 1],
            [1, 2, 1, 0],
            [4, 3, 0, 4]
        ];

        const normalizedResult = normalizer.normalize(data);
        expect(normalizedResult).toMatchSnapshot();
    });

    it("normalizes a grid with negative values correctly", () => {
        const normalizer = new AllNormalizer();
        const data = [
            [4, 4, -2, 1],
            [-1, 2, 1, 0],
            [-4, 3, 0, 4]
        ];

        const normalizedResult = normalizer.normalize(data);
        // There should no longer be negative values in the result, since everything is mapped onto the [0, 1] interval.
        expect(normalizedResult).toMatchSnapshot();
    });

    it("does not crash on all-zero grids", () => {
        const normalizer = new AllNormalizer();
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
