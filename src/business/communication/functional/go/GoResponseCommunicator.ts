import { GoResponse } from "./GoResponse";
import { GoCode } from "./../../../ontology/functional/go/GoDefinition";
import NetworkUtils from "./../../NetworkUtils";
import NetworkConfiguration from "./../../NetworkConfiguration";

export default class GoResponseCommunicator {
    private static goCodeToResponseMap = new Map<GoCode, GoResponse>();
    private static codesProcessed = new Set<GoCode>();

    public static readonly GO_BATCH_SIZE: number = 100;
    public static readonly GO_ENDPOINT: string = "/private_api/goterms";

    public static async process(codes: Set<GoCode>): Promise<void> {
        const toProcess = [...codes].filter(c => this.codesProcessed.has(c));

        for (let i = 0; i < toProcess.length; i += this.GO_BATCH_SIZE) {
            const data = JSON.stringify({
                goterms: toProcess.slice(i, i + this.GO_BATCH_SIZE)
            });

            const res = await NetworkUtils.postJSON(NetworkConfiguration.BASE_URL + this.GO_ENDPOINT, data);

            for (const term of res) {
                if (!this.goCodeToResponseMap.has(term.code)) {
                    this.goCodeToResponseMap.set(term.code, term)
                }
            }
        }

        for (const processed of toProcess) {
            this.codesProcessed.add(processed);
        }
    }

    public static getResponse(code: GoCode): GoResponse | undefined {
        return this.goCodeToResponseMap.get(code);
    }
}
