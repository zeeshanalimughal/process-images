import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import imageminMozjpeg from 'imagemin-mozjpeg';

const inputDirectory = 'images';
const outputDirectory = 'output';

// Create the output directory if it doesn't exist
if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
}

// Function to process each image in the input directory
async function processImage(inputImagePath) {
    try {
        const outputImagePath = path.join(outputDirectory, `output_${path.basename(inputImagePath)}`);

        // Read the image using Sharp
        const image = sharp(inputImagePath);

        image.blur(0.3).sharpen();

        image.modulate({
            brightness: 1,
        });

        image.modulate({
            contrast: 1.15,
        });

        image.modulate({
            saturation: 1.3,
        });
        // Resize the image to 7000x4000 pixels
        await image.resize(7000, 4000, {
            fit: sharp.fit.inside,
        });

        // Convert the image to the sRGB color space
        await image.toFile(outputImagePath);

        // Compress the image using imagemin
        await imagemin([outputImagePath], {
            destination: outputDirectory,
            plugins: [
                imageminPngquant({
                    quality: [0.6, 0.8],
                }),
                imageminMozjpeg({
                    quality: 100,
                }),
            ],
        });

        console.log(`Processed and compressed: ${path.basename(inputImagePath)}`);
    } catch (error) {
        console.error(`Error processing ${path.basename(inputImagePath)}: ${error.message}`);
    }
}

// Read the input directory
fs.readdir(inputDirectory, async (err, files) => {
    if (err) {
        console.error(`Error reading input directory: ${err.message}`);
        return;
    }

    // Filter the files to only include images
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png)$/i.test(file));

    // Process each image
    for (const file of imageFiles) {
        const inputImagePath = path.join(inputDirectory, file);
        await processImage(inputImagePath);
    }
});
