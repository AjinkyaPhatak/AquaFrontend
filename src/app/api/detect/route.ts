import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * API Route for water detection
 * Processes uploaded images and returns water detection results
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPEG, PNG, WebP, or TIFF images.' },
        { status: 400 }
      );
    }

    // Get image as array buffer
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type;

    // Return the image data for client-side processing
    // In a production app, you would process this server-side with proper ML models
    return NextResponse.json({
      success: true,
      imageData: `data:${mimeType};base64,${base64}`,
      message: 'Image received. Processing on client.'
    });

  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Water Detection API',
    version: '1.0.0'
  });
}
