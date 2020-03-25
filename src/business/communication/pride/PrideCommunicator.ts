import ProteomicsAssay from "./../../entities/assay/ProteomicsAssay";
import ProgressListener from "./../../progress/ProgressListener";
import NetworkUtils from "./../NetworkUtils";
import { Peptide } from "./../../ontology/raw/Peptide";

export default class PrideCommunicator {
    public static readonly PRIDE_BATCH_SIZE: number = 1000;
    public static readonly PRIDE_COUNT_ENDPOINT: string = "https://www.ebi.ac.uk/pride/ws/archive/peptide/count/assay/";
    public static readonly PRIDE_LIST_ENDPOINT: string = "https://www.ebi.ac.uk/pride/ws/archive/peptide/list/assay/";

    public static async getPeptidesByPrideId(id: number, progressListener?: ProgressListener): Promise<Peptide[]> {
        if (progressListener) {
            progressListener.onProgressUpdate(0);
        }

        let peptides: string[] = [];
        const datasetSize: number = await NetworkUtils.get(this.PRIDE_COUNT_ENDPOINT + id);

        const urls: string[] = [];
        let page: number;

        for (page = 0; page * this.PRIDE_BATCH_SIZE < datasetSize; page++) {
            urls.push("https://www.ebi.ac.uk/pride/ws/archive/peptide/list/assay/" + id + "?show=" + this.PRIDE_BATCH_SIZE + "&page=" + page);
        }

        page = 0;
        await urls.map(NetworkUtils.getJSON).reduce(
            function(sequence: Promise<void>, batchPromise) {
                return sequence.then(function() {
                    return batchPromise;
                }).then(function(response: any) {
                    page++;

                    if (progressListener) {
                        progressListener.onProgressUpdate((10 + (90 * page * this.PRIDE_BATCH_SIZE) / datasetSize) / 100);
                    }
                    peptides = peptides.concat(response.list.map(function(d) {
                        return d.sequence;
                    }));
                });
            }, Promise.resolve()
        );

        return peptides;
    }
}
