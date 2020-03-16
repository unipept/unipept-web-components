/**
 * This class contains all utility functions required for logging analytics to an analysis-server (e.g. Google).
 */
export default class AnalyticsUtil {
    public static logToGoogle(page: string, action: string, name?: string, value?: any) {
        // TODO make sure that this variable is indeed correctly injected.
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
}
