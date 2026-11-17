import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import { AdminPageContainer } from "../../components/common/AdminPageContainer";
import { useToast } from "../../context/ToastContext";
import {
  syncKnowledgeDb,
  getKnowledgeDocuments,
  uploadKnowledgeDocument,
  deleteKnowledgeDocument,
  formatFileSize,
} from "../../api/ApiPath";
import {
  CloudUploadIcon,
  TrashCanIcon,
  PdfFileIcon,
  MicrophoneIcon,
  WaveformIcon,
} from "../../icons/conferenceIcons";

interface SyncResults {
  speakers?: number;
  schedule?: number;
  delegates?: number;
  syncedAt?: string;
}

interface KnowledgeDocument {
  id: number | string;
  filename: string;
  file_type?: string;
  file_size?: number;
  status?: string;
  error_message?: string | null;
  chunks_created?: number;
  embedding_model?: string;
  created_at?: string;
}

export default function KaiPage() {
  const { success, error: toastError } = useToast();

  // Sync DB State
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncResults, setSyncResults] = useState<SyncResults | null>(null);

  // Documents State
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);
  const [docsError, setDocsError] = useState<string | null>(null);

  // Upload State
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete Modal State
  const [deletingDoc, setDeletingDoc] = useState<KnowledgeDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Search filter for documents
  const [searchTerm, setSearchTerm] = useState<string>("");

  /**
   * Fetch Knowledge Documents
   */
  const loadDocuments = useCallback(async () => {
    setIsLoadingDocs(true);
    setDocsError(null);
    try {
      const response = await getKnowledgeDocuments();
      if (response && Array.isArray(response.results)) {
        setDocuments(response.results);
      } else if (Array.isArray(response)) {
        setDocuments(response);
      } else {
        setDocuments([]);
      }
    } catch (err: any) {
      console.error("Failed to load knowledge documents:", err);
      setDocsError(err.message || "Failed to load documents");
    } finally {
      setIsLoadingDocs(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  /**
   * Trigger Sync Database API
   * POST /api/knowledge/sync-db
   */
  const handleSyncDb = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await syncKnowledgeDb();
      const rawResults = res?.results as any;
      const resultObj: any =
        Array.isArray(rawResults) && rawResults.length > 0
          ? rawResults[0]
          : rawResults || {};

      const newResults: SyncResults = {
        speakers: resultObj?.speakers ?? 0,
        schedule: resultObj?.schedule ?? 0,
        delegates: resultObj?.delegates ?? 0,
        syncedAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      };

      setSyncResults(newResults);
      success(
        `Database synced with KAi successfully! (${newResults.speakers} Speakers, ${newResults.schedule} Schedules, ${newResults.delegates} Delegates)`
      );
    } catch (err: any) {
      console.error("Sync DB failed:", err);
      toastError(err.message || "Database synchronization failed. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Upload Document
   */
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || isUploading) return;

    setIsUploading(true);
    try {
      await uploadKnowledgeDocument(selectedFile);
      success(`"${selectedFile.name}" uploaded and indexed successfully!`);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      loadDocuments();
    } catch (err: any) {
      console.error("Upload failed:", err);
      toastError(err.message || "Document upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Delete Document
   */
  const handleDeleteConfirm = async () => {
    if (!deletingDoc || isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteKnowledgeDocument(deletingDoc.id);
      success(`Document "${deletingDoc.filename}" removed from knowledge base.`);
      setDeletingDoc(null);
      loadDocuments();
    } catch (err: any) {
      console.error("Delete failed:", err);
      toastError(err.message || "Failed to delete document.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    (doc.filename || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <PageMeta
        title="KAi - Knowledge AI Assistant | KaizenCon Admin"
        description="Sync conference database with KAi and manage vector knowledge base documents."
      />

      <AdminPageContainer
        title="KAi"
        subtitle={
          syncResults?.syncedAt
            ? `Database Synced (${syncResults.syncedAt}) — Speakers: ${syncResults.speakers}, Schedules: ${syncResults.schedule}, Delegates: ${syncResults.delegates}`
            : "Synchronize database with KAi vector store and manage reference documents"
        }
        actionButton={
          <div className="flex items-center gap-2">
            {/* Live Transcript Button */}
            <Link
              to="/kai/live-transcript"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
              title="Open Live Audio Transcript & Speaker Diarization in new tab"
            >
              <MicrophoneIcon className="w-3.5 h-3.5" />
              <span>Live Transcript</span>
              <svg className="w-3 h-3 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>

            {/* Sync DB Button */}
            <button
              type="button"
              onClick={handleSyncDb}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-60"
              title="Sync database with KAi (POST /api/knowledge/sync-db)"
            >
              <svg
                className={`w-3.5 h-3.5 text-gray-500 dark:text-gray-400 ${
                  isSyncing ? "animate-spin text-[#AA2D7B]" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
              <span>{isSyncing ? "Syncing..." : "Sync DB"}</span>
            </button>
          </div>
        }
      >
        <div className="p-5 md:p-6 space-y-6">
          {/* FEATURE BANNER: LIVE AUDIO TRANSCRIPT */}
          <div className="rounded-xl p-4 bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-indigo-800/90 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-indigo-500/20">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-indigo-300 flex-shrink-0">
                <WaveformIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <span>Live Speech-to-Text &amp; Speaker Diarization</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    ElevenLabs Scribe
                  </span>
                </h4>
                <p className="text-xs text-indigo-200/80 mt-0.5">
                  Record conference microphones live or upload audio files to generate real-time transcripts identifying which speaker speaks each line.
                </p>
              </div>
            </div>
            <Link
              to="/kai/live-transcript"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-white text-indigo-900 hover:bg-indigo-50 rounded-lg shadow-sm transition-all flex-shrink-0 cursor-pointer"
            >
              <MicrophoneIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Launch Live Transcript</span>
              <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>

          {/* SECTION: DOCUMENT UPLOAD & LIST */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Upload Document Card */}
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CloudUploadIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Upload Knowledge Document
                  </h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                  Upload PDF or text documents (handbooks, abstracts, whitepapers) to index
                  them directly into the KAi knowledge embeddings.
                </p>

                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-5 text-center hover:border-indigo-500 transition-colors bg-gray-50/50 dark:bg-gray-700/30">
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="docFileInput"
                      className="hidden"
                      accept=".pdf,.txt,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setSelectedFile(file);
                      }}
                    />
                    <label
                      htmlFor="docFileInput"
                      className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                    >
                      <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <PdfFileIcon className="w-6 h-6" />
                      </div>
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        {selectedFile ? selectedFile.name : "Click to select a document"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {selectedFile
                          ? `Size: ${formatFileSize(selectedFile.size)}`
                          : "Supports PDF, TXT, DOCX"}
                      </div>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={!selectedFile || isUploading}
                    className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                      !selectedFile || isUploading
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow"
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Uploading & Indexing...</span>
                      </>
                    ) : (
                      <>
                        <CloudUploadIcon className="w-4 h-4" />
                        <span>Upload to KAi</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400">
                Uploaded documents are segmented into chunks and embedded using Gemini AI for semantic search.
              </div>
            </div>

            {/* Right: Indexed Documents List */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-xs flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>Indexed Knowledge Documents</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                      {documents.length}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Documents currently available for attendee Q&amp;A retrieval
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Filter documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={loadDocuments}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {/* Documents Table */}
              <div className="overflow-x-auto flex-1">
                {isLoadingDocs ? (
                  <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                    <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
                    <span className="text-xs">Loading documents...</span>
                  </div>
                ) : docsError ? (
                  <div className="py-12 text-center text-red-500 text-xs">
                    {docsError}
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs">
                    No indexed documents found.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <th className="py-2.5 px-3">Document</th>
                        <th className="py-2.5 px-3">Size</th>
                        <th className="py-2.5 px-3">Chunks</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                      {filteredDocuments.map((doc) => (
                        <tr
                          key={doc.id}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors"
                        >
                          <td className="py-3 px-3 font-medium text-gray-800 dark:text-gray-200">
                            <div className="flex items-center gap-2">
                              <PdfFileIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
                              <span className="truncate max-w-[200px] sm:max-w-[280px]" title={doc.filename}>
                                {doc.filename}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-gray-500 dark:text-gray-400">
                            {doc.file_size ? formatFileSize(doc.file_size) : "-"}
                          </td>
                          <td className="py-3 px-3 text-gray-500 dark:text-gray-400">
                            {doc.chunks_created ?? "-"}
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                              {doc.status || "indexed"}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => setDeletingDoc(doc)}
                              className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete Document"
                            >
                              <TrashCanIcon className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </AdminPageContainer>

      {/* DELETE CONFIRMATION MODAL */}
      {deletingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Delete Document
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to remove{" "}
              <strong className="text-gray-900 dark:text-white">
                {deletingDoc.filename}
              </strong>{" "}
              from the KAi knowledge base? The embedded chunks will no longer be available for AI search.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeletingDoc(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {isDeleting ? "Deleting..." : "Delete Document"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
