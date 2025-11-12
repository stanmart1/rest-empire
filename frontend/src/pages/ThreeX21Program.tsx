import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useEffect } from "react";

const ThreeX21Program = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-secondary">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxjaXJjbGUgY3g9IjEwIiBjeT0iMTAiIHI9IjEuNSIgZmlsbD0id2hpdGUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybikiLz48L3N2Zz4=')]"></div>
        </div>
        
        <div className="container mx-auto px-4 py-28 md:py-36 lg:py-44 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-primary-foreground leading-tight">
              3X21 Days Program
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto">
              Building a culture of reading and continuous capacity development
            </p>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none" 
            className="relative block w-full h-16 md:h-24"
          >
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
              opacity=".25" 
              className="fill-white"
            ></path>
            <path 
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
              opacity=".5" 
              className="fill-white"
            ></path>
            <path 
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
              className="fill-white"
            ></path>
          </svg>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-16 relative z-10 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-xl border p-8 md:p-12 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">About 3X21 Days Program</h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              The concept of the 3X21 DAYS PROGRAM is centered on integrating new members into a culture of reading; especially reading inspiring & best seller books that helps the individual to expand & enhance his or her thoughts, in a more vibrant, effective & dynamic way.
            </p>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              This program is designed to create a paradym shift in our line of thinking & set every member, on the path to CAPACITY DEVELOPMENT & RELEVANCE.
            </p>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              In this program, every new member is required to create a WhatsApp group where he/she must include his/her direct upline(s) & one of the leaders of the Community (as directed by leadership). The 3X21 DAYS PROGRAM consists of 21 days of reading a prescribed book, for 3 consecutive segments, divided into 3 segments of 21 days each (21 days for each round), for at least, 15 minutes each day. For each day that you read, you are to do a VOICE NOTE SUMMARY of the lessons or points noted in the chapter(s) read. This VOICE NOTE should not be more than 2 minutes. You are to undertake this exercise for 21 consecutive days without breaking it; after which, you start the second round of another 21 days & after this, you do the third round of another 21 days. During this process & in each round, you are not to break or skip it for a day; the day you skip it, even if it is on the 20th day in your ROUND ONE, you will be directed by your upline, to re-start from DAY ONE.
            </p>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              It is assumed that when you religiously carry out this reading & reporting exercise, for a total of 63 days (a culmination of each round of 21 days) without breaking the process, you should have developed the habit of daily reading, which will play a very pivotal role in your CAPACITY DEVELOPMENT/ ENHANCEMENT in OPENED SEAL & REST EMPIRE.
            </p>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              So, each day, during this 3X21 DAYS PROGRAM, as you report your lessons via VOICE NOTE CLIPS that you will drop daily in the WhatsApp group you created for the program, your upline(s) will examine your VOICE CLIPS daily & make necessary comments as a way of guiding you through the process; ensuring you do it in accordance with defined guidelines.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">Ready to Join Our Community?</h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Be part of our empowering sessions and accelerate your personal and professional growth.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90">
            <Link to="/register">
              Create Your Account <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ThreeX21Program;
