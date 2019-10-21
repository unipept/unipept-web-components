import nock from "nock";
const fs = require('fs');

let pept2data = fs.readFileSync("./resources/pept2data.json");

const scope = nock('http://localhost:3000')
  .post('pept2data')
  .reply(200, JSON.parse(pept2data));
