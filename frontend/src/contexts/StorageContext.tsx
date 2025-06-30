import React, { createContext, useContext, useState, useEffect } from "react";
import { STORAGE_CONFIG, StorageUtils, StorageStatus } from "@/config/storage";

interface StorageContextType {
  usedStorage: number; // in bytes
  totalStorage: number; // in bytes
  storagePercentage: number;
  storageStatus: StorageStatus;
  remainingStorage: number;
  canUpload: (fileSize: number) => boolean;
  updateStorage: (newUsage: number) => void;
  addFileUsage: (fileSize: number) => void;
  removeFileUsage: (fileSize: number) => void;
  getFormattedUsage: () => string;
  getFormattedRemaining: () => string;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Mock initial storage usage - in real app this would come from API
  const [usedStorage, setUsedStorage] = useState(13.2 * 1024 * 1024 * 1024); // 13.2 GB in bytes

  const totalStorage = STORAGE_CONFIG.MAX_STORAGE_BYTES;
  const storagePercentage = StorageUtils.getStoragePercentage(usedStorage);
  const storageStatus = StorageUtils.getStorageStatus(usedStorage);
  const remainingStorage = StorageUtils.getRemainingStorage(usedStorage);

  // Load storage usage from localStorage on mount (simulate API)
  useEffect(() => {
    const savedUsage = localStorage.getItem("altech-storage-usage");
    if (savedUsage) {
      setUsedStorage(parseInt(savedUsage, 10));
    }
  }, []);

  // Save storage usage to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("altech-storage-usage", usedStorage.toString());
  }, [usedStorage]);

  const canUpload = (fileSize: number): boolean => {
    return StorageUtils.canUpload(usedStorage, fileSize);
  };

  const updateStorage = (newUsage: number): void => {
    setUsedStorage(Math.max(0, Math.min(newUsage, totalStorage)));
  };

  const addFileUsage = (fileSize: number): void => {
    setUsedStorage((prev) => Math.min(prev + fileSize, totalStorage));
  };

  const removeFileUsage = (fileSize: number): void => {
    setUsedStorage((prev) => Math.max(0, prev - fileSize));
  };

  const getFormattedUsage = (): string => {
    return StorageUtils.formatStorageDisplay(usedStorage);
  };

  const getFormattedRemaining = (): string => {
    const remainingGB = StorageUtils.bytesToGB(remainingStorage);
    return `${remainingGB} GB remaining`;
  };

  const value: StorageContextType = {
    usedStorage,
    totalStorage,
    storagePercentage,
    storageStatus,
    remainingStorage,
    canUpload,
    updateStorage,
    addFileUsage,
    removeFileUsage,
    getFormattedUsage,
    getFormattedRemaining,
  };

  return (
    <StorageContext.Provider value={value}>{children}</StorageContext.Provider>
  );
};

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (context === undefined) {
    throw new Error("useStorage must be used within a StorageProvider");
  }
  return context;
};
