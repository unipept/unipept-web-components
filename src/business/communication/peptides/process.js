import { Observable } from "observable-fns"

const PEPTDATA_BATCH_SIZE = 100;
const PEPTDATA_ENDPOINT = "/mpa/pept2data";

/**
 * @param {Peptide[]} peptides
 * @param {SearchConfiguration} config
 * @param {string} baseUrl
 * @returns {Promise<Map<Peptide, PeptideDataResponse>>}
 */
export default function process(peptides, config, baseUrl) {
    return new Observable(async(observer) => {
        try {
            // Maps each peptide onto the response it received from the Unipept API.
            const responses = new Map();

            observer.next({
                type: "progress",
                value: 0.0
            });

            for (let i = 0; i < peptides.length; i += PEPTDATA_BATCH_SIZE) {
                const data = JSON.stringify({
                    peptides: peptides.slice(i, i + PEPTDATA_BATCH_SIZE),
                    equate_il: config.equateIl,
                    missed: config.enableMissingCleavageHandling
                });

                const res = await postJSON(baseUrl + PEPTDATA_ENDPOINT, data);

                res.peptides.forEach(p => {
                    responses.set(p.sequence, p);
                })

                observer.next({
                    type: "progress",
                    value: (i + PEPTDATA_BATCH_SIZE) / peptides.length
                });
            }

            observer.next({
                type: "progress",
                value: 1
            });

            observer.next({
                type: "result",
                value: responses
            });
            observer.complete();
        } catch (err) {
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
        throw "Network request failed: " + result.error();
    }

    return result.json();
}
