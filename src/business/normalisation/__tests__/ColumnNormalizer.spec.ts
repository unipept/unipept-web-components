import ColumnNormalizer from "@/business/normalisation/ColumnNormalizer";

describe("ColumnNormalizer", () => {
    it("normalizes a complete grid correctly", () => {
        const data = [
            [4, 4, 2, 1],
            [1, 2, 1, 0],
            [4, 3, 0, 4]
        ];

        runTestForGrid(data);
    });

    it("normalizes a grid with negative values correctly", () => {
        const data = [
            [4, 4, -2, 1],
            [-1, 2, 1, 0],
            [-4, 3, 0, 4]
        ];

        runTestForGrid(data);

    });

    it("does not crash on all-zero grids", () => {
        const normalizer = new ColumnNormalizer();
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

function runTestForGrid(data: number[][]) {
    const normalizer = new ColumnNormalizer();

    const normalizedResult: number[][] = normalizer.normalize(data);
    expect(normalizedResult).toMatchSnapshot();

    // Check if each column does indeed contain a 1 and 0 value (since the normalisation is performed on a column-b
    // basis).
    let allContainMaximum = true;
    let allContainMinimum = true;
    for (let i = 0; i < data[0].length; i++) {
        let max = false;
        let min = false;
        for (let j = 0; j < data.length; j++) {
            if (data[j][i] === 1) {
                max = true;
            }
            if (data[j][i] === 0) {
                min = true;
            }
        }
    }

    expect(allContainMaximum).toBeTruthy();
    expect(allContainMinimum).toBeTruthy();
}
