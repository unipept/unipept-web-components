import { FunctionalUtils } from "@/components/analysis/functional/FunctionalUtils";
import FunctionalTrust from "@/business/processors/functional/FunctionalTrust";

describe("FunctionalUtils", () => {
    /**
     * Test if the correct string is produced when no annotated items were found.
     */
    it("correctly produces a trust string for no items", () => {
        expect(
            FunctionalUtils.computeTrustLine(
                new FunctionalTrust(0, 100),
                "GO-term",
                "peptide"
            )
        ).toEqual("<strong>No peptide</strong> has a GO-term assigned to it. ");

        // Also test that other kinds are correctly interpolated.
        expect(
            FunctionalUtils.computeTrustLine(
                new FunctionalTrust(0, 100),
                "EC-number",
                "protein"
            )
        ).toEqual("<strong>No protein</strong> has a EC-number assigned to it. ");
    });

    it("correctly produces a trust string for one item", () => {
        expect(
            FunctionalUtils.computeTrustLine(
                new FunctionalTrust(1, 100),
                "GO-term",
                "peptide"
            )
        ).toEqual("Only <strong>one peptide</strong> (1%) has at least one GO-term assigned to it. ");
    });

    it("correctly produces a trust string for multiple items", () => {
        expect(
            FunctionalUtils.computeTrustLine(
                new FunctionalTrust(5, 100),
                "GO-term",
                "peptide"
            )
        ).toEqual("<strong>5 peptides</strong> (5%) have at least one GO-term assigned to them. ");
    });

    it("correctly produces a trust string if all items are annotated", () => {
        expect(
            FunctionalUtils.computeTrustLine(
                new FunctionalTrust(100, 100),
                "GO-term",
                "peptide"
            )
        ).toEqual("<strong>All peptides</strong> have at least one GO-term assigned to them. ");
    });
});
