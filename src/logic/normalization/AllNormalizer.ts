import Normalizer from "./Normalizer";

/**
 * Normalises values in a grid relative to one absolute maximum and minimum value for the whole grid. The largest and
 * smallest value for the complete grid are selected after which all other values are normalised according to these
 * values.
 *
 * @author Pieter Verschaffelt
 */
export default class AllNormalizer implements Normalizer {
    public normalize(data: number[][]): number[][] {
        if (data.length === 0 || data[0].length === 0) {
            return data;
        }

        let min = Infinity;
        let max = -Infinity;

        for (const row of data) {
            for (const value of row) {
                min = Math.min(min, value);
                max = Math.max(max, value);
            }
        }

        const output: number[][] = [];

        for (const row of data) {
            const newRow: number[] = [];
            for (const value of row) {
                if (max - min !== 0) {
                    newRow.push((value - min) / (max - min));
                } else {
                    newRow.push(0);
                }
            }
            output.push(newRow);
        }

        return output;
    }

    public toString(): string {
        return "AllNormalizer";
    }
}
