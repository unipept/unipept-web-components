import SearchConfiguration from "@/business/configuration/SearchConfiguration";

/**
 * This is a mock implementation of the worker interface that performs all computations on the main thread. This class
 * is only to be used for unit testing purposes.
 *
 * @author Pieter Verschaffelt
 */
export default class Worker {
    public async postMessage(event: { peptides: string[], config: SearchConfiguration, baseUrl: string}) {
        let result = await process( event.peptides, event.config, event.baseUrl, (val) => this.setProgress(val) );
        this.onmessage({
            data: {
                type: "result",
                value: result
            }
        });
    }

    public setProgress(value) {
        this.onmessage({
            data: {
                type: "progress",
                value: value
            }
        })
    }

    public onmessage(event): void {
        // Must be implemented by worker consumer by overriding this function
    }
}

const PEPTDATA_BATCH_SIZE = 100;
const PEPTDATA_ENDPOINT = "/mpa/pept2data";

async function process(peptides, config, baseUrl, setProgress) {
    // Maps each peptide onto the response it received from the Unipept API.
    const responses = new Map();

    setProgress(0.0);
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

        setProgress((i + PEPTDATA_BATCH_SIZE) / peptides.length);
    }

    setProgress(1);
    return responses;
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

    return await result.json();
}
