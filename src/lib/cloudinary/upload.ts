import { createServerFn } from "@tanstack/react-start";

import { env } from "@/env/server";

import { cloudinaryClient, getImageUrl, getThumbnailUrl } from "./client";

export interface UploadResult {
  publicId: string;
  imageUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
}

const $uploadImage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (typeof data !== "object" || data === null) {
      throw new Error("Expected object");
    }
    const input = data as { dataUrl?: unknown; fileName?: unknown };
    if (typeof input.dataUrl !== "string" || typeof input.fileName !== "string") {
      throw new Error("Expected dataUrl and fileName strings");
    }
    return { dataUrl: input.dataUrl, fileName: input.fileName };
  })
  .handler(async ({ data }) => {
    const { dataUrl, fileName } = data;

    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    return new Promise<UploadResult>((resolve, reject) => {
      cloudinaryClient.uploader
        .upload_stream(
          {
            upload_preset: env.CLOUDINARY_UPLOAD_PRESET,
            folder: "outfitter",
            public_id: fileName.replace(/\.[^.]+$/, ""),
          },
          (error, result) => {
            if (error || !result) {
              reject(new Error(error?.message ?? "Upload failed"));
              return;
            }

            resolve({
              publicId: result.public_id,
              imageUrl: getImageUrl(result.public_id),
              thumbnailUrl: getThumbnailUrl(result.public_id),
              width: result.width,
              height: result.height,
            });
          },
        )
        .end(buffer);
    });
  });

export { $uploadImage };
