import EcCode from "../../../../logic/ontology/functional/ec/EcCode";
import NetworkUtils from "../../NetworkUtils";
import FunctionalResponseCommunicator from "../FunctionalResponseCommunicator";
import EcResponse from "./EcResponse";

export default class EcResponseCommunicator implements FunctionalResponseCommunicator<EcCode, EcResponse>{
    private static ecCodeToResponseMap = new Map<EcCode, EcResponse>();
    private static codesProcessed = new Set<EcCode>();
    private static inProgress: Promise<void> | undefined;

    // TODO: create environment
    public static readonly EC_ENDPOINT: string = "/private_api/ecnumbers";

    public static apiBaseUrl: string = "http://api.unipept.ugent.be";
    public static batchSize: number = 100;

    public static setup(apiBaseUrl: string, batchSize: number) {
        this.apiBaseUrl = apiBaseUrl;
        this.batchSize = batchSize;
    }

    public async process(codes: EcCode[]): Promise<void> {
        while (EcResponseCommunicator.inProgress) {
            await EcResponseCommunicator.inProgress;
        }

        EcResponseCommunicator.inProgress = EcResponseCommunicator.doProcess(codes);

        try {
            await EcResponseCommunicator.inProgress;
        } finally {
            EcResponseCommunicator.inProgress = undefined;
        }
    }

    public getResponse(code: EcCode): EcResponse | undefined {
        return EcResponseCommunicator.ecCodeToResponseMap.get(code);
    }

    private static async doProcess(codes: EcCode[]): Promise<void> {
        // Cut of the "EC:" prefix, as this is not being used in the API.
        codes = codes.map(c => c.substring(3))
        const toProcess = codes.filter(c => !this.codesProcessed.has(c));

        for (let i = 0; i < toProcess.length; i += this.batchSize) {
            const data = JSON.stringify({
                ecnumbers: toProcess.slice(i, i + this.batchSize)
            });

            const res = await NetworkUtils.postJSON(this.apiBaseUrl + this.EC_ENDPOINT, data);

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
