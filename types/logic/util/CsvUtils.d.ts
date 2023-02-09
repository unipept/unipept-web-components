export default class CsvUtils {
    /**
     * Converts a javascript array of array to RFC 4180 compliant CSV/
     *
     * Each record is located on a separate line, delimited by a line break (CRLF).
     *
     * Fields containing line breaks (CRLF), double quotes, and commas should be enclosed in double-quotes; If
     * double-quotes are used to enclose fields, then a double-quote appearing inside a field must be escaped by
     * preceding it with another double quote.
     *
     * Prepending `data:text/csv,` makes a valid data url.
     *
     * @param grid The grid of cells that should be converted to CSV.
     * @return CSV-equivalent string of the given input string.
     */
    static toCsvString(grid: string[][]): string;
}
