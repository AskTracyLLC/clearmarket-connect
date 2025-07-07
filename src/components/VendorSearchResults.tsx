import { Card, CardContent } from "@/components/ui/card";
import { mockResults } from "@/data/mockData";
import VendorResultCard from "./VendorResultCard";

interface VendorSearchResultsProps {
  zipCode: string;
}

const VendorSearchResults = ({ zipCode }: VendorSearchResultsProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">
        Search Results for {zipCode}
      </h2>
      
      <div className="space-y-4">
        {mockResults.map((rep) => (
          <VendorResultCard key={rep.id} rep={rep} />
        ))}
      </div>

      {mockResults.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No field reps found in this area.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try expanding your search radius or check back later.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorSearchResults;