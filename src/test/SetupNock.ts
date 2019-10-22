import nock from "nock";
import pept2data from "./resources/pept2data.json";

const fs = require("fs");

export default function setupNock() {
    // let pept2data = fs.readFileSync("./resources/pept2data.json");

    const scope = nock("http://localhost:3000")
        .post("/mpa/pept2data")
        .reply(200, pept2data);
}
