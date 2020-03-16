export default class SystemUtils {
    /**
     * Method that can be used to check if the app is being executed by Electron or something else.
     *
     * @return True if the app is being executed in an Electron-powered environment.
     */
    public static isElectron(): boolean {
        const userAgent = navigator.userAgent.toLowerCase();
        return userAgent.indexOf(" electron/") > -1;
    }
}
