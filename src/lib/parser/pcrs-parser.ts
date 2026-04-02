import { z } from "zod";

// Schema for a parsed PCRS claim record
// Fields are preliminary — will be refined once we have sample PCRS export data
export const PcrsClaimSchema = z.object({
  claimCode: z.string().min(1),
  claimCategory: z.string().min(1),
  claimDate: z.coerce.date(),
  claimAmount: z.coerce.number(),
  clinicianId: z.string().optional(),
  patientRef: z.string().optional(),
});

export type PcrsClaim = z.infer<typeof PcrsClaimSchema>;

export type ParseResult = {
  valid: PcrsClaim[];
  invalid: { row: number; errors: string[] }[];
  totalRows: number;
};

// Parse CSV content into structured claim records
// Validates each row with Zod and separates valid from invalid
export async function parsePcrsExport(content: string): Promise<ParseResult> {
  const lines = content.trim().split("\n");
  if (lines.length < 2) {
    return { valid: [], invalid: [], totalRows: 0 };
  }

  // First line is header — normalize to lowercase, trim whitespace
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

  // Map header names to our schema fields
  // This mapping will need adjustment based on actual PCRS export format
  const columnMap = detectColumnMapping(headers);

  const valid: PcrsClaim[] = [];
  const invalid: { row: number; errors: string[] }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || values.every((v) => v.trim() === "")) continue;

    const raw: Record<string, string> = {};
    headers.forEach((header, idx) => {
      raw[header] = values[idx]?.trim() ?? "";
    });

    const mapped = {
      claimCode: raw[columnMap.claimCode] ?? "",
      claimCategory: raw[columnMap.claimCategory] ?? "",
      claimDate: raw[columnMap.claimDate] ?? "",
      claimAmount: raw[columnMap.claimAmount] ?? "",
      clinicianId: raw[columnMap.clinicianId] || undefined,
      patientRef: raw[columnMap.patientRef] || undefined,
    };

    const result = PcrsClaimSchema.safeParse(mapped);
    if (result.success) {
      valid.push(result.data);
    } else {
      invalid.push({
        row: i + 1,
        errors: result.error.issues.map(
          (issue) => `${issue.path.join(".")}: ${issue.message}`
        ),
      });
    }
  }

  return { valid, invalid, totalRows: lines.length - 1 };
}

// Detect which CSV columns map to our schema fields
// Uses fuzzy matching on common PCRS export column names
function detectColumnMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {
    claimCode: "",
    claimCategory: "",
    claimDate: "",
    claimAmount: "",
    clinicianId: "",
    patientRef: "",
  };

  // Common column name patterns for PCRS exports
  const patterns: Record<string, RegExp[]> = {
    claimCode: [/claim.?code/i, /item.?code/i, /service.?code/i, /code/i],
    claimCategory: [/category/i, /claim.?type/i, /service.?type/i, /type/i],
    claimDate: [/date/i, /claim.?date/i, /service.?date/i],
    claimAmount: [/amount/i, /value/i, /fee/i, /claim.?amount/i],
    clinicianId: [/clinician/i, /doctor/i, /gp/i, /provider/i],
    patientRef: [/patient/i, /pps/i, /ref/i, /client/i],
  };

  for (const [field, regexes] of Object.entries(patterns)) {
    for (const regex of regexes) {
      const match = headers.find((h) => regex.test(h));
      if (match) {
        mapping[field] = match;
        break;
      }
    }
  }

  return mapping;
}

// Parse a single CSV line, handling quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);

  return result;
}
