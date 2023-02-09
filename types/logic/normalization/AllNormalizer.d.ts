import Normalizer from "./Normalizer";
/**
 * Normalises values in a grid relative to one absolute maximum and minimum value for the whole grid. The largest and
 * smallest value for the complete grid are selected after which all other values are normalised according to these
 * values.
 *
 * @author Pieter Verschaffelt
 */
export default class AllNormalizer implements Normalizer {
    normalize(data: number[][]): number[][];
    toString(): string;
}
