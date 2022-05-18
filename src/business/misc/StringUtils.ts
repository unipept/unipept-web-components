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

    /**
     * Convert an amount of seconds into a human readable time string. Supports up to 24 hours of time strings.
     *
     * @param seconds
     */
    public static secondsToTimeString(seconds: number): string {
        if (seconds && !isNaN(seconds) && seconds !== Infinity) {
            const date = new Date(seconds * 1000);
            let timeString = "";
            if (date.getDate() - 1 > 0) {
                timeString += `${date.getDate() - 1} day${date.getDate() - 1 !== 1 ? "s" : ""}, `
            }

            if (date.getHours() - 1 > 0) {
                timeString += `${date.getHours() - 1} hour${date.getHours() - 1 !== 1 ? "s" : ""}, `
            }

            if (date.getHours() - 1 > 0 || date.getMinutes() > 0) {
                timeString += `${date.getMinutes()} minute${date.getMinutes() !== 1 ? "s" : ""} and `
            }

            timeString += `${date.getSeconds()} second${date.getSeconds() !== 1 ? "s" : ""}`;

            return timeString;
        } else {
            return "0 seconds";
        }
    }

    /**
     * Convert a (potentially) large number to a string in which a space is added after each group of 3 digits.
     * @param n Number that should be converted into a nice, human readable string.
     */
    public static toHumanReadableNumber(n: number): string {
        return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}
