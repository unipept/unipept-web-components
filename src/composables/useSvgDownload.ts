const useSvgDownload = () => {
    const download = (svg: SVGElement, filename: string) => {
        const svgBlob = new Blob([svg.outerHTML], {type:"image/svg+xml;charset=utf-8"});
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = filename;
        downloadLink.click();
    };
    
    return { download };
}

export default useSvgDownload;
