import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Phone, Globe, MapPin, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import "@/types/browser-apis";

interface Official {
  name: string;
  party: string;
  partyCode: string;
  state: string;
  district: string;
  chamber: string;
  phone: string;
  officeAddress: string;
  website: string;
}

interface CongressionalContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessmentText: string;
}

export function CongressionalContactDialog({ open, onOpenChange, assessmentText }: CongressionalContactDialogProps) {
  const [zipCode, setZipCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [officials, setOfficials] = useState<Official[]>([]);
  const [emailDrafts, setEmailDrafts] = useState<Record<string, string>>({});
  const [generatingDrafts, setGeneratingDrafts] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const validateZip = (zip: string) => /^\d{5}(?:-\d{4})?$/.test(zip.trim());

  const fetchOfficials = async () => {
    if (!validateZip(zipCode)) {
      toast({
        title: "Invalid ZIP Code",
        description: "Please enter a valid 5-digit ZIP code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const zip5 = zipCode.trim().slice(0, 5);
      const url = `https://whoismyrepresentative.com/getall_mems.php?zip=${encodeURIComponent(zip5)}&output=json`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      
      const data = await response.json();
      const rawList = Array.isArray(data?.results) ? data.results : [];
      
      const normalizedOfficials = rawList.map((item: any) => ({
        name: (item?.name || '').trim(),
        party: (item?.party || '').trim(),
        partyCode: getPartyCode(item?.party || ''),
        state: (item?.state || '').trim().toUpperCase(),
        district: String(item?.district ?? '').trim(),
        chamber: item?.district ? 'House' : 'Senate',
        phone: (item?.phone || '').trim(),
        officeAddress: (item?.office || '').trim(),
        website: (item?.link || '').trim(),
      }));

      setOfficials(normalizedOfficials);
      
      if (normalizedOfficials.length === 0) {
        toast({
          title: "No Officials Found",
          description: `No officials found for ZIP code ${zip5}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.name === 'AbortError' ? 'Request timed out' : 'Failed to fetch officials',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateEmailDraft = async (officialName: string) => {
    if (!('Writer' in window)) {
      toast({
        title: "Feature Unavailable",
        description: "The AI Writer API is not available in your browser",
        variant: "destructive",
      });
      return;
    }

    setGeneratingDrafts(prev => ({ ...prev, [officialName]: true }));
    
    try {
      const options = {
        tone: 'formal',
        length: 'short',
        format: 'markdown',
        sharedContext: 'Writing to members of Congress about recent Federal Grants analyzed by AI',
      };

      const writer = await Writer.create(options);
      const stream = writer.writeStreaming(assessmentText);
      
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        setEmailDrafts(prev => ({ ...prev, [officialName]: fullResponse }));
      }
      
      writer.destroy();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate email draft",
        variant: "destructive",
      });
    } finally {
      setGeneratingDrafts(prev => ({ ...prev, [officialName]: false }));
    }
  };

  const getPartyCode = (party: string) => {
    const p = party.toLowerCase();
    if (p.startsWith('dem')) return 'D';
    if (p.startsWith('rep')) return 'R';
    if (p.startsWith('ind')) return 'I';
    return '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Contact Your Congressional Officials</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="zip">Enter Your ZIP Code</Label>
            <div className="flex gap-3">
              <Input
                id="zip"
                type="text"
                inputMode="numeric"
                placeholder="e.g., 77433"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchOfficials()}
                className="max-w-xs"
              />
              <Button
                onClick={fetchOfficials}
                disabled={!validateZip(zipCode) || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Find Officials'
                )}
              </Button>
            </div>
          </div>

          {officials.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Found {officials.length} official(s) for your area
              </p>
              
              {officials.map((official, idx) => (
                <Card key={idx} className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {official.name}
                      {official.partyCode && ` (${official.partyCode}-${official.state}${official.district ? '-' + official.district : ''})`}
                    </h3>
                    <p className="text-sm text-muted-foreground">{official.chamber}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {official.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{official.phone}</span>
                      </div>
                    )}
                    {official.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a href={official.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          Visit Website
                        </a>
                      </div>
                    )}
                    {official.officeAddress && (
                      <div className="flex items-start gap-2 md:col-span-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{official.officeAddress}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        Contact Your {official.chamber === 'Senate' ? 'Senator' : 'Representative'}
                      </h4>
                      {!emailDrafts[official.name] && (
                        <Button
                          size="sm"
                          onClick={() => generateEmailDraft(official.name)}
                          disabled={generatingDrafts[official.name]}
                        >
                          {generatingDrafts[official.name] ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Mail className="mr-2 h-4 w-4" />
                              Generate Draft
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    
                    {emailDrafts[official.name] ? (
                      <div className="space-y-2">
                        <div className="bg-muted/50 p-4 rounded-md border text-sm whitespace-pre-wrap font-mono">
                          {emailDrafts[official.name]}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Thank you for your dedicated service. I appreciate your consideration and look forward to your feedback.
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Click "Generate Draft" to create a personalized letter based on this grant analysis
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
