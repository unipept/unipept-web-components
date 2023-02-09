import Normalizer from "./Normalizer";
/**
 * Normalises a grid on a row-per-row basis. For each row the largest and smallest value is selected after which all
 * other values are normalised with respect to these values.
 *
 * @author Pieter Verschaffelt
 */
export default class RowNormalizer implements Normalizer {
    normalize(data: number[][]): number[][];
    toString(): string;
}
