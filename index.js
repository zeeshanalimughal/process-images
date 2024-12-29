import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import imageminMozjpeg from 'imagemin-mozjpeg';

const inputDirectory = 'images';
const outputDirectory = 'output';

if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
}

// Function to process each image in the input directory
async function processImage(inputImagePath) {
    try {
        const outputImagePath = path.join(outputDirectory, `output_${path.basename(inputImagePath)}`);

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

        await image.resize(7000, 4000, {
            fit: sharp.fit.inside,
        });

        await image.toFile(outputImagePath);

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

fs.readdir(inputDirectory, async (err, files) => {
    if (err) {
        console.error(`Error reading input directory: ${err.message}`);
        return;
    }

    const imageFiles = files.filter(file => /\.(jpg|jpeg|png)$/i.test(file));

    for (const file of imageFiles) {
        const inputImagePath = path.join(inputDirectory, file);
        await processImage(inputImagePath);
    }
});
