import { InterproCode } from "./../../../ontology/functional/interpro/InterproDefinition";
import InterproResponse from "./InterproResponse";
import NetworkUtils from "./../../NetworkUtils";
import NetworkConfiguration from "./../../NetworkConfiguration";

export default class InterproResponseCommunicator {
    private static interproCodeToResponseMap = new Map<InterproCode, InterproResponse>();
    private static codesProcessed = new Set<InterproCode>();

    public static readonly INTERPRO_BATCH_SIZE: number = 100;
    public static readonly INTERPRO_ENDPOINT: string = "/private_api/interpros";

    public static async process(codes: InterproCode[]): Promise<void> {
        codes = codes.map(c => c.substr(4));
        const toProcess = codes.filter(c => !this.codesProcessed.has(c));

        for (let i = 0; i < toProcess.length; i += this.INTERPRO_BATCH_SIZE) {
            const data = JSON.stringify({
                interpros: toProcess.slice(i, i + this.INTERPRO_BATCH_SIZE)
            });

            const res = await NetworkUtils.postJSON(NetworkConfiguration.BASE_URL + this.INTERPRO_ENDPOINT, data);

            for (const term of res) {
                term.code = "IPR:" + term.code;
                if (!this.interproCodeToResponseMap.has(term.code)) {
                    this.interproCodeToResponseMap.set(term.code, term)
                }
            }
        }

        for (const processed of toProcess) {
            this.codesProcessed.add(processed);
        }
    }

    public static getResponse(code: InterproCode): InterproResponse | undefined {
        return this.interproCodeToResponseMap.get(code);
    }
}
