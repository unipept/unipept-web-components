export default interface PngSource {
    /**
     * Get a valid PNG data URL that contains all PNG data for this image, enlarged with the required scaling factor.
     *
     * @param scaling Positive floating point value that indicates how much the image should be enlarged (both
     * dimensions of the image are enlarged by this value).
     */
    toPngDataUrl(scaling: number): Promise<string>;

    /**
     * Original width of this PNG source image in pixels (as if scaling factor 1 was to be used).
     */
    getOriginalWidth(): number;

    /**
     * Original height of this PNG source image in pixels (as if scaling factor 1 was to be used).
     */
    getOriginalHeight(): number;
}
