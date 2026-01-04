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
            config = data; // { width, height, fps, bitrate }

            muxer = new Muxer({
                target: new ArrayBufferTarget(),
                video: {
                    codec: 'V_VP9',
                    width: config.width,
                    height: config.height,
                    frameRate: config.fps
                }
            });

            videoEncoder = new VideoEncoder({
                output: (chunk, meta) => {
                    // Fix: VideoEncoder produces microseconds, WebM expects milliseconds by default
                    // Divide by 1000 to correct the timescale
                    muxer?.addVideoChunk(chunk, meta, chunk.timestamp / 1000);

                    sendProgress(); // Notify queue drain
                },
                error: (e) => {
                    console.error("Encoder Error:", e);
                    self.postMessage({ type: 'ERROR', error: e.message });
                }
            });

            videoEncoder.configure({
                codec: 'vp09.00.10.08',
                width: config.width,
                height: config.height,
                bitrate: config.bitrate || 5_000_000
            });

            self.postMessage({ type: 'READY' });
        }
        else if (type === 'ENCODE_FRAME') {
            // data: { list: [bitmap, timestamp, duration], currentFrameIndex, totalFrames }
            const { bitmap, timestamp, keyFrame } = data;

            if (!videoEncoder || !muxer) {
                throw new Error("Encoder not initialized");
            }

            const frame = new VideoFrame(bitmap, { timestamp });

            // Encode
            videoEncoder.encode(frame, { keyFrame });
            frame.close();
            bitmap.close(); // Clean up Transferable

            sendProgress(); // Notify queue add
        }
        else if (type === 'FINALIZE') {
            if (!videoEncoder || !muxer) return;

            await videoEncoder.flush();
            muxer.finalize();

            const { buffer } = muxer.target;

            // Transfer buffer back
            self.postMessage({ type: 'COMPLETE', data: buffer }, [buffer]);

            // Cleanup
            videoEncoder = null;
            muxer = null;
        }
    } catch (err: any) {
        self.postMessage({ type: 'ERROR', error: err.message });
    }
};
