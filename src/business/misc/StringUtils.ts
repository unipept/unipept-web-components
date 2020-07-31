export default class StringUtils {
    /**
     * Change string to title cases (see: https://stackoverflow.com/a/196991)
     * @param {string} s to titleise
     * @return {string}
     */
    public static stringTitleize(s: string): string {
        return s.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    /**
     * Convert a number to a percentage, 0.1 => "10%".
     */
    public static numberToPercent(n: number, digits: number = 0): string {
        return (100 * n).toFixed(digits) + "%";
    }

    /**
     * Left pad the given string with the given character until it has the required length.
     *
     * @param str The string that should be left padded.
     * @param character The character that needs to be prepended to the string.
     * @param len The length the string should be after it has been padded.
     */
    public static leftPad(str: string, character: string, len: number): string {
        const numberOfChars = len - str.length;
        let chars = "";
        for (let i = 0; i < numberOfChars; i++) {
            chars += character;
        }
        return chars + str;
    }
}
