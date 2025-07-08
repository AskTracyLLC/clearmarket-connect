import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload } from "lucide-react";
import { ImportTab } from "./ImportTab";
import { ManageTab } from "./ManageTab";
import { ZipCountyClassification, ParsedData, FilterState } from "./types";
import { filterData } from "./utils";

export const ZipCountyImportTool = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [existingData, setExistingData] = useState<ZipCountyClassification[]>([]);
  const [filteredData, setFilteredData] = useState<ZipCountyClassification[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    searchZip: "",
    searchCounty: "",
    filterState: "",
    filterRuralUrban: "",
  });

  const handleToast = useCallback((options: { title: string; description: string; variant?: "destructive" }) => {
    toast(options);
  }, [toast]);

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
  const fetchExistingData = useCallback(async () => {
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
  }, [toast]);

  // Apply filters
  const applyFilters = () => {
    const filtered = filterData(
      existingData,
      filters.searchZip,
      filters.searchCounty,
      filters.filterState,
      filters.filterRuralUrban
    );
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
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update classification",
        variant: "destructive"
      });
    }
  };

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
              <TabsTrigger value="manage">Manage Existing</TabsTrigger>
            </TabsList>

            <TabsContent value="import">
              <ImportTab
                parsedData={parsedData}
                setParsedData={setParsedData}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                onImport={importData}
                onToast={handleToast}
              />
            </TabsContent>

            <TabsContent value="manage">
              <ManageTab
                existingData={existingData}
                filteredData={filteredData}
                filters={filters}
                onFiltersChange={setFilters}
                onApplyFilters={applyFilters}
                onUpdateRecord={updateRecord}
                onFetchData={fetchExistingData}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};