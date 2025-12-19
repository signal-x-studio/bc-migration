'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Settings,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  FileJson,
  Calendar,
  Store,
  FolderTree,
  Package,
  Users,
  Loader2,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useConnection } from '@/lib/contexts/ConnectionContext';
import { useBCConnection } from '@/lib/contexts/BCConnectionContext';
import {
  downloadMigrationExport,
  importMigrationState,
  exportMigrationState,
  MigrationExport,
} from '@/lib/storage';

export default function SettingsPage() {
  const { credentials: wcCredentials } = useConnection();
  const { credentials: bcCredentials, isConnected: bcConnected } = useBCConnection();

  const [importResult, setImportResult] = useState<{ success: boolean; errors: string[] } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<MigrationExport | null>(null);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportPreview, setExportPreview] = useState<MigrationExport | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setImportResult(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text) as MigrationExport;
      setPreviewData(data);
    } catch (err) {
      setImportResult({
        success: false,
        errors: ['Invalid JSON file. Please select a valid migration export file.'],
      });
      setPreviewData(null);
    }
  };

  const handleImport = async () => {
    if (!previewData) return;

    setIsImporting(true);

    // Simulate async operation for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const result = importMigrationState(previewData, { overwrite: overwriteExisting });
    setImportResult(result);
    setIsImporting(false);

    if (result.success) {
      // Clear the preview after successful import
      setPreviewData(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExport = () => {
    if (!wcCredentials?.url || !bcCredentials?.storeHash) return;
    downloadMigrationExport(wcCredentials.url, bcCredentials.storeHash);
  };

  const handleShowExportPreview = () => {
    if (!wcCredentials?.url || !bcCredentials?.storeHash) return;
    const data = exportMigrationState(wcCredentials.url, bcCredentials.storeHash);
    setExportPreview(data);
  };

  const clearFileSelection = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isConnected = wcCredentials?.url && bcConnected;

  return (
    <main className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-lg bg-gray-700">
            <Settings className="w-8 h-8 text-gray-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-gray-400">
              Export, import, and manage your migration state
            </p>
          </div>
        </div>

        {!isConnected && (
          <Alert variant="warning" className="mb-6">
            <p className="font-medium">Connection Required</p>
            <p className="text-sm text-gray-400 mt-1">
              Please connect to both WooCommerce and BigCommerce stores to use export/import features.
            </p>
          </Alert>
        )}

        {/* Export Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-400" />
              Export Migration State
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400">
              Export your current migration progress, ID mappings, and checklist state to a JSON file.
              This allows you to backup your progress or transfer it to another machine.
            </p>

            {isConnected && (
              <div className="p-4 bg-gray-800/50 rounded-lg text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-400">WC Store:</span>
                    <span className="text-white truncate">{wcCredentials?.url}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-400">BC Store:</span>
                    <span className="text-white">{bcCredentials?.storeHash}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button
                onClick={handleExport}
                disabled={!isConnected}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Export
              </Button>
              <Button
                variant="secondary"
                onClick={handleShowExportPreview}
                disabled={!isConnected}
              >
                <FileJson className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>

            {/* Export Preview */}
            {exportPreview && (
              <div className="mt-4 p-4 bg-gray-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">Export Preview</h4>
                  <button
                    onClick={() => setExportPreview(null)}
                    className="text-gray-500 hover:text-gray-300"
                  >
                    &times;
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-gray-700/50 rounded">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <FolderTree className="w-4 h-4" />
                      Categories
                    </div>
                    <div className="text-xl font-bold text-white">
                      {Object.keys(exportPreview.mappings?.categories || {}).length}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-700/50 rounded">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <Package className="w-4 h-4" />
                      Products
                    </div>
                    <div className="text-xl font-bold text-white">
                      {Object.keys(exportPreview.mappings?.products || {}).length}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-700/50 rounded">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <Users className="w-4 h-4" />
                      Customers
                    </div>
                    <div className="text-xl font-bold text-white">
                      {Object.keys(exportPreview.mappings?.customers || {}).length}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(exportPreview.exportDate).toLocaleString()}
                  </span>
                  <span>Version: {exportPreview.version}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Import Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-green-400" />
              Import Migration State
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400">
              Restore a previously exported migration state. This will restore ID mappings,
              progress tracking, and checklist state.
            </p>

            {/* File Input */}
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileJson className="w-4 h-4 mr-2" />
                Select JSON File
              </Button>
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>{selectedFile.name}</span>
                  <button
                    onClick={clearFileSelection}
                    className="text-gray-500 hover:text-gray-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Import Preview */}
            {previewData && (
              <div className="p-4 bg-gray-800 rounded-lg space-y-4">
                <h4 className="font-medium text-white">Import Preview</h4>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">WC Store:</span>
                    <span className="text-white ml-2">{previewData.wcStore}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">BC Store:</span>
                    <span className="text-white ml-2">{previewData.bcStore}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-gray-700/50 rounded">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <FolderTree className="w-4 h-4" />
                      Categories
                    </div>
                    <div className="text-xl font-bold text-white">
                      {Object.keys(previewData.mappings?.categories || {}).length}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-700/50 rounded">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <Package className="w-4 h-4" />
                      Products
                    </div>
                    <div className="text-xl font-bold text-white">
                      {Object.keys(previewData.mappings?.products || {}).length}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-700/50 rounded">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <Users className="w-4 h-4" />
                      Customers
                    </div>
                    <div className="text-xl font-bold text-white">
                      {Object.keys(previewData.mappings?.customers || {}).length}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Exported: {new Date(previewData.exportDate).toLocaleString()}
                  </span>
                  <span>Version: {previewData.version}</span>
                </div>

                {/* Overwrite Option */}
                <label className="flex items-center gap-3 p-3 bg-gray-700/50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overwriteExisting}
                    onChange={e => setOverwriteExisting(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-blue-500"
                  />
                  <div>
                    <div className="text-white text-sm">Overwrite existing data</div>
                    <div className="text-xs text-gray-500">
                      If unchecked, existing state will be preserved and only missing data imported
                    </div>
                  </div>
                </label>

                <Button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="w-full"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Import State
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Import Result */}
            {importResult && (
              <Alert variant={importResult.success ? 'success' : 'error'}>
                <div className="flex items-start gap-2">
                  {importResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                  <div>
                    <p className="font-medium">
                      {importResult.success ? 'Import Successful' : 'Import Failed'}
                    </p>
                    {importResult.errors.length > 0 && (
                      <ul className="text-sm mt-1 space-y-1">
                        {importResult.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    )}
                    {importResult.success && (
                      <p className="text-sm text-gray-400 mt-1">
                        Refresh the page or navigate to the migration wizard to see restored state.
                      </p>
                    )}
                  </div>
                </div>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Clear Data Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              Reset Local State
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400">
              Clear all locally stored migration state. This will not affect any data
              already migrated to BigCommerce.
            </p>

            <Alert variant="warning">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="font-medium text-white">Export First</p>
                  <p className="text-sm text-gray-400">
                    Consider exporting your state before clearing. This cannot be undone.
                  </p>
                </div>
              </div>
            </Alert>

            <Button
              variant="danger"
              onClick={() => {
                if (confirm('Are you sure you want to clear all local migration state? This cannot be undone.')) {
                  // Clear all migration-related localStorage keys
                  const keysToRemove: string[] = [];
                  for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key?.startsWith('wc-migration-')) {
                      keysToRemove.push(key);
                    }
                  }
                  keysToRemove.forEach(key => localStorage.removeItem(key));
                  window.location.reload();
                }
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear All Local State
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
