import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit2, Check, X } from "lucide-react";
import { ZipCountyClassification } from "./types";

interface DataTableProps {
  data: ZipCountyClassification[];
  onUpdateRecord: (id: string, designation: "Rural" | "Urban") => Promise<void>;
}

export const DataTable = ({ data, onUpdateRecord }: DataTableProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<"Rural" | "Urban">("Rural");

  const handleEdit = (item: ZipCountyClassification) => {
    setEditingId(item.id!);
    setEditValue(item.rural_urban_designation);
  };

  const handleSave = async (id: string) => {
    await onUpdateRecord(id, editValue);
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  return (
    <div className="max-h-96 overflow-y-auto border rounded">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ZIP Code</TableHead>
            <TableHead>State</TableHead>
            <TableHead>County</TableHead>
            <TableHead>Classification</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.zip_code}</TableCell>
              <TableCell>{item.state}</TableCell>
              <TableCell>{item.county_name}</TableCell>
              <TableCell>
                {editingId === item.id ? (
                  <Select value={editValue} onValueChange={(value: "Rural" | "Urban") => setEditValue(value)}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Rural">Rural</SelectItem>
                      <SelectItem value="Urban">Urban</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className={item.rural_urban_designation === "Rural" ? "text-green-600" : "text-blue-600"}>
                    {item.rural_urban_designation}
                  </span>
                )}
              </TableCell>
              <TableCell>
                {editingId === item.id ? (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSave(item.id!)}
                      className="h-8 w-8 p-0 text-green-600"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancel}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(item)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};