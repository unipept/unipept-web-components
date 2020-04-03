import { InterproCode } from "./../../../ontology/functional/interpro/InterproDefinition";
import InterproResponse from "./InterproResponse";
import NetworkUtils from "./../../NetworkUtils";
import NetworkConfiguration from "./../../NetworkConfiguration";
import FunctionalResponseCommunicator from "@/business/communication/functional/FunctionalResponseCommunicator";

export default class InterproResponseCommunicator implements FunctionalResponseCommunicator<InterproCode, InterproResponse>{
    private static interproCodeToResponseMap = new Map<InterproCode, InterproResponse>();
    private static codesProcessed = new Set<InterproCode>();
    private static inProgress: Promise<void>;

    public static readonly INTERPRO_BATCH_SIZE: number = 100;
    public static readonly INTERPRO_ENDPOINT: string = "/private_api/interpros";

    public async process(codes: InterproCode[]): Promise<void> {
        if (InterproResponseCommunicator.inProgress) {
            await InterproResponseCommunicator.inProgress;
        }

        InterproResponseCommunicator.inProgress = InterproResponseCommunicator.doProcess(codes);
        await InterproResponseCommunicator.inProgress;
        InterproResponseCommunicator.inProgress = undefined;
    }

    public getResponse(code: InterproCode): InterproResponse | undefined {
        return InterproResponseCommunicator.interproCodeToResponseMap.get(code);
    }

    private static async doProcess(codes: InterproCode[]): Promise<void> {
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
}
