/**
 * Water Detection Algorithm
 * 
 * This module implements water detection using color-based analysis.
 * For production use, this should be replaced with a proper ML model
 * like a trained CNN or use indices like NDWI for satellite imagery.
 */

export interface WaterDetectionResult {
  waterMask: number[][];
  waterPercentage: number;
  totalPixels: number;
  waterPixels: number;
  confidence: number;
  processingTime: number;
}

/**
 * Analyzes an image to detect water bodies using color analysis
 * This uses a simple HSV-based approach for demonstration.
 * 
 * For satellite imagery, consider using:
 * - NDWI (Normalized Difference Water Index)
 * - MNDWI (Modified NDWI)
 * - AWEInsh/AWEIsh (Automated Water Extraction Index)
 */
export async function detectWater(imageData: ImageData): Promise<WaterDetectionResult> {
  const startTime = performance.now();
  
  const { width, height, data } = imageData;
  const waterMask: number[][] = [];
  const totalPixels = width * height;

  // Process each pixel
  for (let y = 0; y < height; y++) {
    waterMask[y] = [];
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Check if pixel is water using multiple criteria
      const isWater = isWaterPixel(r, g, b);
      waterMask[y][x] = isWater ? 1 : 0;
    }
  }

  // Apply morphological operations to clean up the mask
  const cleanedMask = applyMorphology(waterMask, width, height);
  
  // Recalculate water pixels after cleanup
  let finalWaterPixels = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (cleanedMask[y][x] === 1) {
        finalWaterPixels++;
      }
    }
  }

  const waterPercentage = (finalWaterPixels / totalPixels) * 100;
  const processingTime = Math.round(performance.now() - startTime);

  // Confidence based on consistency of detection
  const confidence = calculateConfidence(cleanedMask, finalWaterPixels, totalPixels);

  return {
    waterMask: cleanedMask,
    waterPercentage,
    totalPixels,
    waterPixels: finalWaterPixels,
    confidence,
    processingTime
  };
}

/**
 * Determines if a pixel represents water based on color analysis
 */
function isWaterPixel(r: number, g: number, b: number): boolean {
  // Convert to HSV for better color analysis
  const { h, s, v } = rgbToHsv(r, g, b);

  // Water detection criteria:
  // 1. Blue-ish hue (180-250 degrees, normalized to 0-1)
  // 2. Moderate to low saturation for murky water
  // 3. Can be dark (deep water) or bright (shallow/reflective)

  const hueInRange = (h >= 0.45 && h <= 0.75); // Blue-cyan range
  const saturationOk = s >= 0.1 && s <= 0.9;
  const notTooWhite = !(r > 240 && g > 240 && b > 240);
  const notTooBlack = v > 0.05;

  // Additional check: Blue channel should be prominent
  const blueProminent = b > r * 0.8 && b > g * 0.85;
  
  // Check for dark water (lakes, deep ocean)
  const isDarkWater = v < 0.4 && b > r && b > g * 0.9;

  // Check for bright water (shallow, reflective)
  const isBrightWater = hueInRange && saturationOk && blueProminent;

  return (isBrightWater || isDarkWater) && notTooWhite && notTooBlack;
}

/**
 * Convert RGB to HSV color space
 */
function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h, s, v };
}

/**
 * Apply basic morphological operations to clean up the mask
 */
function applyMorphology(mask: number[][], width: number, height: number): number[][] {
  // Erosion followed by dilation (opening) to remove noise
  const eroded = erode(mask, width, height);
  const opened = dilate(eroded, width, height);
  
  // Dilation followed by erosion (closing) to fill small holes
  const dilated = dilate(opened, width, height);
  const closed = erode(dilated, width, height);
  
  return closed;
}

function erode(mask: number[][], width: number, height: number): number[][] {
  const result: number[][] = [];
  
  for (let y = 0; y < height; y++) {
    result[y] = [];
    for (let x = 0; x < width; x++) {
      // Check 3x3 neighborhood
      let allOnes = true;
      for (let dy = -1; dy <= 1 && allOnes; dy++) {
        for (let dx = -1; dx <= 1 && allOnes; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            if (mask[ny][nx] === 0) allOnes = false;
          }
        }
      }
      result[y][x] = allOnes ? 1 : 0;
    }
  }
  
  return result;
}

function dilate(mask: number[][], width: number, height: number): number[][] {
  const result: number[][] = [];
  
  for (let y = 0; y < height; y++) {
    result[y] = [];
    for (let x = 0; x < width; x++) {
      // Check 3x3 neighborhood
      let anyOne = false;
      for (let dy = -1; dy <= 1 && !anyOne; dy++) {
        for (let dx = -1; dx <= 1 && !anyOne; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            if (mask[ny][nx] === 1) anyOne = true;
          }
        }
      }
      result[y][x] = anyOne ? 1 : 0;
    }
  }
  
  return result;
}

/**
 * Calculate confidence score based on detection characteristics
 */
function calculateConfidence(mask: number[][], waterPixels: number, totalPixels: number): number {
  // Base confidence
  let confidence = 0.7;

  // Adjust based on water coverage (extreme values reduce confidence)
  const percentage = (waterPixels / totalPixels) * 100;
  if (percentage > 0.5 && percentage < 95) {
    confidence += 0.1;
  }
  if (percentage > 5 && percentage < 80) {
    confidence += 0.1;
  }

  // Ensure confidence is in valid range
  return Math.min(0.95, Math.max(0.5, confidence));
}
