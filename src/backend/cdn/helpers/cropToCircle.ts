import sharp from "sharp";

/**
 * Crops a buffer into a circular PNG image.
 */
export async function cropToCircle(
    inputBuffer: Buffer,
    size: number
): Promise<Buffer> {
    const radius = size / 2;
    const mask = Buffer.from(`
        <svg width="${size}" height="${size}">
            <circle cx="${radius}" cy="${radius}" r="${radius}" fill="black"/>
        </svg>
    `);

    return sharp(inputBuffer)
        .resize(size, size, { fit: "cover" })
        .composite([{ input: mask, blend: "dest-in" }])
        .png({ compressionLevel: 3 })
        .toBuffer();
}
