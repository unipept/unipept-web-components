export default class NetworkUtils {
    /**
     * Posts data to a url as JSON and returns a promise containing the parsed (JSON) response.
     *
     * @param url The url to which we want to send the request.
     * @param data The data to post in JSON format.
     * @return A promise containing the parsed response data.
     */
    public static async postJSON(url: string, data: any): Promise<any> {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: data
        });
        return response.json();
    }

    /**
     * A promise based get function from http://www.html5rocks.com/en/tutorials/es6/promises/.
     *
     * @param url
     */
    public static get(url: string): Promise<any> {
        // Return a new promise.
        return new Promise(function(resolve, reject) {
            // Do the usual XHR stuff
            const req = new XMLHttpRequest();
            req.open("GET", url);

            req.onload = function() {
                // This is called even on 404 etc
                // so check the status
                if (req.status === 200) {
                    // Resolve the promise with the response text
                    resolve(req.response);
                } else {
                    // Otherwise reject with the status text
                    // which will hopefully be a meaningful error
                    reject(Error(req.statusText));
                }
            };

            // Handle network errors
            req.onerror = function() {
                reject(Error("Network Error"));
            };

            // Make the request
            req.send();
        });
    }

    /**
     * Gets data and parses it directly as JSON.
     *
     * @param url
     */
    public static getJSON(url: string): any {
        return NetworkUtils.get(url).then(JSON.parse);
    }
}
