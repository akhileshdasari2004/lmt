// src/hooks/useProfile.js
import { useState, useCallback } from "react";
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { auth } from "../services/firebase";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";
import {
  uploadAvatar as uploadAvatarService,
  deleteAvatar as deleteAvatarService,
  compressImage,
} from "../services/storageService";

export const useProfile = () => {
  const [nameLoading, setNameLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const updateDisplayName = useCallback(async (name) => {
    setNameLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: "No user is currently signed in" };
      }

      // Update Firebase Auth profile
      await updateProfile(user, { displayName: name });

      // Update Firestore users/{userId} doc
      await setDoc(
        doc(db, "users", user.uid),
        { name: name, email: user.email },
        { merge: true },
      );

      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setNameLoading(false);
    }
  }, []);

  const uploadAvatar = useCallback(async (file) => {
    setAvatarLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: "No user is currently signed in" };
      }

      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        return {
          success: false,
          error: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
        };
      }

      // Validate file size before compression (10MB = sanity check)
      const maxSizeBeforeCompress = 10 * 1024 * 1024;
      if (file.size > maxSizeBeforeCompress) {
        return {
          success: false,
          error: "File size is too large. Please use a smaller image.",
        };
      }

      // Compress image to reduce upload time and size
      const compressedBlob = await compressImage(file, 800, 800, 0.8);
      const compressedFile = new File([compressedBlob], file.name, {
        type: file.type,
      });

      // Upload new avatar and get download URL
      const downloadURL = await uploadAvatarService(user.uid, compressedFile);

      // Update Firebase Auth profile and Firestore in parallel (don't wait for old avatar delete)
      await Promise.all([
        updateProfile(user, { photoURL: downloadURL }),
        setDoc(
          doc(db, "users", user.uid),
          { photoURL: downloadURL },
          { merge: true },
        ),
      ]);

      // Delete old avatar in background (don't block)

      deleteAvatarService(user.uid).catch((err) =>
        console.error("Old avatar cleanup failed:", err),
      );

      return { success: true, error: null };
    } catch (err) {
      console.error("Avatar upload error:", err);
      let errorMessage = err.message;
      if (err.message.includes("storage/retry-limit-exceeded")) {
        errorMessage = "Upload took too long. Please try a smaller image.";
      } else if (err.message.includes("storage/unauthorized")) {
        errorMessage = "Permission denied. Please check Firebase rules.";
      }
      return { success: false, error: errorMessage };
    } finally {
      setAvatarLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    setPasswordLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: "No user is currently signed in" };
      }

      if (!user.email) {
        return { success: false, error: "User email not found" };
      }

      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      return { success: true, error: null };
    } catch (err) {
      let errorMessage = err.message;
      if (err.code === "auth/wrong-password") {
        errorMessage = "Current password is incorrect";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "New password is too weak. Use at least 6 characters.";
      }
      return { success: false, error: errorMessage };
    } finally {
      setPasswordLoading(false);
    }
  }, []);

  return {
    updateDisplayName,
    uploadAvatar,
    changePassword,
    nameLoading,
    avatarLoading,
    passwordLoading,
  };
};
