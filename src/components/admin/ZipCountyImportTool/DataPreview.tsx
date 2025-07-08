import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ZipCountyClassification } from "./types";

interface DataPreviewProps {
  data: ZipCountyClassification[];
}

export const DataPreview = ({ data }: DataPreviewProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Preview ({data.length} records)</h3>
      <div className="max-h-64 overflow-y-auto border rounded">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ZIP Code</TableHead>
              <TableHead>State</TableHead>
              <TableHead>County</TableHead>
              <TableHead>Classification</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(0, 10).map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{item.zip_code}</TableCell>
                <TableCell>{item.state}</TableCell>
                <TableCell>{item.county_name}</TableCell>
                <TableCell>{item.rural_urban_designation}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {data.length > 10 && (
        <p className="text-sm text-muted-foreground mt-2">
          Showing first 10 of {data.length} records
        </p>
      )}
    </div>
  );
};