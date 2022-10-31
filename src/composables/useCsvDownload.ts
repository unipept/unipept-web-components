import CsvUtils from "../logic/util/CsvUtils";

const useCsvDownload = () => {
    const download = (header: string[], data: string[][], filename: string) => {
        const csvString = CsvUtils.toCsvString([header].concat(data));
        const csvBlob = new Blob([csvString], {type:"data:text/csv;charset=UTF-8"});
        const csvUrl = URL.createObjectURL(csvBlob);

        const downloadLink = document.createElement("a");
        downloadLink.href = csvUrl;
        downloadLink.download = filename;
        downloadLink.click();
    };

    const downloadString = (csvString: string, filename: string) => {
        const csvBlob = new Blob([csvString], {type:"data:text/csv;charset=UTF-8"});
        const csvUrl = URL.createObjectURL(csvBlob);

        const downloadLink = document.createElement("a");
        downloadLink.href = csvUrl;
        downloadLink.download = filename;
        downloadLink.click();
    };
    
    return { download, downloadString };
}

export default useCsvDownload;
