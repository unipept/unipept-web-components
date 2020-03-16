import { Normalizer } from "./Normalizer";

export default class RowNormalizer implements Normalizer {
    public normalize(data: number[][]): number[][] {
        if (data.length === 0 || data[0].length === 0) {
            return data;
        }

        const output: number[][] = [];
        for (const row of data) {
            const min = Math.min(...row);
            const max = Math.max(...row);

            const newRow = [];
            for (const item of row) {
                if (max - min !== 0) {
                    newRow.push((item - min) / (max - min));
                } else {
                    newRow.push(0);
                }
            }
            output.push(newRow);
        }
        return output;
    }
}
