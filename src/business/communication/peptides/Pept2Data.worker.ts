import { expose, Transfer } from "threads";
import { Observable } from "observable-fns"
import { Peptide } from "./../../ontology/raw/Peptide";
import SearchConfiguration from "./../../configuration/SearchConfiguration";
import parallelLimit from "async/parallelLimit";
import { ShareableMap } from "shared-memory-datastructures";

const PEPTDATA_BATCH_SIZE = 100;
const PEPTDATA_ENDPOINT = "/mpa/pept2data";
const PARALLEL_REQUESTS = 5;

expose(process)

export default function process(peptides: Peptide[], config: SearchConfiguration, baseUrl: string): Observable<{ type: string, value: any }> {
    // @ts-ignore
    return new Observable(async(observer) => {
        try {
            // Maps each peptide onto the response it received from the Unipept API.
            const responses = new ShareableMap<string, string>();

            observer.next({
                type: "progress",
                value: 0.0
            });

            const requests = [];

            for (let i = 0; i < peptides.length; i += PEPTDATA_BATCH_SIZE) {
                requests.push(async(done) => {
                    const data = JSON.stringify({
                        peptides: peptides.slice(i, i + PEPTDATA_BATCH_SIZE),
                        equate_il: config.equateIl,
                        missed: config.enableMissingCleavageHandling
                    });

                    try {
                        const res = await postJSON(baseUrl + PEPTDATA_ENDPOINT, data)

                        res.peptides.forEach(p => {
                            responses.set(p.sequence, JSON.stringify(p));
                        })

                        observer.next({
                            type: "progress",
                            value: i / peptides.length
                        });

                        done(null);
                    } catch (err) {
                        console.log(err);
                        // Fetch errors need to be handled by the outer scope.
                        done(err);
                    }
                });
            }

            await parallelLimit(requests, PARALLEL_REQUESTS);

            observer.next({
                type: "progress",
                value: 1
            });

            const buffers = responses.getBuffers();

            observer.next({
                type: "result",
                value: [Transfer(buffers[0]), Transfer(buffers[1])]
            });

            observer.complete();
        } catch (err) {
            console.log(err);
            observer.next({
                type: "error",
                value: "Could not communicate with external endpoint."
            })
        }
    });
}

async function postJSON(url, data) {
    const result = await fetch(url, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: data,
    });

    if (!result.ok) {
        throw "Network request failed.";
    }

    return result.json();
}

