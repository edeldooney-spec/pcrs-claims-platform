"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadClaimsFile } from "@/actions/upload-claims";

type UploadState = "idle" | "uploading" | "success" | "error";

export function UploadForm({ practiceId }: { practiceId: string }) {
  const [state, setState] = useState<UploadState>("idle");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = useCallback((file: File) => {
    // Validate file type
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const validExtensions = [".csv", ".xls", ".xlsx"];
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));

    if (!validTypes.includes(file.type) && !validExtensions.includes(ext)) {
      setError("Please upload a CSV or Excel file (.csv, .xls, .xlsx)");
      return;
    }

    // 50MB limit
    if (file.size > 50 * 1024 * 1024) {
      setError("File size must be under 50MB");
      return;
    }

    setError(null);
    setSelectedFile(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (!selectedFile) return;

    setState("uploading");
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("practiceId", practiceId);

    const result = await uploadClaimsFile(formData);

    if (result.success) {
      setState("success");
      setSelectedFile(null);
    } else {
      setState("error");
      setError(result.error ?? "Upload failed");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upload PCRS Export</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          )}
        >
          {state === "success" ? (
            <>
              <CheckCircle2 className="h-10 w-10 text-green-500 mb-3" />
              <p className="text-sm font-medium">Upload successful!</p>
              <p className="text-xs text-muted-foreground">
                Your file is being processed. Check back shortly for results.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  setState("idle");
                  setSelectedFile(null);
                }}
              >
                Upload Another
              </Button>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">
                Drag and drop your PCRS export here
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                CSV or Excel files up to 50MB
              </p>
              <label>
                <input
                  type="file"
                  className="hidden"
                  accept=".csv,.xls,.xlsx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
                <span className="cursor-pointer inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background px-2.5 h-7 text-[0.8rem] font-medium hover:bg-muted transition-colors">
                  Browse Files
                </span>
              </label>
            </>
          )}
        </div>

        {/* Selected file info */}
        {selectedFile && state !== "success" && (
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              onClick={handleUpload}
              disabled={state === "uploading"}
              size="sm"
            >
              {state === "uploading" ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload & Analyse"
              )}
            </Button>
          </div>
        )}

        {/* Error display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
