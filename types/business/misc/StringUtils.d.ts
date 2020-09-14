export default class StringUtils {
    /**
     * Change string to title cases (see: https://stackoverflow.com/a/196991)
     * @param {string} s to titleise
     * @return {string}
     */
    static stringTitleize(s: string): string;
    /**
     * Convert a number to a percentage, 0.1 => "10%".
     */
    static numberToPercent(n: number, digits?: number): string;
    /**
     * Left pad the given string with the given character until it has the required length.
     *
     * @param str The string that should be left padded.
     * @param character The character that needs to be prepended to the string.
     * @param len The length the string should be after it has been padded.
     */
    static leftPad(str: string, character: string, len: number): string;
}
