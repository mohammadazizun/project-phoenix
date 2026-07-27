import React, { useState, useRef } from 'react';
import {
  ImportExportSchemaConfig,
  ImportPreviewSummary,
  ImportExecutionResult,
} from '../../services/importExportEngine/types';
import { FileParser, ParsedFileData } from '../../services/importExportEngine/FileParser';
import { ImportEngine } from '../../services/importExportEngine/ImportEngine';
import { TemplateGenerator } from '../../services/importExportEngine/TemplateGenerator';
import { HistoryService } from '../../services/importExportEngine/HistoryService';
import {
  Upload,
  FileSpreadsheet,
  Download,
  X,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  FileText,
  ShieldCheck,
  Check,
  Filter,
} from 'lucide-react';

interface ImportWizardModalProps<T = any> {
  isOpen: boolean;
  schema: ImportExportSchemaConfig<T>;
  existingRecords: T[];
  organizationId: string;
  onClose: () => void;
  onPersist: (records: Partial<T>[]) => Promise<{ success: boolean; inserted: T[]; error?: string }>;
  onSuccessComplete: (count: number, records: T[]) => void;
}

export function ImportWizardModal<T = any>({
  isOpen,
  schema,
  existingRecords,
  organizationId,
  onClose,
  onPersist,
  onSuccessComplete,
}: ImportWizardModalProps<T>) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedFileData | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Mapping state
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});

  // Preview & Validation summary state
  const [validationSummary, setValidationSummary] = useState<ImportPreviewSummary<T> | null>(null);

  // Import options
  const [skipInvalidRows, setSkipInvalidRows] = useState(true);

  // Execution state
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ImportExecutionResult<T> | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setStep(1);
    setSelectedFile(null);
    setParsedData(null);
    setParsing(false);
    setParseError(null);
    setColumnMappings({});
    setValidationSummary(null);
    setExecutionResult(null);
    setExecuting(false);
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setParsing(true);
    setParseError(null);

    try {
      const parsed = await FileParser.parseFile(file);
      if (parsed.rows.length === 0) {
        throw new Error('The selected file contains no data rows.');
      }
      setParsedData(parsed);

      // Automatically infer header mappings
      const initialMappings = ImportEngine.mapHeaders(parsed.headers, schema);
      setColumnMappings(initialMappings);

      setStep(2);
    } catch (err: any) {
      setParseError(err.message || 'Failed to parse file.');
    } finally {
      setParsing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleProceedToPreview = () => {
    if (!parsedData) return;

    const summary = ImportEngine.validateDataset(
      parsedData,
      columnMappings,
      schema,
      existingRecords,
      organizationId
    );

    setValidationSummary(summary);
    setStep(3);
  };

  const handleRunImport = async () => {
    if (!validationSummary || !selectedFile) return;

    setExecuting(true);
    setStep(4);

    const result = await ImportEngine.executeImport(
      validationSummary,
      onPersist,
      selectedFile.name,
      skipInvalidRows
    );

    setExecuting(false);
    setExecutionResult(result);

    if (result.success) {
      // Record history
      HistoryService.recordOperation({
        moduleName: schema.moduleName,
        operation: 'import',
        format: parsedData?.fileType || 'csv',
        totalRecords: result.totalProcessed,
        successCount: result.importedCount,
        errorCount: result.failedCount,
        fileName: selectedFile.name,
        status: result.failedCount === 0 ? 'completed' : 'partial',
      });

      onSuccessComplete(result.importedCount, result.importedRecords);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Upload className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">
                Import {schema.entityNamePlural} Data
              </h3>
              <p className="text-xs text-slate-400">
                Step {step} of 4 &bull; Reusable Import Engine &bull; {schema.moduleName}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold border-b border-slate-800 pb-3 shrink-0">
          <div
            className={`py-1.5 rounded-lg border transition-all ${
              step === 1
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50'
                : step > 1
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800/40 text-slate-500 border-slate-800'
            }`}
          >
            1. Select File
          </div>
          <div
            className={`py-1.5 rounded-lg border transition-all ${
              step === 2
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50'
                : step > 2
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800/40 text-slate-500 border-slate-800'
            }`}
          >
            2. Map Headers
          </div>
          <div
            className={`py-1.5 rounded-lg border transition-all ${
              step === 3
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50'
                : step > 3
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800/40 text-slate-500 border-slate-800'
            }`}
          >
            3. Preview & Validate
          </div>
          <div
            className={`py-1.5 rounded-lg border transition-all ${
              step === 4
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50'
                : 'bg-slate-800/40 text-slate-500 border-slate-800'
            }`}
          >
            4. Completion
          </div>
        </div>

        {/* Step 1: Upload & Download Template */}
        {step === 1 && (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-4 flex items-center justify-between text-xs">
              <div className="space-y-1">
                <div className="font-bold text-slate-200">Need an import template?</div>
                <div className="text-slate-400">
                  Download a pre-formatted CSV or XLSX template with field guidelines and sample rows.
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => TemplateGenerator.downloadTemplate(schema, 'csv')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => TemplateGenerator.downloadTemplate(schema, 'xlsx')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1.5 shadow transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>XLSX</span>
                </button>
              </div>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-indigo-500/80 bg-slate-800/20 hover:bg-slate-800/40 rounded-2xl p-8 text-center space-y-3 cursor-pointer transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
              <div className="w-12 h-12 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Click or drag & drop file to upload</p>
                <p className="text-xs text-slate-400 mt-0.5">Supports CSV, XLSX, XLS (max 10,000 rows)</p>
              </div>
            </div>

            {parsing && (
              <div className="flex items-center justify-center gap-2 text-xs text-indigo-400 py-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Parsing file structure and headers...</span>
              </div>
            )}

            {parseError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{parseError}</span>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Column Mapping */}
        {step === 2 && parsedData && (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1 text-xs">
            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white">{parsedData.fileName}</span> &bull;{' '}
                <span className="text-slate-400 font-mono">
                  {parsedData.rows.length} rows detected
                </span>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-indigo-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Change file
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Verify File Header Mappings
              </h4>
              <p className="text-slate-400 text-[11px]">
                Match columns in your uploaded file with schema fields. Required fields are marked with *.
              </p>

              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
                <table className="w-full text-left">
                  <thead className="bg-slate-800/80 text-[10px] text-slate-400 uppercase font-bold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Uploaded File Column</th>
                      <th className="py-2.5 px-3">Target Schema Field</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {parsedData.headers.map((header) => {
                      const currentKey = columnMappings[header] || '';
                      const matchedField = schema.fields.find((f) => String(f.key) === currentKey);

                      return (
                        <tr key={header} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 font-semibold text-slate-200">{header}</td>
                          <td className="py-2.5 px-3">
                            <select
                              value={currentKey}
                              onChange={(e) =>
                                setColumnMappings({ ...columnMappings, [header]: e.target.value })
                              }
                              className="bg-slate-800 border border-slate-700 text-slate-200 rounded p-1.5 w-full cursor-pointer focus:border-indigo-500"
                            >
                              <option value="">-- Do Not Import --</option>
                              {schema.fields.map((f) => (
                                <option key={String(f.key)} value={String(f.key)}>
                                  {f.label} {f.required ? '*' : ''}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2.5 px-3">
                            {matchedField ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Mapped
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                                Ignored
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Preview & Row Validation Summary */}
        {step === 3 && validationSummary && (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1 text-xs">
            {/* Stat Cards */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Total File Rows</div>
                <div className="text-base font-bold font-mono text-white mt-0.5">
                  {validationSummary.totalRows}
                </div>
              </div>
              <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/30">
                <div className="text-[10px] text-emerald-400 uppercase font-bold">Valid Rows</div>
                <div className="text-base font-bold font-mono text-emerald-300 mt-0.5">
                  {validationSummary.validCount}
                </div>
              </div>
              <div className="bg-rose-500/10 p-3 rounded-xl border border-rose-500/30">
                <div className="text-[10px] text-rose-400 uppercase font-bold">Invalid Rows</div>
                <div className="text-base font-bold font-mono text-rose-300 mt-0.5">
                  {validationSummary.invalidCount}
                </div>
              </div>
              <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/30">
                <div className="text-[10px] text-amber-400 uppercase font-bold">Duplicates</div>
                <div className="text-base font-bold font-mono text-amber-300 mt-0.5">
                  {validationSummary.duplicateCount}
                </div>
              </div>
            </div>

            {/* Error handling options */}
            {validationSummary.invalidCount > 0 && (
              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-slate-300 font-medium">
                    {validationSummary.invalidCount} rows have validation errors.
                  </span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-200">
                  <input
                    type="checkbox"
                    checked={skipInvalidRows}
                    onChange={(e) => setSkipInvalidRows(e.target.checked)}
                    className="accent-indigo-500 w-4 h-4 rounded cursor-pointer"
                  />
                  <span>Skip invalid rows & import valid records only</span>
                </label>
              </div>
            )}

            {/* Row Validation Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-800 text-[10px] text-slate-400 uppercase font-bold border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Row #</th>
                      <th className="py-2 px-3">Candidate Record</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3">Validation Issues</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {validationSummary.validatedRows.map((row) => (
                      <tr
                        key={row.rowIndex}
                        className={
                          row.isValid
                            ? 'hover:bg-slate-800/30'
                            : 'bg-rose-500/5 hover:bg-rose-500/10'
                        }
                      >
                        <td className="py-2 px-3 font-mono font-bold text-slate-400">
                          #{row.rowIndex}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-200 max-w-xs truncate">
                          {row.entityCandidate.customerCode || row.entityCandidate.name || 'Row Record'}
                          {row.entityCandidate.email && (
                            <span className="text-slate-400 text-[10px] block font-mono">
                              {row.entityCandidate.email}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          {row.isValid ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Valid
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              Error
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-[10px] text-slate-300">
                          {row.errors.length > 0 ? (
                            <div className="text-rose-400 font-medium">
                              {row.errors.map((e) => e.message).join(' | ')}
                            </div>
                          ) : row.warnings.length > 0 ? (
                            <div className="text-amber-400 font-medium">
                              {row.warnings.map((w) => w.message).join(' | ')}
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">No issues</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Execution & Completion Summary */}
        {step === 4 && (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1 text-xs">
            {executing ? (
              <div className="py-12 text-center space-y-3">
                <div className="inline-block animate-spin w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full" />
                <h4 className="text-sm font-bold text-white">Importing Customer Records...</h4>
                <p className="text-slate-400">
                  Writing records into repository with organization security isolation and events...
                </p>
              </div>
            ) : executionResult ? (
              <div className="space-y-4">
                {executionResult.success ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white">
                      Import Operation Completed Successfully!
                    </h3>
                    <p className="text-slate-300">
                      Successfully imported{' '}
                      <strong className="text-emerald-400 font-bold font-mono">
                        {executionResult.importedCount}
                      </strong>{' '}
                      records into the database.
                    </p>
                  </div>
                ) : (
                  <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white">Import Failed or Rolled Back</h3>
                    <p className="text-rose-300">
                      {executionResult.errors[0]?.message || 'Failed to complete import process.'}
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4 shrink-0 text-xs font-bold">
          {step > 1 && step < 4 ? (
            <button
              onClick={() => setStep((prev) => (prev - 1) as any)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {step === 4 ? 'Close' : 'Cancel'}
            </button>

            {step === 2 && (
              <button
                type="button"
                onClick={handleProceedToPreview}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
              >
                <span>Validate & Preview</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={handleRunImport}
                disabled={validationSummary?.validCount === 0}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1.5 shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                <span>Confirm & Import Records</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
