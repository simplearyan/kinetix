export class BrowserDetector {
    static isChromium(): boolean {
        // Simple check for Chrome/Edge/Brave engine
        // @ts-ignore
        const isChromium = !!window.chrome;
        const userAgent = navigator.userAgent.toLowerCase();

        // Firefox explicitly identifies itself
        const isFirefox = userAgent.indexOf('firefox') > -1;

        // Safari check (tricky because Chrome on iOS claims to be Safari, but we target Desktop mainly)
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        return isChromium && !isFirefox && !isSafari;
    }

    static getBrowserName(): string {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.indexOf('firefox') > -1) return "Firefox";
        if (ua.indexOf('edg') > -1) return "Edge"; // Edge is Chromium but good to know
        if (ua.indexOf('opr') > -1) return "Opera";
        if (ua.indexOf('chrome') > -1) return "Chrome";
        if (ua.indexOf('safari') > -1) return "Safari";
        return "Unknown";
    }
}
