import StringUtils from "@/business/misc/StringUtils";

describe("StringUtils", () => {
    it("correctly performs string titleize", () => {
        const result = StringUtils.stringTitleize("this is a test.");
        expect(result).toEqual("This Is A Test.");
    });

    it("correctly converts a number to a percentage string", () => {
        const result = StringUtils.numberToPercent(0.234781, 3);
        expect(result).toEqual("23.478%");
    });
});
