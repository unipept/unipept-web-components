import ecnumbers from "./resources/unipept/ecnumbers.json";
import goterms from "./resources/unipept/goterms.json";
import sampledata from "./resources/unipept/sampledata.json";
import taxa from "./resources/unipept/taxa.json";
import pept2data from "./resources/unipept/pept2data.json";
import interpros from "./resources/unipept/interpros.json";
import proteins from "./resources/unipept/proteins.json";
import { Peptide } from "@/business/ontology/raw/Peptide";
import { ProteinResponse } from "@/business/communication/protein/ProteinResponse";

/**
 * This class is some sort of simple database that can be used to query for specific EC-numbers or GO-terms. This
 * database is not optimized at all and only designed for use with small sets of data in a testing environment.
 *
 * @author Pieter Verschaffelt
 */
export default class UnipeptApiDataSource {
    public getEcNumbersResponse(ecIds: string[]): {code: string, name: string}[] {
        return ecnumbers.filter(ec => ecIds.indexOf(ec.code) !== -1);
    }

    public getGoTermsResponse(goIds: string[]): {code: string, name: string}[] {
        return goterms.filter(go => goIds.indexOf(go.code) !== -1);
    }

    public getPept2DataResponse(peptides: string[]) {
        return pept2data.peptides.filter(p => peptides.indexOf(p.sequence) !== -1);
    }

    public getSampleData() {
        return sampledata;
    }

    public getTaxa(ncbiIds: number[]): {id: number, name: string, rank: string, lineage: number[]}[] {
        return (taxa as {id: number, name: string, rank: string, lineage: number[]}[]).filter(t => ncbiIds.indexOf(t.id) !== -1);
    }

    public getInterproEntriesResponse(interproIds: string[]): {code: string, category: string, name: string}[] {
        return (interpros as {code: string, category: string, name: string}[]).filter(ipr => interproIds.indexOf(ipr.code) !== -1);
    }

    public getProteins(peptide: Peptide): ProteinResponse {
        const result = (proteins as unknown as { peptide: Peptide, result: ProteinResponse }[]).find(p => p.peptide === peptide);
        if (result) {
            return result.result;
        } else {
            return undefined;
        }
    }
}
