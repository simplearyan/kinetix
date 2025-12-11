export interface VideoRecorderOptions {
    mimeType?: string;
    fps?: number;
    videoBitsPerSecond?: number;
}

export class VideoRecorder {
    private mediaRecorder: MediaRecorder | null = null;
    private recordedChunks: Blob[] = [];
    private canvas: HTMLCanvasElement;
    private options: VideoRecorderOptions;

    constructor(canvas: HTMLCanvasElement, options: VideoRecorderOptions = {}) {
        this.canvas = canvas;
        this.options = {
            mimeType: 'video/webm; codecs=vp9',
            fps: 30, // Standard web FPS
            videoBitsPerSecond: 8000000, // 8 Mbps for high quality
            ...options
        };
    }

    static getSupportedMimeType(): string {
        const types = [
            'video/webm; codecs=vp9',
            'video/webm; codecs=vp8',
            'video/webm',
            'video/mp4'
        ];
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }
        return '';
    }

    start() {
        this.recordedChunks = [];
        const mimeType = this.options.mimeType || VideoRecorder.getSupportedMimeType();

        if (!mimeType) {
            throw new Error('No supported video mime type found.');
        }

        console.log(`Using MIME type: ${mimeType}`);

        try {
            const stream = this.canvas.captureStream(this.options.fps);
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: mimeType,
                videoBitsPerSecond: this.options.videoBitsPerSecond
            });

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.start();
            console.log('Recording started');
        } catch (err) {
            console.error('Error starting MediaRecorder:', err);
            throw err;
        }
    }

    stop(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
                return reject(new Error('Recorder is not active.'));
            }

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, {
                    type: this.mediaRecorder?.mimeType || 'video/webm'
                });
                const url = URL.createObjectURL(blob);
                resolve(url);
            };

            this.mediaRecorder.stop();
            console.log('Recording stopped');
        });
    }

    get isRecording(): boolean {
        return this.mediaRecorder?.state === 'recording';
    }
}
