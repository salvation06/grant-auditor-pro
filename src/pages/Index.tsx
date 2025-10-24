import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Grant, fetchGrants, assessGrantImpact } from "@/lib/grants";
import { GrantCard } from "@/components/GrantCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, FileBarChart, ChevronLeft, ChevronRight } from "lucide-react";

const GRANTS_API = "https://api.doge.gov/savings/grants";
const ITEMS_PER_PAGE = 12;

const Index = () => {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [filteredGrants, setFilteredGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadGrants();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = grants.filter(
        (grant) =>
          grant.recipient.toLowerCase().includes(query) ||
          grant.agency.toLowerCase().includes(query) ||
          grant.description.toLowerCase().includes(query)
      );
      setFilteredGrants(filtered);
      setCurrentPage(1);
    } else {
      setFilteredGrants(grants);
    }
  }, [searchQuery, grants]);

  const loadGrants = async () => {
    try {
      setLoading(true);
      const data = await fetchGrants(GRANTS_API, true);
      setGrants(data);
      setFilteredGrants(data);
      toast({
        title: "Grants Loaded",
        description: `Successfully loaded ${data.length} grants`,
      });
    } catch (error) {
      console.error("Error loading grants:", error);
      toast({
        title: "Error",
        description: "Failed to load grants. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (grant: Grant) => {
    try {
      setAnalyzing(true);
      toast({
        title: "Analyzing Grant",
        description: "Running impact assessment using AI...",
      });

      const assessment = await assessGrantImpact(grant, {
        temperature: 0.2,
        topK: 3,
      });

      navigate("/results", {
        state: { grant, assessment },
      });
    } catch (error: any) {
      console.error("Error analyzing grant:", error);
      toast({
        title: "Analysis Error",
        description: error.message || "Failed to analyze grant. Please ensure browser AI is available.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const totalPages = Math.ceil(filteredGrants.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedGrants = filteredGrants.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-lg text-muted-foreground">Loading grants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {analyzing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card p-8 rounded-lg shadow-lg text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <div>
              <p className="text-lg font-semibold text-foreground">Analyzing Grant Impact</p>
              <p className="text-sm text-muted-foreground">This may take a moment...</p>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileBarChart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Grant Impact Analyzer</h1>
                <p className="text-sm text-muted-foreground">
                  AI-Powered Cancellation Impact Assessment
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Grants</p>
              <p className="text-2xl font-bold text-primary">{grants.length}</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by recipient, agency, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {filteredGrants.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">No grants found matching your search.</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredGrants.length)} of{" "}
                {filteredGrants.length} grants
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedGrants.map((grant, idx) => (
                <GrantCard key={`${grant.recipient}-${idx}`} grant={grant} onAnalyze={handleAnalyze} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
