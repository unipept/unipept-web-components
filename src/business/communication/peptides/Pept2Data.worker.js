self.addEventListener("message", handleEvent);

const PEPTDATA_BATCH_SIZE = 100;
const PEPTDATA_ENDPOINT = "/mpa/pept2data";

async function handleEvent(event){
    let result = await process(event.data.peptides, event.data.config, event.data.baseUrl, setProgress)
    // Value is a mapping between a peptide sequence and the response it received from the Unipept API.
    self.postMessage({ type: "result", value: result });
}

/**
 * Send out a message to the calling process that that the progress has changed.
 * @param {number} value progress in [0,1]
 */
function setProgress(value) {
    // @ts-ignore
    self.postMessage({ type: "progress", value: value });
}

/**
 *
 * @param {Peptide[]} peptides
 * @param {SearchConfiguration} config
 * @param {string} baseUrl
 * @param setProgress
 * @returns {Promise<Map<Peptide, PeptideDataResponse>>}
 */
async function process(peptides, config, baseUrl, setProgress) {
    // Maps each peptide onto the response it received from the Unipept API.
    const responses = new Map();
    setProgress(0.0);

    try {
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

        return responses;
    } catch (err) {
        self.postMessage({ type: "error", value: err });
    }
}

function postJSON(url, data) {
    return fetch(url, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: data,
    }).then(res => res.json());
}

