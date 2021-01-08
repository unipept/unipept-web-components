import htmlToImage from "html-to-image-no-fonts";
import Canvg, { presets } from "canvg";

export default class PngUtils {
    public static async htmlElementToPngDataUrl(element: HTMLElement): Promise<string> {
        return await htmlToImage.toPng(element);
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
            canvas = new OffscreenCanvas(originalWidth, originalHeight);
        } else {
            const cnvs = document.createElement("canvas");
            cnvs.width = originalWidth;
            cnvs.height = originalHeight;

            cnvs["convertToBlob"] = async() => {
                return new Promise(resolve => {
                    cnvs.toBlob(resolve);
                });
            };
            canvas = cnvs;
        }

        const canvgInstance = await Canvg.fromString(canvas.getContext("2d"), svgString, presets.offscreen());
        canvgInstance.resize(
            canvas.width * scalingFactor,
            canvas.height * scalingFactor
        );

        await canvgInstance.render();

        const blob = await canvas.convertToBlob();
        return URL.createObjectURL(blob);
    }

    public static canvasElementToPngDataUrl(element: HTMLCanvasElement): string {
        return element.toDataURL();
    }
}
