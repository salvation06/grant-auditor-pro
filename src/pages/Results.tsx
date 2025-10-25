import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, FileText, Download, Share2, Users } from "lucide-react";
import { MarkdownContent } from "@/components/MarkdownContent";
import { Grant } from "@/lib/grants";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CongressionalContactDialog } from "@/components/CongressionalContactDialog";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [congressDialogOpen, setCongressDialogOpen] = useState(false);
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

  const downloadMarkdown = () => {
    const content = `# ${grant.recipient}\n\n**Agency:** ${grant.agency}\n**Grant Value:** ${formatCurrency(grant.value)}\n**Stated Savings:** ${formatCurrency(grant.savings)}\n**Date:** ${grant.date}\n\n---\n\n## Cancellation Impact Analysis\n\n${assessment}`;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${grant.recipient.replace(/[^a-z0-9]/gi, '_')}_impact_analysis.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "Impact analysis downloaded successfully",
    });
  };
  const generateSummary = async (text: string): Promise<string> => {
    try {
      if (!('Summarizer' in window)) {
        throw new Error('Summarizer API is not available in this browser');
      }

      const options = {
        sharedContext: 'this is a markdown generated page',
        type: 'key-points',
        format: 'plain-text',
        length: 'short'
      };

      const availability = await Summarizer.availability();
      
      if (availability === 'unavailable') {
        throw new Error('Summarizer API is not available');
      }

      const summarizer = await Summarizer.create(options);
      
      if (availability !== 'available' && summarizer.ready) {
        await summarizer.ready;
      }

      const summary = await summarizer.summarize(text);
      summarizer.destroy();
      
      // Truncate to 160 characters
      return summary.length > 160 ? summary.substring(0, 157) + '...' : summary;
    } catch (e: any) {
      console.error('Summary generation failed:', e);
      throw e;
    }
  };

  const shareToTwitter = async () => {
    setIsGeneratingSummary(true);
    try {
      const summary = await generateSummary(assessment);
      console.log(summary);
      const tweetText = `${summary}\n\nAnalyzing grant: ${grant.recipient} - ${formatCurrency(grant.value)}`;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
      window.open(twitterUrl, '_blank');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate summary",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSummary(false);
    }
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
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Cancellation Impact Analysis
              </h2>
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  variant="outline"
                  onClick={downloadMarkdown}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCongressDialogOpen(true)}
                  className="gap-2"
                >
                  <Users className="h-4 w-4" />
                  Contact Your Congress Person
                </Button>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-muted-foreground">Share Summarized View To Twitter</span>
                  <Button
                    variant="default"
                    onClick={shareToTwitter}
                    disabled={isGeneratingSummary}
                    className="gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    {isGeneratingSummary ? "Generating..." : "Share"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <MarkdownContent content={assessment} />
        </Card>
      </div>

      <CongressionalContactDialog
        open={congressDialogOpen}
        onOpenChange={setCongressDialogOpen}
        assessmentText={assessment}
      />
    </div>
  );
}
