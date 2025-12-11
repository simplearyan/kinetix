import { toPng, toSvg } from 'html-to-image';
import download from 'downloadjs';

export const Exporter = {
    async exportImage(nodeId: string, format: 'png' | 'svg' = 'png', bgColor?: string) {
        const node = document.getElementById(nodeId);
        if (!node) {
            console.error(`Node with id ${nodeId} not found`);
            return;
        }

        const filter = (node: HTMLElement) => {
            const exclusionClasses = ['exclude-from-export'];
            const isExcludedClass = exclusionClasses.some((classname) => node.classList?.contains(classname));

            // Exclude external stylesheets that cause CORS/SecurityErrors
            const isExternalStylesheet = node.tagName === 'LINK' &&
                (node as HTMLLinkElement).rel === 'stylesheet' &&
                (node as HTMLLinkElement).href.includes('fonts.googleapis.com');

            return !isExcludedClass && !isExternalStylesheet;
        };

        const options = {
            filter,
            backgroundColor: bgColor || 'transparent',
            skipFonts: true, // Bypass font embedding to avoid SecurityErrors with external fonts
        };

        try {
            if (format === 'svg') {
                const dataUrl = await toSvg(node, options);
                download(dataUrl, `kinetix-export.svg`);
            } else {
                const dataUrl = await toPng(node, options);
                download(dataUrl, `kinetix-export.png`);
            }
        } catch (error) {
            console.error('Export failed:', error);
        }
    }
};
