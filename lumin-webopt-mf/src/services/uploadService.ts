interface CurrentUser {
  _id: string;
  name?: string;
  email?: string;
}

interface LocalFileMetadata {
  _id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  createdAt: string;
  userId: string;
  isLocal: boolean;
}

class UploadService {
  async uploadPdfFile(file: File): Promise<string> {
    try {
      return await this.uploadFileLocally(file);
    } catch (error) {
      console.error("Upload failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to upload PDF: ${errorMessage}`);
    }
  }

  async fetchPdfFile(fileUrl: string): Promise<File | null> {
    const fileName = fileUrl.split("/").pop() || "template.pdf";

    try {
      const pdfServerUrl = "http://localhost:8765";

      const fetchResponse = await fetch(`${pdfServerUrl}/api/v1/pdf/fetch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: fileUrl,
          filename: fileName,
        }),
      });

      if (!fetchResponse.ok) {
        throw new Error(`PDF fetch failed: ${fetchResponse.status}`);
      }

      const fetchResult = await fetchResponse.json();

      const fileResponse = await fetch(
        `${pdfServerUrl}/api/v1/pdf/${fetchResult.filename}`,
      );

      if (!fileResponse.ok) {
        throw new Error(`PDF file retrieval failed: ${fileResponse.status}`);
      }

      const blob = await fileResponse.blob();
      return new File([blob], fileName, { type: "application/pdf" });
    } catch (error) {
      console.error("❌ PDF server fetch failed:", error);
      return null;
    }
  }

  private async uploadFileLocally(file: File): Promise<string> {
    const currentUser = this.getCurrentUser();
    const documentId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fileUrl = URL.createObjectURL(file);

    const fileMetadata: LocalFileMetadata = {
      _id: documentId,
      name: file.name,
      size: file.size,
      type: file.type,
      url: fileUrl,
      createdAt: new Date().toISOString(),
      userId: currentUser._id,
      isLocal: true,
    };

    const existingFiles = this.getLocalFiles();
    existingFiles.push(fileMetadata);
    localStorage.setItem("lumin_local_files", JSON.stringify(existingFiles));

    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: "LOCAL_FILE_UPLOADED",
          payload: fileMetadata,
        },
        "*",
      );
    }

    return documentId;
  }

  private getLocalFiles(): LocalFileMetadata[] {
    try {
      const files = localStorage.getItem("lumin_local_files");
      return files ? JSON.parse(files) : [];
    } catch (error) {
      console.warn("Error reading local files:", error);
      return [];
    }
  }

  private getCurrentUser(): CurrentUser {
    const globalUser = (window as unknown as Record<string, unknown>)
      .__LUMIN_USER__ as CurrentUser;
    if (globalUser && globalUser._id) {
      return globalUser;
    }

    try {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user._id) {
          return user;
        }
      }
    } catch (error) {
      console.warn("Error reading user from localStorage:", error);
    }

    return {
      _id: "mock_user_id",
      name: "Mock User",
      email: "mock@example.com",
    };
  }
}

export const uploadService = new UploadService();
