/**
 * Gentle, non-destructive computer vision preprocessor for textbook photos.
 * Preserves anti-aliased font edges, boosts local contrast gently, and avoids
 * harsh binary thresholding that causes black blobs or erased text.
 */

export interface PreprocessedImageResult {
  ocrDataUrl: string;
  originalWidth: number;
  originalHeight: number;
}

export async function preprocessTextbookImage(
  base64Data: string
): Promise<PreprocessedImageResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const TARGET_MAX_DIM = 2200; // Optimal resolution for Tesseract character recognition
        let width = img.width;
        let height = img.height;

        if (width > TARGET_MAX_DIM || height > TARGET_MAX_DIM) {
          if (width > height) {
            height = Math.round((height * TARGET_MAX_DIM) / width);
            width = TARGET_MAX_DIM;
          } else {
            width = Math.round((width * TARGET_MAX_DIM) / height);
            height = TARGET_MAX_DIM;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        if (!ctx) {
          resolve({
            ocrDataUrl: base64Data,
            originalWidth: img.width,
            originalHeight: img.height,
          });
          return;
        }

        // Draw scaled image
        ctx.drawImage(img, 0, 0, width, height);

        // Get pixel data
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const numPixels = width * height;

        // 1. Convert to smooth Grayscale and find min/max luminance
        const gray = new Uint8Array(numPixels);
        let minLum = 255;
        let maxLum = 0;

        for (let i = 0; i < numPixels; i++) {
          const idx = i * 4;
          // ITU-R BT.601 luma formula
          const lum = Math.round(
            0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
          );
          gray[i] = lum;
          if (lum < minLum) minLum = lum;
          if (lum > maxLum) maxLum = lum;
        }

        // 2. Gentle linear contrast stretch (avoid harsh binary cutoff)
        const lumRange = maxLum - minLum || 1;

        for (let i = 0; i < numPixels; i++) {
          const idx = i * 4;
          const currentLum = gray[i];

          // Normalize to [0, 255]
          let stretched = Math.round(((currentLum - minLum) / lumRange) * 255);

          // Apply gentle gamma curve to make ink darker without destroying background
          // gamma = 1.3 pushes midtones slightly darker so light text is visible
          stretched = Math.min(255, Math.max(0, Math.round(255 * Math.pow(stretched / 255, 1.25))));

          data[idx] = stretched;
          data[idx + 1] = stretched;
          data[idx + 2] = stretched;
          data[idx + 3] = 255;
        }

        ctx.putImageData(imageData, 0, 0);

        // Export high-quality PNG for OCR worker
        const ocrDataUrl = canvas.toDataURL("image/png");

        resolve({
          ocrDataUrl,
          originalWidth: img.width,
          originalHeight: img.height,
        });
      } catch (err) {
        console.warn("Image preprocessing fallback:", err);
        resolve({
          ocrDataUrl: base64Data,
          originalWidth: img.width,
          originalHeight: img.height,
        });
      }
    };

    img.onerror = () => {
      resolve({
        ocrDataUrl: base64Data,
        originalWidth: 0,
        originalHeight: 0,
      });
    };

    img.src = base64Data;
  });
}
