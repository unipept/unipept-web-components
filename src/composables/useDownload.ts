const useDownload = () => {
    const download = (dataUrl: string, filename: string) => {
        const downloadLink = document.createElement("a");
        downloadLink.href = dataUrl;
        downloadLink.download = filename;
        downloadLink.click();
    };
    
    return { download };
}

export default useDownload;
