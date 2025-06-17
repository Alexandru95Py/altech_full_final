import { useStorage } from "@/contexts/StorageContext";
import { STORAGE_CONFIG, StorageUtils } from "@/config/storage";
import { toast } from "sonner";

export const useStorageValidation = () => {
  const { canUpload, usedStorage, remainingStorage, addFileUsage } =
    useStorage();

  const validateSingleFile = (file: File): boolean => {
    // Check individual file size limit
    if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE_BYTES) {
      toast.error(
        `File size exceeds limit. Maximum file size is ${STORAGE_CONFIG.MAX_FILE_SIZE_MB} MB.`,
      );
      return false;
    }

    // Check storage capacity
    if (!canUpload(file.size)) {
      const remainingGB = StorageUtils.bytesToGB(remainingStorage);
      const fileGB = StorageUtils.bytesToGB(file.size);

      toast.error(
        `Not enough storage space. You need ${fileGB} GB but only have ${remainingGB} GB remaining.`,
      );
      return false;
    }

    return true;
  };

  const validateMultipleFiles = (
    files: File[],
  ): { valid: File[]; invalid: File[] } => {
    const valid: File[] = [];
    const invalid: File[] = [];
    let totalSize = 0;

    // Check batch size limit
    if (files.length > STORAGE_CONFIG.MAX_BATCH_FILES) {
      toast.error(
        `Too many files selected. Maximum ${STORAGE_CONFIG.MAX_BATCH_FILES} files per batch.`,
      );
      return { valid: [], invalid: files };
    }

    // Calculate total size and validate each file
    for (const file of files) {
      totalSize += file.size;
    }

    // Check total batch size
    if (totalSize > STORAGE_CONFIG.MAX_BATCH_SIZE_BYTES) {
      toast.error(
        `Batch size exceeds limit. Maximum batch size is ${STORAGE_CONFIG.MAX_BATCH_SIZE_MB} MB.`,
      );
      return { valid: [], invalid: files };
    }

    // Check if total batch fits in remaining storage
    if (!canUpload(totalSize)) {
      const remainingGB = StorageUtils.bytesToGB(remainingStorage);
      const totalGB = StorageUtils.bytesToGB(totalSize);

      toast.error(
        `Not enough storage space. You need ${totalGB} GB but only have ${remainingGB} GB remaining.`,
      );
      return { valid: [], invalid: files };
    }

    // Validate individual files
    for (const file of files) {
      if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE_BYTES) {
        invalid.push(file);
        toast.error(
          `${file.name} exceeds the ${STORAGE_CONFIG.MAX_FILE_SIZE_MB} MB file size limit.`,
        );
      } else {
        valid.push(file);
      }
    }

    return { valid, invalid };
  };

  const handleSuccessfulUpload = (file: File) => {
    addFileUsage(file.size);

    const fileSize = StorageUtils.formatBytes(file.size);
    toast.success(`${file.name} (${fileSize}) uploaded successfully!`);
  };

  const getStorageWarning = (): string | null => {
    const percentage = usedStorage / STORAGE_CONFIG.MAX_STORAGE_BYTES;

    if (percentage >= 0.95) {
      return `Storage is ${Math.round(percentage * 100)}% full. Please delete some files to free up space.`;
    } else if (percentage >= 0.9) {
      return `Storage is ${Math.round(percentage * 100)}% full. Consider cleaning up old files.`;
    }

    return null;
  };

  const getUploadLimitsInfo = () => {
    return {
      maxFileSize: `${STORAGE_CONFIG.MAX_FILE_SIZE_MB} MB`,
      maxBatchFiles: STORAGE_CONFIG.MAX_BATCH_FILES,
      maxBatchSize: `${STORAGE_CONFIG.MAX_BATCH_SIZE_MB} MB`,
      remainingStorage: StorageUtils.formatBytes(remainingStorage),
      planDescription: StorageUtils.getPlanDescription(),
    };
  };

  return {
    validateSingleFile,
    validateMultipleFiles,
    handleSuccessfulUpload,
    getStorageWarning,
    getUploadLimitsInfo,
    canUpload,
  };
};
