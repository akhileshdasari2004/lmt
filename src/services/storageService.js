// src/services/storageService.js
import { storage } from "./firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

// Compress image before upload
export const compressImage = async (
  file,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.8,
) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob((blob) => resolve(blob), file.type, quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export const uploadAvatar = async (userId, file) => {
  const storageRef = ref(storage, `avatars/${userId}`);

  // Upload with timeout handling
  try {
    await uploadBytes(storageRef, file, {
      customMetadata: {
        uploadedAt: new Date().toISOString(),
      },
    });
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    if (error.code === "storage/retry-limit-exceeded") {
      throw new Error(
        "Upload took too long. Please try again with a smaller image.",
      );
    }
    throw error;
  }
};

export const deleteAvatar = async (userId) => {
  try {
    const storageRef = ref(storage, `avatars/${userId}`);
    await deleteObject(storageRef);
  } catch (error) {
    // If file doesn't exist, ignore the error
    if (error.code !== "storage/object-not-found") {
      throw error;
    }
  }
};
