import $ from "jquery";
import SystemUtils from "../util/SystemUtils";

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

    public static async downloadDataByForm(data: string, fileName: string, fileType: string | null = null) {
        if (SystemUtils.isElectron()) {
            // Hack to be able to use Electron without the need to add it to the required dependencies
            eval(`
                const fs = require("fs");
                const { dialog } = require("electron").remote;
                
                dialog.showSaveDialog(
                    null,
                    {
                        title: "save to CSV",
                        defaultPath: fileName
                    }
                ).then((returnValue) => {
                    if (!returnValue.canceled) {
                        fs.writeFileSync(returnValue.filePath, data);
                    }
                });
            `);
        } else {
            return new Promise(function(resolve, reject) {
                let nonce = Math.random();
                $("form.download").remove();

                $("body").append("<form class='download' method='post' action='/download'></form>");

                let $downloadForm = $("form.download").append(
                    "<input type='hidden' name='filename' value='" + fileName + "'/>"
                );
                $downloadForm.append("<input type='hidden' name='data' class='data'/>");
                if (fileType !== null) {
                    $downloadForm.append(`<input type='hidden' name='filetype' value='${fileType}'/>`);
                }
                $downloadForm.append("<input type='hidden' name='nonce' value='" + nonce + "'/>");
                // The x-www-form-urlencoded spec replaces newlines with \n\r
                $downloadForm.find(".data").val(data.replace(/\n\r/g, "\n"));

                let downloadTimer = setInterval(() => {
                    if (document.cookie.indexOf(nonce.toString()) !== -1) {
                        clearInterval(downloadTimer);
                        resolve(fileName);
                    }
                }, 100);

                $downloadForm.submit();
            });
        }
    }

    /**
     * This method should be used when a specific URL should be opened in a new browser window. The method automatically
     * decides whether Electron or a default redirection should take place.
     *
     * @param url The full url to which navigation should take place.
     */
    public static openInBrowser(url: string): void {
        if (SystemUtils.isElectron()) {
            eval(`
                const shell = require("electron").shell;
                shell.openExternal(url);
            `);
        } else {
            window.open(url);
        }
    }
}
