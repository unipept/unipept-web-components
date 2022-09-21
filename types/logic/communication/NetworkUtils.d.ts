export default class NetworkUtils {
    /**
     * Posts data to a url as JSON and returns a promise containing the parsed (JSON) response.
     *
     * @param url The url to which we want to send the request.
     * @param data The data to post in JSON format.
     * @return A promise containing the parsed response data.
     */
    static postJSON(url: string, data: any): Promise<any>;
    /**
     * A promise based get function from http://www.html5rocks.com/en/tutorials/es6/promises/.
     *
     * @param url
     */
    static get(url: string): Promise<any>;
    /**
     * Gets data and parses it directly as JSON.
     *
     * @param url
     */
    static getJSON(url: string): any;
    /**
     * This method should be used when a specific URL should be opened in a new browser window. The method automatically
     * decides whether Electron or a default redirection should take place.
     *
     * @param url The full url to which navigation should take place.
     */
    static openInBrowser(url: string): void;
}
