import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, FileText } from "lucide-react";

const mockUploads = [
  {
    id: "1",
    filename: "PCRS_Claims_Q1_2026.csv",
    date: "3 Apr 2026",
    status: "complete",
    records: 1406,
  },
  {
    id: "2",
    filename: "PCRS_Claims_Q4_2025.csv",
    date: "8 Jan 2026",
    status: "complete",
    records: 1289,
  },
  {
    id: "3",
    filename: "PCRS_Claims_Q3_2025.xlsx",
    date: "5 Oct 2025",
    status: "complete",
    records: 1152,
  },
];

const statusStyles: Record<
  string,
  "default" | "destructive" | "outline" | "secondary"
> = {
  uploaded: "outline",
  parsing: "secondary",
  analysing: "secondary",
  enriching: "secondary",
  complete: "default",
  failed: "destructive",
};

export default function PreviewUploadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upload Claims Data</h1>
        <p className="text-muted-foreground text-sm">
          Upload your PCRS claims export (CSV or Excel) for analysis
        </p>
      </div>

      {/* Upload zone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload PCRS Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 hover:border-muted-foreground/50 transition-colors cursor-pointer">
            <Upload className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm font-medium">
              Drag and drop your PCRS export here
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              CSV or Excel files up to 50MB
            </p>
            <Button variant="outline" size="sm">
              Browse Files
            </Button>
          </div>

          {/* Simulated selected file */}
          <div className="flex items-center gap-3 rounded-lg border p-3 mt-4">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                PCRS_Claims_Q2_2026.csv
              </p>
              <p className="text-xs text-muted-foreground">245.3 KB</p>
            </div>
            <Button size="sm">Upload & Analyse</Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Records</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUploads.map((upload) => (
                <TableRow key={upload.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {upload.filename}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {upload.date}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusStyles[upload.status] ?? "outline"}>
                      {upload.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {upload.records.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
