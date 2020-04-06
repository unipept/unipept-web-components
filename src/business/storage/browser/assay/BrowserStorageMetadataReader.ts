import { BrowserStorageConsts } from "./BrowserStorageConsts";
import ProteomicsAssay from "./../../../entities/assay/ProteomicsAssay";
import BrowserAssayVisitor from "./BrowserAssayVisitor";

export default class BrowserStorageMetadataReader extends BrowserAssayVisitor {
    async visitProteomicsAssay(assay: ProteomicsAssay): Promise<void> {
        const serializedMetadata = this.browserStorage.getItem(
            BrowserStorageConsts.MPA_METADATA_PREFIX + assay.getId()
        );

        const parsedMeta = JSON.parse(serializedMetadata);

        assay.setName(parsedMeta.name);

        const splitDate = parsedMeta.date.split("/");
        assay.setDate(new Date(splitDate[2], splitDate[1], splitDate[0]));
        assay.setAmountOfPeptides(parsedMeta.amount);
    }
}
