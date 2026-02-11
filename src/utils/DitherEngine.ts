export type DitherAlgorithm = 'floyd-steinberg' | 'atkinson' | 'bayer';

export interface DitherSettings {
    brightness: number; // -100 to 100
    contrast: number;   // -100 to 100
    levels: number;     // 2 to 16
    algorithm: DitherAlgorithm;
    fgColor: { r: number; g: number; b: number };
    bgColor: { r: number; g: number; b: number };
}

export const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
};

export class DitherEngine {
    static process(canvas: HTMLCanvasElement, settings: DitherSettings) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // 1. Apply Brightness & Contrast
        this.applyBasicControls(data, settings.brightness, settings.contrast);

        // 2. Apply Dithering
        switch (settings.algorithm) {
            case 'floyd-steinberg':
                this.applyFloydSteinberg(data, canvas.width, canvas.height, settings);
                break;
            case 'atkinson':
                this.applyAtkinson(data, canvas.width, canvas.height, settings);
                break;
            case 'bayer':
                this.applyBayer(data, canvas.width, canvas.height, settings);
                break;
        }

        ctx.putImageData(imageData, 0, 0);
    }

    private static applyBasicControls(data: Uint8ClampedArray, brightness: number, contrast: number) {
        const b = (brightness / 100) * 255;
        const c = (contrast + 100) / 100; // 0 to 2
        const intercept = 127.5 * (1 - c);

        for (let i = 0; i < data.length; i += 4) {
            for (let j = 0; j < 3; j++) {
                let val = data[i + j];
                // Brightness
                val += b;
                // Contrast
                val = val * c + intercept;
                data[i + j] = Math.max(0, Math.min(255, val));
            }
        }
    }

    private static getClosestColor(val: number, levels: number) {
        return Math.round((val / 255) * (levels - 1)) * (255 / (levels - 1));
    }

    private static applyFloydSteinberg(data: Uint8ClampedArray, w: number, h: number, settings: DitherSettings) {
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const i = (y * w + x) * 4;
                const oldR = data[i];
                const oldG = data[i + 1];
                const oldB = data[i + 2];

                // We use grayscale for the core dithering logic to simplify multi-level
                const gray = (oldR + oldG + oldB) / 3;
                const newGray = this.getClosestColor(gray, settings.levels);

                // Map back to colors
                const ratio = newGray / 255;
                data[i] = settings.bgColor.r + (settings.fgColor.r - settings.bgColor.r) * ratio;
                data[i + 1] = settings.bgColor.g + (settings.fgColor.g - settings.bgColor.g) * ratio;
                data[i + 2] = settings.bgColor.b + (settings.fgColor.b - settings.bgColor.b) * ratio;

                const err = gray - newGray;

                this.distributeError(data, x + 1, y, w, h, err * (7 / 16));
                this.distributeError(data, x - 1, y + 1, w, h, err * (3 / 16));
                this.distributeError(data, x, y + 1, w, h, err * (5 / 16));
                this.distributeError(data, x + 1, y + 1, w, h, err * (1 / 16));
            }
        }
    }

    private static applyAtkinson(data: Uint8ClampedArray, w: number, h: number, settings: DitherSettings) {
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const i = (y * w + x) * 4;
                const oldR = data[i];
                const oldG = data[i + 1];
                const oldB = data[i + 2];

                const gray = (oldR + oldG + oldB) / 3;
                const newGray = this.getClosestColor(gray, settings.levels);

                const ratio = newGray / 255;
                data[i] = settings.bgColor.r + (settings.fgColor.r - settings.bgColor.r) * ratio;
                data[i + 1] = settings.bgColor.g + (settings.fgColor.g - settings.bgColor.g) * ratio;
                data[i + 2] = settings.bgColor.b + (settings.fgColor.b - settings.bgColor.b) * ratio;

                const err = (gray - newGray) / 8; // Atkinson distributes 1/8 to each

                this.distributeError(data, x + 1, y, w, h, err);
                this.distributeError(data, x + 2, y, w, h, err);
                this.distributeError(data, x - 1, y + 1, w, h, err);
                this.distributeError(data, x, y + 1, w, h, err);
                this.distributeError(data, x + 1, y + 1, w, h, err);
                this.distributeError(data, x, y + 2, w, h, err);
            }
        }
    }

    private static applyBayer(data: Uint8ClampedArray, w: number, h: number, settings: DitherSettings) {
        const bayerMatrix4x4 = [
            [0, 8, 2, 10],
            [12, 4, 14, 6],
            [3, 11, 1, 9],
            [15, 7, 13, 5]
        ];

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const i = (y * w + x) * 4;
                const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;

                const bayerVal = bayerMatrix4x4[y % 4][x % 4];

                // Adjust gray based on bayer matrix
                const step = 255 / (settings.levels - 1);

                let newGray;
                if (gray > (Math.floor(gray / step) * step + (bayerVal / 16) * step)) {
                    newGray = Math.ceil(gray / step) * step;
                } else {
                    newGray = Math.floor(gray / step) * step;
                }
                newGray = Math.min(255, Math.max(0, newGray));

                const ratio = newGray / 255;
                data[i] = settings.bgColor.r + (settings.fgColor.r - settings.bgColor.r) * ratio;
                data[i + 1] = settings.bgColor.g + (settings.fgColor.g - settings.bgColor.g) * ratio;
                data[i + 2] = settings.bgColor.b + (settings.fgColor.b - settings.bgColor.b) * ratio;
            }
        }
    }

    private static distributeError(data: Uint8ClampedArray, x: number, y: number, w: number, h: number, err: number) {
        if (x < 0 || x >= w || y < 0 || y >= h) return;
        const i = (y * w + x) * 4;
        for (let j = 0; j < 3; j++) {
            data[i + j] = Math.max(0, Math.min(255, data[i + j] + err));
        }
    }
}
