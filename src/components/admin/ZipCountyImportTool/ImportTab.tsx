import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, AlertTriangle } from "lucide-react";
import { ParsedData } from "./types";
import { downloadTemplate, parseCSV } from "./utils";
import { DataPreview } from "./DataPreview";

interface ImportTabProps {
  parsedData: ParsedData | null;
  setParsedData: (data: ParsedData | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onImport: () => Promise<void>;
  onToast: (options: { title: string; description: string; variant?: "destructive" }) => void;
}

export const ImportTab = ({
  parsedData,
  setParsedData,
  isLoading,
  setIsLoading,
  onImport,
  onToast
}: ImportTabProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      onToast({
        title: "Invalid File",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      setParsedData(parsed);

      if (parsed.errors.length === 0) {
        onToast({
          title: "File Parsed Successfully",
          description: `${parsed.valid.length} records ready to import`
        });
      } else {
        onToast({
          title: "Parsing Errors Found",
          description: `${parsed.errors.length} errors found. Please review before importing.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      onToast({
        title: "Error Reading File",
        description: "Failed to parse the CSV file",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Button
          onClick={downloadTemplate}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Template
        </Button>

        <div className="flex-1">
          <Label htmlFor="csv-upload">Upload CSV File</Label>
          <Input
            id="csv-upload"
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="mt-1"
          />
        </div>
      </div>

      {parsedData && (
        <div className="space-y-4">
          {parsedData.errors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Found {parsedData.errors.length} errors. Please fix these before importing:
                <ul className="mt-2 list-disc list-inside">
                  {parsedData.errors.slice(0, 5).map((error, idx) => (
                    <li key={idx}>Row {error.row}: {error.errors.join(", ")}</li>
                  ))}
                  {parsedData.errors.length > 5 && <li>...and {parsedData.errors.length - 5} more</li>}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {parsedData.valid.length > 0 && (
            <DataPreview data={parsedData.valid} />
          )}

          <Button
            onClick={onImport}
            disabled={isLoading || parsedData.errors.length > 0 || parsedData.valid.length === 0}
            className="w-full"
          >
            {isLoading ? "Importing..." : `Import ${parsedData.valid.length} Records`}
          </Button>
        </div>
      )}
    </div>
  );
};