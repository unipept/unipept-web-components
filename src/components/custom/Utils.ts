export default class Utils {
    /**
     * This method should be used when a specific URL should be opened in a new browser window. The method automatically
     * decides whether Electron or a default redirection should take place.
     * 
     * @param url The full url to which navigation should take place.
     */
    static openInBrowser(url: string): void {
        if (Utils.isElectron()) {
            const shell = require("electron").shell;
            shell.openExternal(url);
        } else {
            window.open(url);
        }
    }
    
    /**
     * Method that can be used to check if the app is being executed by Electron or something else.
     * 
     * @return True if the app is being executed in an Electron-powered environment.
     */
    static isElectron(): boolean {
        const userAgent = navigator.userAgent.toLowerCase();
        return userAgent.indexOf(" electron/") > -1;
    }
}
