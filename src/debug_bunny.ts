import { VideoSampleSource } from 'mediabunny';

console.log("Testing VideoSampleSource with bitrate...");
try {
    // @ts-ignore
    const s = new VideoSampleSource({ width: 100, height: 100, codec: 'avc', bitrate: 1000000 });
    console.log("Success! Instance created.");
} catch (e: any) {
    console.log("Error:", e.message);
}
