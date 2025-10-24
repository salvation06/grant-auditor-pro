import { Grant } from "@/lib/grants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, TrendingUp } from "lucide-react";

interface GrantCardProps {
  grant: Grant;
  onAnalyze: (grant: Grant) => void;
}

export const GrantCard = ({ grant, onAnalyze }: GrantCardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-card to-card/80 border-border/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
              {grant.recipient}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {grant.agency} • {grant.date}
            </CardDescription>
          </div>
          {grant.link && (
            <a
              href={grant.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 p-2 hover:bg-secondary rounded-md transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Grant Value</p>
            <p className="text-xl font-bold text-primary">{formatCurrency(grant.value)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Stated Savings</p>
            <p className="text-xl font-bold text-accent flex items-center gap-1">
              {formatCurrency(grant.savings)}
              {grant.savings > 0 && <TrendingUp className="h-4 w-4" />}
            </p>
          </div>
        </div>
        
        {grant.description && (
          <p className="text-sm text-foreground/80 line-clamp-3 leading-relaxed">
            {grant.description}
          </p>
        )}
        
        <Button
          onClick={() => onAnalyze(grant)}
          className="w-full"
          variant="default"
        >
          Analyze Impact
        </Button>
      </CardContent>
    </Card>
  );
};
