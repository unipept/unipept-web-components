import { EcCode } from "@/business/ontology/functional/ec/EcDefinition";
import { EcResponse } from "@/business/communication/functional/ec/EcResponse";
import { postJSON } from "@/logic/utils";
import NetworkConfiguration from "@/business/communication/NetworkConfiguration";

export default class EcResponseCommunicator {
    private static ecCodeToResponseMap = new Map<EcCode, EcResponse>();
    private static codesProcessed = new Set<EcCode>();

    public static readonly EC_BATCH_SIZE: number = 100;
    public static readonly EC_ENDPOINT: string = "/private_api/ecnumbers";

    public static async process(codes: Set<EcCode>): Promise<void> {
        const toProcess = [...codes].filter(c => this.codesProcessed.has(c));

        for (let i = 0; i < toProcess.length; i += this.EC_BATCH_SIZE) {
            const data = JSON.stringify({
                ecnumbers: toProcess.slice(i, i + this.EC_BATCH_SIZE)
            });

            const res = await postJSON(NetworkConfiguration.BASE_URL + this.EC_ENDPOINT, data);

            for (const term of res) {
                if (!this.ecCodeToResponseMap.has(term.code)) {
                    this.ecCodeToResponseMap.set(term.code, term);
                }
            }
        }

        for (const processed of toProcess) {
            this.codesProcessed.add(processed);
        }
    }

    public static getResponse(code: EcCode): EcResponse {
        return this.ecCodeToResponseMap.get(code);
    }
}
