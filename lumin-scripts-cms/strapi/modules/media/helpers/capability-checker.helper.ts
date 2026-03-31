import { IThumbnailCapabilities } from "../interfaces/index.ts";

export async function checkThumbnailCapabilities(): Promise<IThumbnailCapabilities> {
  const capabilities = {
    pdftocairo: false,
    pdfimages: false,
    pdftoppm: false,
    recommended: "mock",
    installation: "",
  };

  try {
    const command = new Deno.Command("pdftocairo", {
      args: ["-v"],
      stdout: "piped",
      stderr: "piped",
    });

    const { code } = await command.output();
    if (code === 0) {
      capabilities.pdftocairo = true;
      console.log("✅ pdftocairo is available");
    }
  } catch (_error) {
    console.log("❌ pdftocairo is not available");
  }

  try {
    const command = new Deno.Command("pdfimages", {
      args: ["-v"],
      stdout: "piped",
      stderr: "piped",
    });

    const { code } = await command.output();
    if (code === 0) {
      capabilities.pdfimages = true;
      console.log("✅ pdfimages is available");
    }
  } catch (_error) {
    console.log("❌ pdfimages is not available");
  }

  try {
    const command = new Deno.Command("pdftoppm", {
      args: ["-v"],
      stdout: "piped",
      stderr: "piped",
    });

    const { code } = await command.output();
    if (code === 0) {
      capabilities.pdftoppm = true;
      console.log("✅ pdftoppm is available");
    }
  } catch (_error) {
    console.log("❌ pdftoppm is not available");
  }

  if (capabilities.pdftocairo) {
    capabilities.recommended = "pdftocairo";
  } else if (capabilities.pdfimages) {
    capabilities.recommended = "pdfimages";
  } else if (capabilities.pdftoppm) {
    capabilities.recommended = "pdftoppm";
  }

  if (!capabilities.pdftocairo && !capabilities.pdfimages && !capabilities.pdftoppm) {
    const platform = Deno.build.os;
    switch (platform) {
      case "darwin":
        capabilities.installation = "Install poppler: brew install poppler";
        break;
      case "linux":
        capabilities.installation =
          "Install poppler: sudo apt-get install poppler-utils (Ubuntu/Debian) or sudo yum install poppler-utils (RHEL/CentOS)";
        break;
      case "windows":
        capabilities.installation =
          "Install poppler: Download from https://poppler.freedesktop.org/ or use chocolatey: choco install poppler";
        break;
      default:
        capabilities.installation = "Install poppler utilities for your operating system";
    }
  }

  return capabilities;
}
