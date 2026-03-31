import * as path from "@std/path";

export async function ensureDirectoryExists(directoryPath: string): Promise<void> {
  try {
    await Deno.mkdir(directoryPath, { recursive: true });
    console.log(`📁 Directory created or already exists: ${directoryPath}`);
  } catch (error) {
    console.error(`❌ Error creating directory ${directoryPath}:`, error);
    throw error;
  }
}

export async function executeWithPdfToCairo(
  pdfPath: string,
  thumbnailName: string,
  outputDirectory: string,
): Promise<void> {
  const command = new Deno.Command("pdftocairo", {
    args: [
      "-png",
      "-f",
      "1",
      "-l",
      "10",
      pdfPath,
      path.join(outputDirectory, thumbnailName),
    ],
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stderr } = await command.output();

  if (code === 0) {
    console.log(`✅ Generated thumbnails using pdftocairo: ${thumbnailName}`);
  } else {
    const errorText = new TextDecoder().decode(stderr);
    throw new Error(`pdftocairo command failed (code ${code}): ${errorText}`);
  }
}

export async function executeWithPopplerUtils(
  pdfPath: string,
  thumbnailName: string,
  outputDirectory: string,
): Promise<void> {
  try {
    const command = new Deno.Command("pdfimages", {
      args: [
        "-j",
        "-f",
        "1",
        "-l",
        "10",
        pdfPath,
        path.join(outputDirectory, thumbnailName),
      ],
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stderr } = await command.output();

    if (code === 0) {
      console.log(`✅ Generated images using pdfimages: ${thumbnailName}`);
      return;
    } else {
      const errorText = new TextDecoder().decode(stderr);
      throw new Error(`pdfimages failed (code ${code}): ${errorText}`);
    }
  } catch (_pdfimagesError) {
    console.log(`⚠️  pdfimages failed, trying pdftoppm...`);

    const command = new Deno.Command("pdftoppm", {
      args: [
        "-jpeg",
        "-f",
        "1",
        "-l",
        "10",
        pdfPath,
        path.join(outputDirectory, thumbnailName),
      ],
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stderr } = await command.output();

    if (code === 0) {
      console.log(`✅ Generated thumbnails using pdftoppm: ${thumbnailName}`);
    } else {
      const errorText = new TextDecoder().decode(stderr);
      throw new Error(`pdftoppm failed (code ${code}): ${errorText}`);
    }
  }
}

export async function createMockThumbnails(
  pdfPath: string,
  thumbnailName: string,
  outputDirectory: string,
): Promise<void> {
  try {
    const mockThumbnails = [
      `${thumbnailName}-1.jpg`,
      `${thumbnailName}-2.jpg`,
      `${thumbnailName}-3.jpg`,
    ];

    for (const mockFile of mockThumbnails) {
      const mockPath = path.join(outputDirectory, mockFile);
      await Deno.writeTextFile(
        mockPath,
        `Mock thumbnail for ${path.basename(pdfPath)}\nGenerated: ${new Date().toISOString()}`,
      );
    }

    console.log(
      `✅ Generated mock thumbnails: ${thumbnailName} (${mockThumbnails.length} files)`,
    );
  } catch (error) {
    throw new Error(
      `Mock thumbnail generation failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function generateWithPdfToCairo(
  pdfPath: string,
  thumbnailName: string,
  outputDirectory: string,
): Promise<void> {
  try {
    await executeWithPdfToCairo(pdfPath, thumbnailName, outputDirectory);
  } catch (pdftocairoError) {
    console.log(
      `⚠️  pdftocairo failed: ${
        pdftocairoError instanceof Error ? pdftocairoError.message : String(pdftocairoError)
      }`,
    );

    try {
      await executeWithPopplerUtils(pdfPath, thumbnailName, outputDirectory);
    } catch (popplerError) {
      console.log(
        `⚠️  Poppler utilities failed: ${
          popplerError instanceof Error ? popplerError.message : String(popplerError)
        }`,
      );

      console.log(`🔄 Creating mock thumbnails for development`);
      await createMockThumbnails(pdfPath, thumbnailName, outputDirectory);
    }
  }
}
