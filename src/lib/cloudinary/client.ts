import { v2 as cloudinary } from "cloudinary";
import type { ConfigAndUrlOptions } from "cloudinary";

import { env } from "@/env/server";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const cloudinaryClient = cloudinary;

export function getImageUrl(publicId: string, options?: ConfigAndUrlOptions) {
  return cloudinary.url(publicId, {
    secure: true,
    fetch_format: "auto",
    quality: "auto",
    ...options,
  });
}

export function getThumbnailUrl(publicId: string) {
  return cloudinary.url(publicId, {
    secure: true,
    width: 400,
    height: 400,
    crop: "fill",
    gravity: "auto",
    fetch_format: "auto",
    quality: "auto",
  });
}

export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}
