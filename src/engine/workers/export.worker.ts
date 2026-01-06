import { Muxer, ArrayBufferTarget } from 'webm-muxer';

// Worker state
let muxer: Muxer<ArrayBufferTarget> | null = null;
let videoEncoder: VideoEncoder | null = null;
let config: any = null;

const sendProgress = () => {
    if (!videoEncoder) return;
    self.postMessage({
        type: 'PROGRESS',
        data: {
            queueSize: videoEncoder.encodeQueueSize
        }
    });
};

self.onmessage = async (e) => {
    const { type, data } = e.data;

    try {
        if (type === 'CONFIG') {
            config = data; // { width, height, fps, bitrate, duration? }
            console.log("[Worker] Received Config:", config);

            const muxerOptions: any = {
                target: new ArrayBufferTarget(),
                video: {
                    codec: 'V_VP9',
                    width: config.width,
                    height: config.height,
                    frameRate: config.fps
                }
            };

            if (config.duration) {
                muxerOptions.duration = Math.round(config.duration);
                console.log("[Worker] Setting Muxer Duration:", muxerOptions.duration);
            }

            muxer = new Muxer(muxerOptions);

            // ... (rest of simple setup) ...


            let chunkCount = 0;
            videoEncoder = new VideoEncoder({
                output: (chunk, meta) => {
                    // Fix: VideoEncoder produces microseconds, WebM expects milliseconds by default
                    // Divide by 1000 and ROUND to integer to avoid potential float issues in SimpleBlock
                    // Also ensure it's not negative (just in case)
                    const msTimestamp = Math.max(0, Math.round(chunk.timestamp / 1000));

                    if (chunkCount < 5) {
                        console.log(`[Worker] Chunk ${chunkCount}: Raw=${chunk.timestamp}us, Scaled=${msTimestamp}ms`);
                    }
                    chunkCount++;

                    muxer?.addVideoChunk(chunk, meta, msTimestamp);

                    sendProgress(); // Notify queue drain
                },
                error: (e) => {
                    console.error("Encoder Error:", e);
                    self.postMessage({ type: 'ERROR', error: e.message });
                }
            });

            videoEncoder.configure({
                codec: 'vp09.00.51.08', // Level 5.1 (supports up to 4K/60fps)
                width: config.width,
                height: config.height,
                bitrate: config.bitrate || 5_000_000,
                // Duration is optional but good for metadata (in microseconds)
                ...(config.duration ? { latencyMode: 'quality' } : {})
            });

            self.postMessage({ type: 'READY' });
        }
        else if (type === 'ENCODE_FRAME') {
            // data: { bitmap, timestamp, keyFrame, duration? }
            const { bitmap, timestamp, keyFrame, duration } = data;

            if (!videoEncoder || !muxer) {
                throw new Error("Encoder not initialized");
            }

            const frame = new VideoFrame(bitmap, {
                timestamp: Math.round(timestamp),
                duration: duration ? Math.round(duration) : undefined
            });

            // Encode
            videoEncoder.encode(frame, { keyFrame });
            frame.close();
            bitmap.close(); // Clean up Transferable

            sendProgress(); // Notify queue add
        }
        else if (type === 'FINALIZE') {
            if (!videoEncoder || !muxer) {
                console.error("[Worker] Finalize called but encoder/muxer not initialized");
                return;
            }

            console.log("[Worker] Flushing Encoder...");
            await videoEncoder.flush();
            console.log("[Worker] Encoder Flushed.");

            // Note: In webm-muxer v5, muxer.target.buffer is null until finalize() is called.
            // Do NOT access it before finalize.

            muxer.finalize();

            // Now buffer should be available
            if (!muxer.target || !muxer.target.buffer) {
                throw new Error("Muxer target buffer is missing after finalize");
            }

            const buffer = muxer.target.buffer;
            console.log(`[Worker] Post-Finalize Buffer Size: ${buffer.byteLength}`);

            // Transfer buffer back
            // @ts-ignore
            self.postMessage({ type: 'COMPLETE', data: buffer }, [buffer]);

            // Cleanup
            videoEncoder = null;
            muxer = null;
        }
    } catch (err: any) {
        console.error("[Worker] Error:", err);
        self.postMessage({ type: 'ERROR', error: err.message || "Unknown Worker Error" });
    }
};
