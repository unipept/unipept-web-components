import { toPng } from "html-to-image";
import Canvg, { presets } from "canvg";

export default class PngUtils {
    public static async htmlElementToPngDataUrl(element: HTMLElement, scalingFactor: number): Promise<string> {
        return await toPng(element, { pixelRatio: scalingFactor });
    }

    public static async svgElementToPngDataUrl(element: SVGElement, scalingFactor: number): Promise<string> {
        return PngUtils.svgStringToPngDataUrl(
            element.outerHTML,
            element.clientWidth,
            element.clientHeight,
            scalingFactor
        );
    }

    public static async svgStringToPngDataUrl(
        svgString: string,
        originalWidth: number,
        originalHeight: number,
        scalingFactor: number
    ): Promise<string> {
        let canvas;

        if (window.OffscreenCanvas) {
            canvas = new OffscreenCanvas(originalWidth * scalingFactor, originalHeight * scalingFactor);
        } else {
            const cnvs = document.createElement("canvas");
            cnvs.width = originalWidth * scalingFactor;
            cnvs.height = originalHeight * scalingFactor;

            cnvs["convertToBlob"] = async() => {
                return new Promise(resolve => {
                    cnvs.toBlob(resolve);
                });
            };
            canvas = cnvs;
        }

        // Apparently we need to modify the SVG-file itself to make sure that the PNG is rendered at the requested
        // scaling factor.
        svgString = svgString
            .replace(/width="[0-9]*%?"/, `width="${originalWidth * scalingFactor}"`)
            .replace(/height="[0-9]*%?"/, `height="${originalHeight * scalingFactor}"`)
            .replace(/viewBox="[^"]*"/, "")
            .replace("svg", `svg viewBox="0 0 ${originalWidth} ${originalHeight}"`);

        const canvgInstance = await Canvg.fromString(canvas.getContext("2d"), svgString, presets.offscreen());

        await canvgInstance.render();

        const blob = await canvas.convertToBlob();
        return URL.createObjectURL(blob);
    }

    public static canvasElementToPngDataUrl(element: HTMLCanvasElement): string {
        return element.toDataURL();
    }
}
