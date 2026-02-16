'use client';

import { useEffect, useRef, useState } from 'react';

interface WaterDetectionCanvasProps {
  originalImage: string;
  waterMask: number[][] | null;
  showOverlay: boolean;
  overlayOpacity: number;
}

export default function WaterDetectionCanvas({
  originalImage,
  waterMask,
  showOverlay,
  overlayOpacity
}: WaterDetectionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !originalImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas dimensions
      const maxWidth = 800;
      const scale = Math.min(1, maxWidth / img.width);
      const width = img.width * scale;
      const height = img.height * scale;
      
      canvas.width = width;
      canvas.height = height;
      setDimensions({ width, height });

      // Draw original image
      ctx.drawImage(img, 0, 0, width, height);

      // Draw water mask overlay if available
      if (waterMask && showOverlay) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        const maskHeight = waterMask.length;
        const maskWidth = waterMask[0]?.length || 0;

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const maskY = Math.floor((y / height) * maskHeight);
            const maskX = Math.floor((x / width) * maskWidth);
            
            if (waterMask[maskY] && waterMask[maskY][maskX] === 1) {
              const idx = (y * width + x) * 4;
              // Blue overlay for water
              data[idx] = Math.round(data[idx] * (1 - overlayOpacity) + 59 * overlayOpacity);
              data[idx + 1] = Math.round(data[idx + 1] * (1 - overlayOpacity) + 130 * overlayOpacity);
              data[idx + 2] = Math.round(data[idx + 2] * (1 - overlayOpacity) + 246 * overlayOpacity);
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
      }
    };
    img.src = originalImage;
  }, [originalImage, waterMask, showOverlay, overlayOpacity]);

  return (
    <div className="relative rounded-xl overflow-hidden shadow-2xl bg-gray-900">
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto"
        style={{ display: 'block', margin: '0 auto' }}
      />
      {dimensions.width > 0 && (
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {dimensions.width} × {dimensions.height}
        </div>
      )}
    </div>
  );
}
