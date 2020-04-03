import { EcCode } from "./../../../ontology/functional/ec/EcDefinition";
import { EcResponse } from "./EcResponse";
import NetworkConfiguration from "./../../NetworkConfiguration";
import NetworkUtils from "./../../NetworkUtils";
import FunctionalResponseCommunicator from "@/business/communication/functional/FunctionalResponseCommunicator";

export default class EcResponseCommunicator implements FunctionalResponseCommunicator<EcCode, EcResponse>{
    private static ecCodeToResponseMap = new Map<EcCode, EcResponse>();
    private static codesProcessed = new Set<EcCode>();
    private static inProgress: Promise<void>;

    public static readonly EC_BATCH_SIZE: number = 100;
    public static readonly EC_ENDPOINT: string = "/private_api/ecnumbers";

    public async process(codes: EcCode[]): Promise<void> {
        if (EcResponseCommunicator.inProgress) {
            await EcResponseCommunicator.inProgress;
        }

        EcResponseCommunicator.inProgress = EcResponseCommunicator.doProcess(codes);
        await EcResponseCommunicator.inProgress;
        EcResponseCommunicator.inProgress = undefined;
    }

    public getResponse(code: EcCode): EcResponse {
        return EcResponseCommunicator.ecCodeToResponseMap.get(code);
    }

    private static async doProcess(codes: EcCode[]): Promise<void> {
        // Cut of the "EC:" prefix, as this is not being used in the API.
        codes = codes.map(c => c.substr(3))
        const toProcess = codes.filter(c => !this.codesProcessed.has(c));

        for (let i = 0; i < toProcess.length; i += this.EC_BATCH_SIZE) {
            const data = JSON.stringify({
                ecnumbers: toProcess.slice(i, i + this.EC_BATCH_SIZE)
            });

            const res = await NetworkUtils.postJSON(NetworkConfiguration.BASE_URL + this.EC_ENDPOINT, data);

            for (const term of res) {
                term.code = "EC:" + term.code;
                if (!this.ecCodeToResponseMap.has(term.code)) {
                    this.ecCodeToResponseMap.set(term.code, term);
                }
            }
        }

        for (const processed of toProcess) {
            this.codesProcessed.add(processed);
        }
    }
}
