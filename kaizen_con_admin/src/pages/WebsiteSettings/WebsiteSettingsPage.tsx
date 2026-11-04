import React, { useState, useEffect, useRef, useCallback } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useToast } from "../../context/ToastContext";
import {
  downloadBrochure,
  uploadBrochure,
  deleteBrochure,
  replaceBrochure,
  triggerBrochureDownload,
  formatFileSize,
} from "../../services/brochureService";
import {
  PdfFileIcon,
  CloudUploadIcon,
  TrashCanIcon,
  DocumentArrowDownIcon,
} from "../../icons/conferenceIcons";

interface CurrentBrochureState {
  blob: Blob;
  filename: string;
  size: number;
  url: string;
}

export default function WebsiteSettingsPage() {
  const toast = useToast();

  // Brochure State
  const [currentBrochure, setCurrentBrochure] = useState<CurrentBrochureState | null>(null);
  const [isLoadingBrochure, setIsLoadingBrochure] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Delete / Replace Confirmation Modals
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showReplaceModal, setShowReplaceModal] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentBrochureUrlRef = useRef<string | null>(null);

  // Keep track of object URL for cleanup
  useEffect(() => {
    currentBrochureUrlRef.current = currentBrochure?.url || null;
  }, [currentBrochure]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (currentBrochureUrlRef.current) {
        URL.revokeObjectURL(currentBrochureUrlRef.current);
      }
    };
  }, []);

  /**
   * Fetch current brochure from backend
   */
  const loadCurrentBrochure = useCallback(async (isRefresh = false) => {
    setIsLoadingBrochure(true);
    setFetchError(null);

    try {
      const data = await downloadBrochure();

      // Revoke old object URL if exists
      if (currentBrochureUrlRef.current) {
        URL.revokeObjectURL(currentBrochureUrlRef.current);
        currentBrochureUrlRef.current = null;
      }

      if (data) {
        setCurrentBrochure(data);
        if (isRefresh) {
          toast.success("Brochure preview refreshed successfully.");
        }
      } else {
        setCurrentBrochure(null);
      }
    } catch (err: any) {
      console.error("Failed to load current brochure:", err);
      setCurrentBrochure(null);
      setFetchError(err.message || "Failed to load current brochure from server.");
    } finally {
      setIsLoadingBrochure(false);
    }
  }, [toast]);

  useEffect(() => {
    loadCurrentBrochure();
  }, [loadCurrentBrochure]);

  /**
   * File selection and validation
   */
  const validateAndSetFile = (file: File | null) => {
    setValidationError(null);
    setUploadError(null);
    setUploadProgress(0);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setValidationError("The uploaded file is not a valid PDF. Only PDF files are supported.");
      setSelectedFile(file);
      return;
    }

    const MAX_SIZE = 25 * 1024 * 1024; // 25 MB
    if (file.size > MAX_SIZE) {
      setValidationError("Maximum file size is 25 MB.");
      setSelectedFile(file);
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (files.length > 1) {
        setValidationError("Only one brochure file can be uploaded at a time.");
        return;
      }
      validateAndSetFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      if (files.length > 1) {
        setValidationError("Only one brochure file can be uploaded at a time.");
        return;
      }
      validateAndSetFile(files[0]);
    }
  };

  const handleClearSelectedFile = () => {
    setSelectedFile(null);
    setValidationError(null);
    setUploadError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Perform upload or replacement
   */
  const executeUpload = async (forceReplace = false) => {
    if (!selectedFile || validationError) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      if (forceReplace || currentBrochure) {
        // Replace existing brochure: DELETE /api/brochure/delete then POST /api/brochure/upload
        await replaceBrochure(selectedFile, (percent: number) => {
          setUploadProgress(percent);
        });
      } else {
        // Direct upload
        await uploadBrochure(selectedFile, (percent: number) => {
          setUploadProgress(percent);
        });
      }

      toast.success("Conference brochure uploaded and published successfully!");
      handleClearSelectedFile();
      await loadCurrentBrochure();
    } catch (err: any) {
      console.error("Upload error:", err);
      let message = err.message || "Failed to upload brochure.";

      if (err.status === 400) {
        message = "The uploaded file is not a valid PDF.";
      } else if (err.status === 409) {
        message = "A brochure already exists. Please replace or delete the current brochure.";
      } else if (err.status === 413) {
        message = "Maximum file size is 25 MB.";
      } else if (err.status === 415) {
        message = "Only PDF files are supported.";
      }

      setUploadError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    if (!selectedFile || validationError) return;

    if (currentBrochure) {
      // Prompt confirmation before replacing
      setShowReplaceModal(true);
    } else {
      executeUpload(false);
    }
  };

  /**
   * Delete brochure
   */
  const handleDeleteBrochure = async () => {
    setIsDeleting(true);
    try {
      await deleteBrochure();
      toast.success("Current brochure has been deleted.");
      setShowDeleteModal(false);
      await loadCurrentBrochure();
    } catch (err: any) {
      console.error("Delete brochure error:", err);
      toast.error(err.message || "Failed to delete brochure.");
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Download current brochure
   */
  const handleDownloadCurrent = () => {
    if (!currentBrochure) return;
    triggerBrochureDownload(currentBrochure.blob, currentBrochure.filename);
  };

  return (
    <>
      <PageMeta
        title="Website Settings | Kaizen Con 2027 Admin"
        description="Manage website configuration and official conference brochure for Kaizen Con 2027."
      />

      <div className="w-full space-y-6">
        <PageBreadcrumb pageTitle="Website Settings" />

        {/* Main Section: Conference Brochure Management */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xs overflow-hidden">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#AA2D7B]/10 text-[#AA2D7B] dark:bg-[#AA2D7B]/20 shrink-0">
                <PdfFileIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                    Conference Brochure Management
                  </h2>
                  {currentBrochure ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active &amp; Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      No Brochure Uploaded
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Upload and preview the official PDF brochure downloaded by visitors from the Hero Section of the public website.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadCurrentBrochure(true)}
                disabled={isLoadingBrochure}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                title="Refresh current brochure preview"
              >
                <svg
                  className={`w-3.5 h-3.5 ${isLoadingBrochure ? "animate-spin" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Section Body: 2 Columns (Preview on Left / Upload on Right) */}
          <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Column 1: Current Brochure Preview (7 cols on lg) */}
            <div className="lg:col-span-7 flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Current Brochure Preview
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Live PDF rendered from the backend download endpoint
                  </p>
                </div>

                {currentBrochure && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadCurrent}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#AA2D7B] hover:bg-[#8F2366] text-white shadow-xs transition-colors cursor-pointer"
                    >
                      <DocumentArrowDownIcon className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                      title="Delete brochure"
                    >
                      <TrashCanIcon className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Brochure Metadata Bar (if available) */}
              {currentBrochure && (
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">File:</span>
                    <span className="font-mono text-[#AA2D7B] dark:text-[#f3bcd8] truncate font-medium max-w-[260px] sm:max-w-[340px]" title={currentBrochure.filename}>
                      {currentBrochure.filename}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 shrink-0">
                    <span>
                      Size: <strong className="text-gray-700 dark:text-gray-200">{formatFileSize(currentBrochure.size)}</strong>
                    </span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Synced with Backend</span>
                  </div>
                </div>
              )}

              {/* Preview Container / Iframe / Loading / Empty State */}
              <div className="flex-1 min-h-[520px] rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 flex flex-col justify-center items-center overflow-hidden relative shadow-inner">
                {isLoadingBrochure ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                    <div className="w-10 h-10 border-3 border-[#AA2D7B] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Fetching current brochure from server...
                    </p>
                    <p className="text-xs text-gray-400">Calling GET /api/brochure/download</p>
                  </div>
                ) : fetchError ? (
                  <div className="p-8 text-center max-w-md space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Unable to Load Brochure</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{fetchError}</p>
                    <button
                      type="button"
                      onClick={() => loadCurrentBrochure()}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 cursor-pointer"
                    >
                      Try Again
                    </button>
                  </div>
                ) : currentBrochure ? (
                  <iframe
                    src={currentBrochure.url}
                    title="KaizenCon 2027 Official Brochure Preview"
                    className="w-full h-full min-h-[520px] rounded-xl border-none bg-white"
                  />
                ) : (
                  /* Meaningful Empty State */
                  <div className="flex flex-col items-center justify-center p-8 text-center max-w-sm space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700">
                      <PdfFileIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-900 dark:text-white">
                        No Brochure Uploaded Yet
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        There is currently no official brochure published in the database. Use the upload panel to upload a PDF brochure for KaizenCon 2027.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#AA2D7B] hover:bg-[#8F2366] text-white transition-colors cursor-pointer shadow-xs"
                    >
                      <CloudUploadIcon className="w-4 h-4" />
                      <span>Upload Brochure Now</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Upload New Brochure (5 cols on lg) */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Upload New Brochure
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Select a new PDF file to upload or replace the published brochure
                </p>
              </div>

              {/* Status alert when brochure exists */}
              {currentBrochure && (
                <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>Brochure Replacement Notice</span>
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300/90 leading-relaxed">
                    A brochure already exists. Uploading a new file will replace the current brochure using backend deletion and fresh upload.
                  </p>
                </div>
              )}

              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                  isDragging
                    ? "border-[#AA2D7B] bg-purple-50/50 dark:bg-purple-950/20 scale-[1.01]"
                    : "border-gray-300 dark:border-gray-700 hover:border-[#AA2D7B] dark:hover:border-[#AA2D7B] bg-gray-50/60 dark:bg-gray-800/30"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-[#AA2D7B]/10 text-[#AA2D7B] dark:bg-[#AA2D7B]/20 flex items-center justify-center mb-3">
                  <CloudUploadIcon className="w-7 h-7" />
                </div>

                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  Drag &amp; Drop PDF Brochure Here
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3">
                  or click to browse from your device
                </p>

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 shadow-2xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  Browse Files
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700/80 flex flex-wrap items-center justify-center gap-2 text-[11px] text-gray-400">
                  <span className="px-2 py-0.5 rounded bg-gray-200/60 dark:bg-gray-700/60 font-medium text-gray-600 dark:text-gray-300">
                    PDF Only
                  </span>
                  <span>•</span>
                  <span>Max size: <strong>25 MB</strong></span>
                  <span>•</span>
                  <span>Single file</span>
                </div>
              </div>

              {/* Selected File Details Card */}
              {selectedFile && (
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2.5 rounded-xl shrink-0 ${
                        validationError
                          ? "bg-red-50 text-red-600 dark:bg-red-950/40"
                          : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"
                      }`}>
                        <PdfFileIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate" title={selectedFile.name}>
                          {selectedFile.name}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleClearSelectedFile}
                      disabled={isUploading}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer disabled:opacity-50"
                      title="Clear selected file"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Validation Error Message */}
                  {validationError && (
                    <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-400 flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span>{validationError}</span>
                    </div>
                  )}

                  {/* Upload Progress Bar */}
                  {isUploading && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                        <span>Uploading brochure...</span>
                        <span className="font-bold">{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#55355E] to-[#AA2D7B] transition-all duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Upload Error Banner */}
                  {uploadError && (
                    <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-400 flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* Upload Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleUploadClick}
                      disabled={isUploading || !!validationError}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#55355E] via-[#7B3B70] to-[#AA2D7B] hover:opacity-95 shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Uploading ({uploadProgress}%)...</span>
                        </>
                      ) : (
                        <>
                          <CloudUploadIcon className="w-4 h-4" />
                          <span>
                            {currentBrochure ? "Replace & Upload Brochure" : "Upload Brochure"}
                          </span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleClearSelectedFile}
                      disabled={isUploading}
                      className="px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Information / API Specifications Card */}
              <div className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400 space-y-2">
                <h5 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Brochure Guidelines
                </h5>
                <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                  <li><strong>Target Endpoint:</strong> <code>POST /api/brochure/upload</code> (multipart/form-data)</li>
                  <li><strong>Download Endpoint:</strong> <code>GET /api/brochure/download</code></li>
                  <li><strong>Deletion Endpoint:</strong> <code>DELETE /api/brochure/delete</code></li>
                  <li><strong>Public Integration:</strong> The Hero Section on the website serves the live brochure directly from the backend.</li>
                </ul>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-gray-800 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 shrink-0">
                <TrashCanIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Delete Current Brochure?
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Are you sure you want to delete the official KaizenCon 2027 brochure? Once deleted, the public website will no longer have a brochure available for download until a new file is uploaded.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteBrochure}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete Brochure</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replace Confirmation Modal */}
      {showReplaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-gray-800 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 shrink-0">
                <CloudUploadIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Replace Existing Brochure?
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  A brochure is currently uploaded. Replacing it will remove the existing PDF and publish <strong>"{selectedFile?.name}"</strong> on the public website.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowReplaceModal(false)}
                disabled={isUploading}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReplaceModal(false);
                  executeUpload(true);
                }}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#AA2D7B] hover:bg-[#8F2366] shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <span>Yes, Replace &amp; Publish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

