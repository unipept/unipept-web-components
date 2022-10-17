declare const useCsvDownload: () => {
    download: (header: string[], data: string[][], filename: string) => void;
};
export default useCsvDownload;
