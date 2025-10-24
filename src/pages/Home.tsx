import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileBarChart, ArrowRight } from "lucide-react";
import shibaHero from "@/assets/shiba-hero.jpg";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-6rem)]">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <FileBarChart className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Analysis</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                The Doge Catcher
              </h1>
              <h2 className="text-3xl lg:text-4xl font-semibold text-primary/80">
                AI Grant Analyzer
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Leverage artificial intelligence to analyze the comprehensive impact of canceled government grants. 
                Understand stakeholders, risks, and long-term implications with detailed AI-generated assessments.
              </p>
            </div>

            <div className="space-y-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/grants")}
                className="text-lg px-8 py-6 h-auto group"
              >
                Enter Analysis Dashboard
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Real-time Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>AI-Powered Insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Impact Assessment</span>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="pt-8 border-t border-border">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Disclaimer:</strong> This project is not affiliated with any political party 
                and should not be considered as such. It merely uses Artificial Intelligence to analyze 
                the impacts of grants that have been canceled.
              </p>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={shibaHero} 
                alt="Shiba Inu mascot for The Doge Catcher" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </div>
            
            {/* Floating Stats Card */}
            <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FileBarChart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">1000+</p>
                  <p className="text-sm text-muted-foreground">Grants Analyzed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
