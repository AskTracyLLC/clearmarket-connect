import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Download, Search, Edit2, Save, X, Check, AlertTriangle } from "lucide-react";

interface ZipCountyClassification {
  id?: string;
  zip_code: string;
  state: string;
  county_name: string;
  rural_urban_designation: "Rural" | "Urban";
}

interface ParsedData {
  valid: ZipCountyClassification[];
  errors: { row: number; errors: string[] }[];
}

export const ZipCountyImportTool = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [existingData, setExistingData] = useState<ZipCountyClassification[]>([]);
  const [filteredData, setFilteredData] = useState<ZipCountyClassification[]>([]);
  const [searchZip, setSearchZip] = useState("");
  const [searchCounty, setSearchCounty] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterRuralUrban, setFilterRuralUrban] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<"Rural" | "Urban">("Rural");

  // Download template CSV
  const downloadTemplate = () => {
    const templateData = [
      "Zip_Code,State,County_Name,Rural_Urban_Designation",
      "60616,IL,Cook County,Urban",
      "79329,TX,Lynn County,Rural"
    ].join("\n");

    const blob = new Blob([templateData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "zip_county_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Parse CSV file
  const parseCSV = (csvText: string): ParsedData => {
    const lines = csvText.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim());
    
    const requiredHeaders = ["Zip_Code", "State", "County_Name", "Rural_Urban_Designation"];
    const headerMap = requiredHeaders.reduce((map, header) => {
      const index = headers.findIndex(h => h.toLowerCase() === header.toLowerCase());
      map[header] = index;
      return map;
    }, {} as Record<string, number>);

    const valid: ZipCountyClassification[] = [];
    const errors: { row: number; errors: string[] }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim());
      const rowErrors: string[] = [];

      // Check if all required columns exist
      if (Object.values(headerMap).some(index => index === -1)) {
        rowErrors.push("Missing required columns");
        continue;
      }

      const zipCode = values[headerMap["Zip_Code"]];
      const state = values[headerMap["State"]];
      const countyName = values[headerMap["County_Name"]];
      const ruralUrban = values[headerMap["Rural_Urban_Designation"]];

      // Validate zip code (5 digits)
      if (!zipCode || !/^\d{5}$/.test(zipCode)) {
        rowErrors.push("Invalid ZIP code (must be 5 digits)");
      }

      // Validate state (2 letters)
      if (!state || !/^[A-Z]{2}$/i.test(state)) {
        rowErrors.push("Invalid state (must be 2 letters)");
      }

      // Validate county name
      if (!countyName) {
        rowErrors.push("County name is required");
      }

      // Validate rural/urban designation
      if (!ruralUrban || !["Rural", "Urban"].includes(ruralUrban)) {
        rowErrors.push("Rural/Urban designation must be 'Rural' or 'Urban'");
      }

      if (rowErrors.length > 0) {
        errors.push({ row: i + 1, errors: rowErrors });
      } else {
        valid.push({
          zip_code: zipCode,
          state: state.toUpperCase(),
          county_name: countyName,
          rural_urban_designation: ruralUrban as "Rural" | "Urban"
        });
      }
    }

    return { valid, errors };
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
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
        toast({
          title: "File Parsed Successfully",
          description: `${parsed.valid.length} records ready to import`
        });
      } else {
        toast({
          title: "Parsing Errors Found",
          description: `${parsed.errors.length} errors found. Please review before importing.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error Reading File",
        description: "Failed to parse the CSV file",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Import data to database
  const importData = async () => {
    if (!parsedData?.valid.length) return;

    setIsLoading(true);
    try {
      // Clear existing data and insert new data
      const { error: deleteError } = await supabase
        .from("zip_county_classifications")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from("zip_county_classifications")
        .insert(parsedData.valid);

      if (insertError) throw insertError;

      toast({
        title: "Import Successful",
        description: `${parsedData.valid.length} records imported successfully`
      });

      setParsedData(null);
      await fetchExistingData();
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import data to database",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch existing data
  const fetchExistingData = async () => {
    try {
      const { data, error } = await supabase
        .from("zip_county_classifications")
        .select("*")
        .order("zip_code");

      if (error) throw error;
      const typedData = (data || []).map(item => ({
        ...item,
        rural_urban_designation: item.rural_urban_designation as "Rural" | "Urban"
      }));
      setExistingData(typedData);
      setFilteredData(typedData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch existing data",
        variant: "destructive"
      });
    }
  };

  // Filter data based on search criteria
  const applyFilters = () => {
    let filtered = [...existingData];

    if (searchZip) {
      filtered = filtered.filter(item => 
        item.zip_code.includes(searchZip)
      );
    }

    if (searchCounty) {
      filtered = filtered.filter(item => 
        item.county_name.toLowerCase().includes(searchCounty.toLowerCase())
      );
    }

    if (filterState) {
      filtered = filtered.filter(item => item.state === filterState);
    }

    if (filterRuralUrban) {
      filtered = filtered.filter(item => item.rural_urban_designation === filterRuralUrban);
    }

    setFilteredData(filtered);
  };

  // Update single record
  const updateRecord = async (id: string, newDesignation: "Rural" | "Urban") => {
    try {
      const { error } = await supabase
        .from("zip_county_classifications")
        .update({ rural_urban_designation: newDesignation })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Updated Successfully",
        description: "Classification updated"
      });

      await fetchExistingData();
      setEditingId(null);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update classification",
        variant: "destructive"
      });
    }
  };

  // Get unique states for filter
  const uniqueStates = [...new Set(existingData.map(item => item.state))].sort();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            ZIP & County Rural/Urban Import Tool
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="import" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="import">Import Data</TabsTrigger>
              <TabsTrigger value="manage" onClick={fetchExistingData}>Manage Existing</TabsTrigger>
            </TabsList>

            <TabsContent value="import" className="space-y-4">
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
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Preview ({parsedData.valid.length} records)</h3>
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
                            {parsedData.valid.slice(0, 10).map((item, idx) => (
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
                      {parsedData.valid.length > 10 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Showing first 10 of {parsedData.valid.length} records
                        </p>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={importData}
                    disabled={isLoading || parsedData.errors.length > 0 || parsedData.valid.length === 0}
                    className="w-full"
                  >
                    {isLoading ? "Importing..." : `Import ${parsedData.valid.length} Records`}
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="manage" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Search by ZIP</Label>
                  <Input
                    placeholder="Enter ZIP code"
                    value={searchZip}
                    onChange={(e) => setSearchZip(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Search by County</Label>
                  <Input
                    placeholder="Enter county name"
                    value={searchCounty}
                    onChange={(e) => setSearchCounty(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Filter by State</Label>
                  <Select value={filterState} onValueChange={setFilterState}>
                    <SelectTrigger>
                      <SelectValue placeholder="All states" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All states</SelectItem>
                      {uniqueStates.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Filter by Classification</Label>
                  <Select value={filterRuralUrban} onValueChange={setFilterRuralUrban}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      <SelectItem value="Rural">Rural</SelectItem>
                      <SelectItem value="Urban">Urban</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={applyFilters} className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Apply Filters
              </Button>

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
                    {filteredData.map((item) => (
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
                                onClick={() => updateRecord(item.id!, editValue)}
                                className="h-8 w-8 p-0 text-green-600"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingId(null)}
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingId(item.id!);
                                setEditValue(item.rural_urban_designation);
                              }}
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

              {filteredData.length === 0 && existingData.length > 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No records match your search criteria
                </p>
              )}

              {existingData.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No data imported yet. Use the Import tab to upload data.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};