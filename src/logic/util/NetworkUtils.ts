export default class NetworkUtils {
    private static jsonHeaders = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    };

    public static async postJson(url: string, data: any): Promise<any> {
        return fetch(url, {
            method: "POST",
            headers: this.jsonHeaders,
            body: data
        }).then(response => response.json());
    };
}
