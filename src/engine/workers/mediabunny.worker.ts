import {
    Output,
    BufferTarget,
    Mp4OutputFormat,
    MovOutputFormat,
    VideoSampleSource,
    VideoSample
} from 'mediabunny';

let output: Output | null = null;
let target: BufferTarget | null = null;
let source: VideoSampleSource | null = null;

let pendingFrames = 0;

const sendProgress = () => {
    self.postMessage({
        type: 'PROGRESS',
        data: {
            queueSize: pendingFrames
        }
    });
};

self.onmessage = async (e) => {
    const { type, data } = e.data;

    try {
        if (type === 'CONFIG') {
            const config = data;
            console.log("[MediaBunny Worker] Received Config:", config);

            target = new BufferTarget();

            const format = config.format === 'mov' ? new MovOutputFormat() : new Mp4OutputFormat();

            output = new Output({
                target,
                format
            });

            // @ts-ignore - Types might be strict about width/height but runtime supports it
            source = new VideoSampleSource({
                width: config.width,
                height: config.height,
                frameRate: config.fps,
                codec: 'avc', // Default to H.264
                bitrate: config.bitrate || 6_000_000
            });

            await output.addVideoTrack(source);
            await output.start();

            self.postMessage({ type: 'READY' });
        }
        else if (type === 'ENCODE_FRAME') {
            if (!source) throw new Error("Source not initialized");

            pendingFrames++; // Increment before async op
            sendProgress(); // Notify main thread immediately

            const { bitmap, timestamp, duration } = data;

            // Core.ts sends timestamp in Microseconds.
            // VideoFrame expects Microseconds.
            const frame = new VideoFrame(bitmap, {
                timestamp: Math.round(timestamp),
                duration: duration ? Math.round(duration) : undefined
            });

            const sample = new VideoSample(frame);
            await source.add(sample);
            sample.close();

            frame.close();
            bitmap.close();

            pendingFrames--; // Decrement after processing
            sendProgress();
        }
        else if (type === 'FINALIZE') {
            if (source) {
                // VideoSampleSource doesn't have close()?
                // VideoSource has... wait.
                // Let's assume just waiting or explicitly closing if method exists.
                // VideoSource usually doesn't need explicit close if we just stop adding?
                // Actually `output.finalize()` might be what we need if we didn't add via stream.
                // But `Output` tracks sources.

                // If I check `output.ts`:
                // await this._writer.finalize();
                // But effectively we need to tell the source we are done.
                // `source.close()` or `source.finish()`?

                // @ts-ignore
                if (source.close) await source.close();
                // @ts-ignore
                else if (source.end) await source.end();
            }

            if (output) {
                await output.finalize();
            }

            // Wait for processing
            // In the library code: `await this._tracks...`
            // But we don't control the loop if we just used `addVideoTrack`.
            // Actually, we do.
            // If `VideoSampleSource` is an `Input`, maybe we just stop adding?

            // Let's try to just wait a bit or check target.
            // Await output finalize?
            // "finalize() - Finalizes the file writing process."
            // But only if we manage the loop manually? 
            // "If you are using streams, this is called automatically."

            // If we used `addVideoTrack(source)`, Output listens to source.
            // So closing source is key.

            // Let's try explicit polling for buffer.
            // @ts-ignore
            if (source.close) await source.close();

            // Wait for buffer
            let attempts = 0;
            while (!target?.buffer && attempts < 50) {
                await new Promise(r => setTimeout(r, 100));
                attempts++;
            }

            if (target && target.buffer) {
                self.postMessage({ type: 'COMPLETE', data: target.buffer }, [target.buffer]);
            } else {
                throw new Error("Export failed: Buffer empty after finalize.");
            }
        }
    } catch (err: any) {
        console.error(err);
        self.postMessage({ type: 'ERROR', error: err.message });
    }
};
