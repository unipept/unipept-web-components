import Clipboard from "clipboard";
import $ from "jquery";
import d3 from "d3";
import Utils from "./../components/custom/Utils";

/**
 * Make clicking on the selector copy to the user clipboard
 * @param {any} selector Anything that goes in $(...)
 * @param {*} textFunction Function to create te plan text to copy
 * @param {*} [tooltip= "Copy to clipboard"] Tooltip
 * @param {HTMLElement} [container=null] Optional container of the copy button,
 *   needed if used in a modal or other dynamicly created element.
 */
export function addCopy(selector, textFunction, tooltip = "Copy to clipboard", container = null) {
    const $el = $(selector).data("placement", "top")
        .attr("title", tooltip)
        //@ts-ignore
        .tooltip();
    const clipSettings = {
        text: textFunction,
    };
    if (container !== null) {
        clipSettings["container"] = container;
    }
    const clip = new Clipboard(selector, clipSettings);
    clip.on("success", e => {
        $el.attr("title", "Copied!")
            .tooltip("fixTitle")
            .tooltip("show")
            .attr("title", tooltip)
            .tooltip("fixTitle");
    });
    clip.on("error", e => {
        $el.attr("title", "Sorry, something went wrong")
            .tooltip("fixTitle")
            .tooltip("show")
            .attr("title", tooltip)
            .tooltip("fixTitle");
    });
}

/**
 * Returns the brightness of an rgb-color
 * from: http:// www.w3.org/WAI/ER/WD-AERT/#color-contrast
 *
 * Te bereadable, the diffrence should be 125 form the background
 *
 * @param {{r:number,g:number,b:number}} rgb color values
 * @return {number} brightness
 */
export function brightness(rgb) {
    return rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114;
}

/**
 * Triggers a file download in the browser using a hidden
 * form and a server round trip. Returns a Promise that resolves when
 * the file starts downloading
 *
 * @param {string} data The text you want in the file
 * @param {string} fileName The requested file name
 * @param  {String}  [fileType] file type like "text/csv"
 * @return {Promise.<string>}
 */
export function downloadDataByForm(data, fileName, fileType = null) {
    if (Utils.isElectron()) {
        const fs = require("fs");
        const { dialog } = require("electron").remote;
        dialog.showSaveDialog(null, { title: "save to CSV", defaultPath: fileName }).then((saveDialogReturnValue) => {
            if (!saveDialogReturnValue.canceled) {
                fs.writeFileSync(saveDialogReturnValue.filePath, data);
            }
        })
    } else {
        return new Promise(function(resolve, reject) {
            let nonce = Math.random();
            $("form.download").remove();
            $("body").append("<form class='download' method='post' action='/download'></form>");
            let $downloadForm = $("form.download").append("<input type='hidden' name='filename' value='" + fileName + "'/>");
            $downloadForm.append("<input type='hidden' name='data' class='data'/>");
            if (fileType !== null) {
                $downloadForm.append(`<input type='hidden' name='filetype' value='${fileType}'/>`);
            }
            $downloadForm.submit();
        });
    }
}

/**
 * Triggers a file download in the browser using a hidden
 * link and a data url.
 *
 * The download attribute doesn't work in IE and Safari:
 * http://caniuse.com/#feat=download
 *
 * @param {string} dataURL The dataURL of the data
 * @param {string} fileName The requested file name
 */
export function downloadDataByLink(dataURL, fileName) {
    $("a.downloadLink").remove();
    $("body").append("<a class='downloadLink' style='display:none;' download='" + fileName + "' target='_blank'/>");
    let $downloadLink = $("a.downloadLink").attr("href", dataURL);
    $downloadLink[0].click();
}


/**
 * a promise based get function
 * from http://www.html5rocks.com/en/tutorials/es6/promises/
 * @param {string} url
 * @return {Promise<any>}
 */
