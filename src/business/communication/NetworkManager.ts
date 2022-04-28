export default interface NetworkManager {
    /**
     * Perform an HTTP POST request with a set of parameters (that will be passed as body) to a specific URL.
     */
    postJSON(url: string, parameters: any): Promise<any>;

    /**
     * Perform an HTTP GET request to a specific URL.
     */
    getJSON(url: string): Promise<any>;
}
