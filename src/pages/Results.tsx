import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { MarkdownContent } from "@/components/MarkdownContent";
import { Grant } from "@/lib/grants";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { grant, assessment } = location.state as { grant: Grant; assessment: string } || {};

  if (!grant || !assessment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md">
          <p className="text-muted-foreground mb-4">No assessment data available</p>
          <Button onClick={() => navigate("/grants")}>Return to Grants</Button>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/grants")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Grants
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              Impact Assessment Report
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <Card className="p-8 mb-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {grant.recipient}
              </h1>
              <p className="text-muted-foreground">{grant.agency}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/50">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Grant Value</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(grant.value)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Stated Savings</p>
                <p className="text-xl font-bold text-accent">{formatCurrency(grant.savings)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date</p>
                <p className="text-xl font-bold text-foreground">{grant.date}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <div className="mb-6 pb-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Cancellation Impact Analysis
            </h2>
          </div>
          
          <MarkdownContent content={assessment} />
        </Card>
      </div>
    </div>
  );
}
