import { Canvg, presets } from "canvg";
import ImageSource from "./ImageSource";

export default class SvgImageSource implements ImageSource {
    constructor(
        private svgString: string
    ) {}

    public getOriginalHeight(): number {
        return Number.parseInt(
            this.svgString.match(/<svg[^>]*height="[0-9]*"/)![0].replace(/.*height="([0-9]*)".*/, "$1")
        );
    }

    public getOriginalWidth(): number {
        return Number.parseInt(
            this.svgString.match(/<svg[^>]*width="[0-9]*"/)![0].replace(/.*width="([0-9]*)".*/, "$1")
        );
    }

    public async toPngDataUrl(scaling: number): Promise<string> {
        const originalWidth = this.getOriginalWidth();
        const originalHeight = this.getOriginalHeight();

        let canvas;

        if (window.OffscreenCanvas) {
            canvas = new OffscreenCanvas(originalWidth * scaling, originalHeight * scaling);
        } else {
            const cnvs: any = document.createElement("canvas");
            cnvs.width = originalWidth * scaling;
            cnvs.height = originalHeight * scaling;

            cnvs["convertToBlob"] = async() => {
                return new Promise(resolve => {
                    cnvs.toBlob(resolve);
                });
            };
            canvas = cnvs;
        }

        // Apparently we need to modify the SVG-file itself to make sure that the PNG is rendered at the requested
        // scaling factor.
        const svgString = this.svgString
            .replace(/width="[0-9]*%?"/, `width="${originalWidth * scaling}"`)
            .replace(/height="[0-9]*%?"/, `height="${originalHeight * scaling}"`)
            .replace(/viewBox="[^"]*"/, "")
            .replace("svg", `svg viewBox="0 0 ${originalWidth} ${originalHeight}"`);

        const canvgInstance = await Canvg.fromString(canvas.getContext("2d"), svgString, presets.offscreen());

        await canvgInstance.render();

        const blob = await canvas.convertToBlob();
        return URL.createObjectURL(blob);
    }

    public async toSvgDataUrl(): Promise<string> {
        return `data:image/svg+xml,${encodeURIComponent(this.svgString)}`;
    }
}
