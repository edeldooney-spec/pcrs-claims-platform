import { requirePractice } from "@/lib/auth";
import { getUploadsForPractice } from "@/db/queries/uploads";
import { UploadForm } from "@/components/upload-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusStyles: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
  uploaded: "outline",
  parsing: "secondary",
  analysing: "secondary",
  enriching: "secondary",
  complete: "default",
  failed: "destructive",
};

export default async function UploadPage() {
  const practice = await requirePractice();
  const pastUploads = await getUploadsForPractice(practice.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upload Claims Data</h1>
        <p className="text-muted-foreground text-sm">
          Upload your PCRS claims export (CSV or Excel) for analysis
        </p>
      </div>

      {/* Upload form */}
      <UploadForm practiceId={practice.id} />

      {/* Past uploads table */}
      {pastUploads.length > 0 && (
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
                {pastUploads.map((upload) => (
                  <TableRow key={upload.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {upload.originalFilename}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {upload.createdAt.toLocaleDateString("en-IE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusStyles[upload.status] ?? "outline"}>
                        {upload.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {upload.totalRecords?.toLocaleString() ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
