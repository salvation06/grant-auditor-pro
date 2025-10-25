import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileBarChart, ArrowRight, Zap } from "lucide-react";
import shibaHero from "@/assets/shiba-hero.jpg";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[hsl(222,47%,8%)]">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `
              linear-gradient(hsl(195 100% 50% / 0.1) 1px, transparent 1px),
              linear-gradient(90deg, hsl(195 100% 50% / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            animation: 'grid-move 20s linear infinite'
          }}
        />
      </div>

      {/* Cyber glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[hsl(195,100%,50%)] rounded-full blur-[120px] opacity-20 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[hsl(217,91%,60%)] rounded-full blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Hero Section */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6 py-12">
        <div className="max-w-[1800px] w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Content */}
            <div className="space-y-10">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-[hsl(195,100%,50%,0.1)] border border-[hsl(195,100%,50%,0.3)] rounded-full backdrop-blur-sm">
                <Zap className="h-5 w-5 text-[hsl(195,100%,50%)]" />
                <span className="text-base font-medium text-[hsl(195,100%,85%)] tracking-wide">AI-POWERED ANALYSIS</span>
              </div>

              <div className="space-y-6">
                <h1 className="text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tight">
                  THE DOGE
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(195,100%,60%)] to-[hsl(217,91%,70%)]">
                    CATCHER
                  </span>
                </h1>
                <div className="h-1 w-32 bg-gradient-to-r from-[hsl(195,100%,50%)] to-transparent rounded-full" />
                <h2 className="text-4xl lg:text-5xl font-bold text-[hsl(195,100%,85%)] tracking-wide">
                  AI GRANT ANALYZER
                </h2>
                <p className="text-xl lg:text-2xl text-[hsl(210,40%,70%)] leading-relaxed max-w-2xl">
                  Leverage cutting-edge artificial intelligence to analyze the comprehensive impact 
                  of canceled government grants. Understand stakeholders, risks, and long-term 
                  implications with detailed AI-generated assessments.
                </p>
              </div>

              <div className="space-y-6">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/grants")}
                  className="text-xl px-12 py-8 h-auto group bg-gradient-to-r from-[hsl(195,100%,45%)] to-[hsl(217,91%,55%)] hover:from-[hsl(195,100%,55%)] hover:to-[hsl(217,91%,65%)] border-0 shadow-[0_0_30px_hsl(195,100%,50%,0.5)] hover:shadow-[0_0_50px_hsl(195,100%,50%,0.7)] transition-all duration-300"
                >
                  ENTER ANALYSIS DASHBOARD
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </Button>

                <div className="flex flex-wrap gap-8 text-base text-[hsl(195,100%,80%)]">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-[hsl(195,100%,50%)] shadow-[0_0_10px_hsl(195,100%,50%)]" />
                    <span className="font-medium tracking-wide">REAL-TIME DATA</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-[hsl(195,100%,50%)] shadow-[0_0_10px_hsl(195,100%,50%)]" />
                    <span className="font-medium tracking-wide">AI-POWERED INSIGHTS</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-[hsl(195,100%,50%)] shadow-[0_0_10px_hsl(195,100%,50%)]" />
                    <span className="font-medium tracking-wide">IMPACT ASSESSMENT</span>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="pt-10 border-t border-[hsl(195,100%,50%,0.2)]">
                <p className="text-sm text-[hsl(210,40%,60%)] leading-relaxed">
                  <strong className="text-[hsl(195,100%,70%)]">DISCLAIMER:</strong> This project is not affiliated with any political party 
                  and should not be considered as such. It merely uses Artificial Intelligence to analyze 
                  the impacts of grants that have been canceled.
                </p>
              </div>
            </div>

            {/* Right Column - Dog Image */}
            <div className="relative flex items-center justify-center lg:justify-end">
              <div className="relative">
                {/* Outer glow ring */}
                <div className="absolute -inset-8 bg-gradient-to-r from-[hsl(195,100%,50%)] to-[hsl(217,91%,60%)] rounded-full blur-3xl opacity-40 animate-pulse" />
                
                {/* Image container with cyber frame */}
                <div className="relative rounded-3xl overflow-hidden border-4 border-[hsl(195,100%,50%,0.5)] shadow-[0_0_60px_hsl(195,100%,50%,0.6)]">
                  <img 
                    src={shibaHero} 
                    alt="Shiba Inu mascot for The Doge Catcher" 
                    className="w-full h-auto object-cover max-w-2xl transform hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[hsl(222,47%,8%,0.7)] via-transparent to-[hsl(195,100%,50%,0.1)]" />
                  
                  {/* Corner accents */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[hsl(195,100%,50%)]" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[hsl(195,100%,50%)]" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[hsl(195,100%,50%)]" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[hsl(195,100%,50%)]" />
                </div>
                
                {/* Floating Stats Card */}
                <div className="absolute -bottom-8 -left-8 bg-[hsl(222,47%,12%)] border-2 border-[hsl(195,100%,50%,0.5)] rounded-2xl p-8 shadow-[0_0_40px_hsl(195,100%,50%,0.4)] backdrop-blur-md">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-gradient-to-br from-[hsl(195,100%,50%,0.2)] to-[hsl(217,91%,60%,0.2)] rounded-xl border border-[hsl(195,100%,50%,0.3)]">
                      <FileBarChart className="h-8 w-8 text-[hsl(195,100%,50%)]" />
                    </div>
                    <div>
                      <p className="text-4xl font-black text-white">1000+</p>
                      <p className="text-base text-[hsl(195,100%,80%)] font-medium tracking-wide">GRANTS ANALYZED</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes grid-move {
          0% { transform: translateY(0); }
          100% { transform: translateY(80px); }
        }
      `}</style>
    </div>
  );
};

export default Home;
