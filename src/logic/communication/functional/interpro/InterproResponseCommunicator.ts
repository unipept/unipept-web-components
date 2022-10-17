import InterproCode from "../../../../logic/ontology/functional/interpro/InterproCode";
import NetworkUtils from "../../NetworkUtils";
import FunctionalResponseCommunicator from "../FunctionalResponseCommunicator";
import InterproResponse from "./InterproResponse";

export default class InterproResponseCommunicator implements FunctionalResponseCommunicator<InterproCode, InterproResponse>{
    private static interproCodeToResponseMap = new Map<InterproCode, InterproResponse>();
    private static codesProcessed = new Set<InterproCode>();
    private static inProgress: Promise<void> | undefined;

    public static readonly INTERPRO_ENDPOINT: string = "/private_api/interpros";

    public static apiBaseUrl: string = "http://api.unipept.ugent.be";
    public static batchSize: number = 100;

    public static setup(apiBaseUrl: string, batchSize: number) {
        this.apiBaseUrl = apiBaseUrl;
        this.batchSize = batchSize;
    }

    public async process(codes: InterproCode[]): Promise<void> {
        while (InterproResponseCommunicator.inProgress) {
            await InterproResponseCommunicator.inProgress;
        }

        InterproResponseCommunicator.inProgress = InterproResponseCommunicator.doProcess(codes);

        try {
            await InterproResponseCommunicator.inProgress;
        } finally {
            InterproResponseCommunicator.inProgress = undefined;
        }
    }

    public getResponse(code: InterproCode): InterproResponse | undefined {
        return InterproResponseCommunicator.interproCodeToResponseMap.get(code);
    }

    public getResponseMap(): Map<InterproCode, InterproResponse> {
        return InterproResponseCommunicator.interproCodeToResponseMap;
    }

    private static async doProcess(codes: InterproCode[]): Promise<void> {
        codes = codes.map(c => c.substring(4));
        const toProcess = codes.filter(c => !this.codesProcessed.has(c));

        for (let i = 0; i < toProcess.length; i += this.batchSize) {
            const data = JSON.stringify({
                interpros: toProcess.slice(i, i + this.batchSize)
            });

            const res = await NetworkUtils.postJSON(this.apiBaseUrl + this.INTERPRO_ENDPOINT, data);

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
