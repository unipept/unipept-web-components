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
     * Transform each first letter of every word in the input (separated by spaces) to a capital letter.
     */
    public static capitalize(input: string): string {
        return input.split(" ").map(StringUtils.stringTitleize).join(" ");
    }
}