export function get(url: string): Promise<any> {
    // Return a new promise.
    return new Promise(function(resolve, reject) {
        // Do the usual XHR stuff
        let req = new XMLHttpRequest();
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
 * Gets data and JSON parses it
 * @todo replace with fetch
 * @param {string} url
 * @return {any}
 */
export function getJSON(url) {
    return get(url).then(JSON.parse);
}

/**
 * Returns the readable text color based on the brightness of a given backgroud color
 * @param {any} color
 * @return {string} color to use
 */
export function getReadableColorFor(color) {
    let textColor;
    try {
        textColor = brightness(d3.rgb(color)) < 125 ? "#eee" : "#000";
    } catch (err) {
        textColor = "#000";
    }
    return textColor;
}

/**
 * highlights the background color of the given element for 2 seconds
 * @param {*} element
 */
export function highlight(element) {
    $(element).addClass("flash");
    setTimeout(function() {
        $(element).removeClass("flash");
    }, 2000);
}

/**
 * Takes an iterator and puts all values in an array
 *
 * @todo replace calls with Array.from of [...array]
 * @param {any} iterator
 * @return {any[]}
 */
export function iteratorToArray(iterator) {
    let vals = [],
        v;
    v = iterator.next();
    while (!v.done) {
        vals.push(v.value);
        v = iterator.next();
    }
    return vals;
}

/**
 * Logs a message as exception to Google Analytics
 * @param {string} errorMessage
 */
export function logErrorToGoogle(errorMessage) {
    this.logToGoogle("Global", "Exception", errorMessage);
}

/**
 * Logs data to Google Analytics
 * @param {string} page
 * @param {string} action
 * @param {string} [name]
 * @param {any} [value]
 */
export function logToGoogle(page, action, name, value) {
    //@ts-ignore (global variable injected by script in head)
    if (typeof (_gaq) !== "undefined") {
        if (name === undefined) {
            //@ts-ignore
            _gaq.push(["_trackEvent", page, action]);
        } else if (value === undefined) {
            //@ts-ignore
            _gaq.push(["_trackEvent", page, action, name]);
        } else {
            //@ts-ignore
            _gaq.push(["_trackEvent", page, action, name, value]);
        }
    }
}

/**
 * function for error handling
 * @param {*} errorMessage  error that gets logged to the console
 * @param {*} [userMessage] message to display to the user
 */
export function showError(errorMessage, userMessage) {
    if (errorMessage !== null) {
        logErrorToGoogle(errorMessage);
        if (typeof console !== "undefined") {
            console.error(errorMessage); // eslint-disable-line no-console
        }
    }
    if (userMessage) {
        let msg = $("<div class='alert alert-danger alert-dismissible' style='display: none;'><button type='button' class='close' data-dismiss='alert'><span>&times;</span></button><strong>Oh snap!</strong> " + userMessage + "</div>");
        $("#messages").append(msg);
        //@ts-ignore
        msg.show("normal");
    }
}

/**
 *  display the message variable in an info alert
 * @param {string} message
 */
export function showInfo(message) {
    let msg = $("<div class='alert alert-info alert-dismissible' style='display: none;'><button type='button' class='close' data-dismiss='alert'><span>&times;</span></button><strong>Heads up!</strong> " + message + "</div>");
    $("#messages").append(msg);
    //@ts-ignore
    msg.show("normal");
}

/**
 * Change string to title cases
 * https://stackoverflow.com/a/196991
 * @param {string} s to titleise
 * @return {string}
 */
export function stringTitleize(s) {
    return s.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

/**
 * Converts a javascript array of array to RFC 4180 complient CSV
 *
 * Each record is located on a separate line, delimited by a line break (CRLF)
 *
 * Fields containing line breaks (CRLF), double quotes, and commas should be
 * enclosed in double-quotes; If double-quotes are used to enclose fields, then
 * a double-quote appearing inside a field must be escaped by preceding it with
 * another double quote.
 *
 * Prepending `data:text/csv,` makes a valid data url
 * @param  {(string[])[]} grid [description]
 * @return {string}      The csv string
 */
export function toCSVString(grid) {
    return grid.map(line => 
        line.map(cell => {
            let content = cell.toString();
            if (content.includes(",") || content.includes("\"") ||
                content.includes("\n") || content.includes("\r")) {
                return `"${content.replace(/"/g, "\"\"")}"`;
            } else {
                return content;
            }
        }).join(",")).join("\n") + "\n\r";
}


/**
 * Convert a number to a percentage,
 * 0.1 => "10%".
 * @param  {Number} number     [description]
 * @param  {Number} [digits=0] [description]
 * @return {string}            [description]
 */
export function numberToPercent(number, digits = 0) {
    return (100 * number).toFixed(digits) + "%";
}

/**
 * Sends the SVG-code to the server to convert it to a PNG.
 *
 * @param {string} svgSelector The DOM selector of the SVG or jQuery object
 * @returns {string} A dataURL containing the resulting PNG
*/
export async function svg2png(svgSelector: string) : Promise<string> {
    // Send the SVG code to the server for png conversion
    return new Promise(resolve => {    
        let $element = $(svgSelector);
        let svg = $element.wrap("<div></div>").parent().html();
        $element.unwrap();
        $.post("/convert", { image: svg }, resolve);
    })
}

export function svg2svgDataURL(svgSelector: string) {
    var el = $(svgSelector).get(0)
    var svgString = new XMLSerializer().serializeToString(el);
    var decoded = unescape(encodeURIComponent(svgString));
    // convert the svg to base64
    var base64 = btoa(decoded);
    return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Uses html2canvas to convert canvas to a PNG.
 *
 * @param {string} selector The DOM selector
 * @returns {string} A dataURL containing the resulting PNG
*/
export async function dom2pngDataURL(selector: string) : Promise<string> {
    const html2canvas = require("html2canvas");
    // Use html2canvas to convert selected element to canvas, 
    // then convert that canvas to a dataURL
    let element = $(selector).get(0)
    return html2canvas(element, {windowWidth: element.scrollWidth, windowHeight: element.scrollHeight})
        .then((canvasElement) => canvasElement.toDataURL())
}

/**
 * Posts data to a url as JSON and returns a promise containing the parsed
 * (JSON) response
 *
 * @param  {string} url The url to which we want to send the request
 * @param  {string} data The data to post in JSON format
 * @return {Promise} A Promise containing the parsed response data
 */
export async function postJSON(url, data) {
    return fetch(url, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: data,
    }).then(res => res.json());
}

export const delay = ms => new Promise(res => setTimeout(res, ms));