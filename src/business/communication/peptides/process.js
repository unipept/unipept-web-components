const PEPTDATA_BATCH_SIZE = 100;
const PEPTDATA_ENDPOINT = "/mpa/pept2data";

/**
 * @param {Peptide[]} peptides
 * @param {SearchConfiguration} config
 * @param {string} baseUrl
 * @param setProgress
 * @returns {Promise<Map<Peptide, PeptideDataResponse>>}
 */
export default async function process(peptides, config, baseUrl, setProgress) {
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

    if (!result.ok) {
        throw "Network request failed: " + result.error();
    }

    return result.json();
}
