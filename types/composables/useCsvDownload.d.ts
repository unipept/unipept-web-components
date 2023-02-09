declare const useCsvDownload: () => {
    download: (header: string[], data: string[][], filename: string) => void;
    downloadString: (csvString: string, filename: string) => void;
};
export default useCsvDownload;
