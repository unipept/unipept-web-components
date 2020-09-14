import Normalizer from "./Normalizer";
/**
 * Normalises a grid on a column-per-column basis. The largest and smallest value per column are selected, after which
 * all other values in this column are normalised with respect to these values.
 *
 * @author Pieter Verschaffelt
 */
export default class ColumnNormalizer implements Normalizer {
    normalize(data: number[][]): number[][];
    toString(): string;
}
