import PngSource from "@/business/image/PngSource";
import SvgUtils from "@/business/image/SvgUtils";
import PngUtils from "@/business/image/PngUtils";

export default class SvgStringToPngSource implements PngSource {
    constructor(private svgString: string) {}

    public getOriginalHeight(): number {
        return Number.parseInt(
            this.svgString.match(
                /<svg[^>]*height="[0-9]*"/)[0].replace(/.*height="([0-9]*)".*/,
                "$1"
            )
        );
    }

    public getOriginalWidth(): number {
        return Number.parseInt(
            this.svgString.match(
                /<svg[^>]*width="[0-9]*"/)[0].replace(/.*width="([0-9]*)".*/,
                "$1"
            )
        );
    }

    public toDataUrl(scaling: number): Promise<string> {
        console.log(this.getOriginalHeight());
        console.log(this.getOriginalWidth());
        return PngUtils.svgStringToPngDataUrl(
            this.svgString,
            this.getOriginalWidth(),
            this.getOriginalHeight(),
            scaling
        );
    }
}
