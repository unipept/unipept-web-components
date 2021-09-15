import { CommunicationSource } from "@/business";

export default interface AnalysisSource {
    /**
     * Constructs a new communication source that can be used to query this analysis source.
     */
    getCommunicationSource(): CommunicationSource;

    /**
     * This function computes a unique hash for all the current properties of this analysis source. It then uses the
     * given hash to check if it equals the hash that was computed. If these are equal, the underlying properties of
     * the analysis source did not change and all previously computed analyses with this source are still valid. If
     * both hashes are not equal, this means that something in the source data did change and that previously computed
     * analyses are no longer valid.
     *
     * @param hash A unique hash value that should be compared to a hash that will be computed from the current
     * properties of this analysis source.
     */
    verifyEquality(hash: string): Promise<boolean>;

    /**
     * Computes a fingerprint string that will uniquely identify this AnalysisSource and all other sources that are
     * completely compatible with this source's settings and properties (e.g. database type and version is the same,
     * source type is the same, etc).
     */
    computeFingerprint(): Promise<string>;
}
