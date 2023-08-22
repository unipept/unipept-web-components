export default interface PngSource {
    /**
     * Get a valid SVG data URL that contains all SVG data for this image
     */
    toSvgDataUrl(): Promise<string>;
    /**
     * Original width of this PNG source image in pixels (as if scaling factor 1 was to be used).
     */
    getOriginalWidth(): number;
    /**
     * Original height of this PNG source image in pixels (as if scaling factor 1 was to be used).
     */
    getOriginalHeight(): number;
}
