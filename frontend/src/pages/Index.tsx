import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Gift, TrendingUp, Shield, Award, Globe, CheckCircle } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-secondary">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxjaXJjbGUgY3g9IjEwIiBjeT0iMTAiIHI9IjEuNSIgZmlsbD0id2hpdGUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybikiLz48L3N2Zz4=')]"></div>
        </div>
        
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-16 lg:mb-0 lg:pr-12 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
                Build Your Network Marketing <span className="block text-accent">Empire Today</span>
              </h1>
              <p className="text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto lg:mx-0">
                Join over 10,000 entrepreneurs who are building sustainable income streams with our powerful MLM platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Button asChild size="lg" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90">
                  <Link to="/register">
                    Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-white text-white hover:bg-white/10">
                  <Link to="/login">
                    Login to Account
                  </Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-8 max-w-md mx-auto lg:mx-0">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">10K+</p>
                  <p className="text-primary-foreground/80 text-sm">Active Users</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">$2M+</p>
                  <p className="text-primary-foreground/80 text-sm">Paid Out</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">14</p>
                  <p className="text-primary-foreground/80 text-sm">Rank Levels</p>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative w-full max-w-lg">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                          <Globe className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-primary">Rest Empire</p>
                          <p className="text-xs text-muted-foreground">Network Marketing</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-success">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs">Live</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b">
                        <span className="text-muted-foreground">Current Rank</span>
                        <span className="font-semibold">Pearl</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b">
                        <span className="text-muted-foreground">Team Size</span>
                        <span className="font-semibold">12 Members</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b">
                        <span className="text-muted-foreground">This Month</span>
                        <span className="font-semibold text-success">€1,240</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Earnings</span>
                        <span className="font-semibold">€8,750</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Progress to Sapphire</span>
                        <span className="text-sm font-medium">42%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: '42%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-6 -right-6 bg-white rounded-full p-3 shadow-lg border">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white rounded-full p-3 shadow-lg border">
                  <Award className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none" 
            className="relative block w-full h-12 md:h-20"
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

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16 -mt-12 md:-mt-20 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">Powerful Features for Your Success</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card p-8 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">Team Building</h3>
            <p className="text-muted-foreground mb-4">
              Easily manage and support your growing team with our intuitive dashboard and powerful analytics tools.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-sm">Real-time team visualization</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-sm">Performance tracking</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-card p-8 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Gift className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">Multiple Bonuses</h3>
            <p className="text-muted-foreground mb-4">
              Earn through various bonus structures including Rank, Unilevel, and Infinity bonuses for maximum income potential.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-sm">Rank bonuses up to €1.2M</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-sm">Unilevel commissions</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-card p-8 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">Real-time Analytics</h3>
            <p className="text-muted-foreground mb-4">
              Track your team performance and earnings in real-time with comprehensive reporting and visualization tools.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-sm">Live dashboard updates</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-sm">Custom reporting</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-xl border">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "Rest Empire transformed my income. I went from zero to earning over €5,000 monthly in just 8 months!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-medium text-primary">JD</span>
                </div>
                <div>
                  <p className="font-medium">John D.</p>
                  <p className="text-sm text-muted-foreground">Diamond Rank</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card p-6 rounded-xl border">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "The platform is intuitive and the support team is exceptional. My team has grown to over 200 members."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-medium text-primary">MS</span>
                </div>
                <div>
                  <p className="font-medium">Maria S.</p>
                  <p className="text-sm text-muted-foreground">Blue Diamond Rank</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card p-6 rounded-xl border">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "I love the transparency and real-time analytics. I can track my progress and make informed decisions."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-medium text-primary">RP</span>
                </div>
                <div>
                  <p className="font-medium">Robert P.</p>
                  <p className="text-sm text-muted-foreground">Green Diamond Rank</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of distributors who are already building their empires with Rest Empire.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90">
            <Link to="/register">
              Create Your Account <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">RE</span>
              </div>
              <span className="font-bold text-lg text-foreground">
                <span className="text-primary">REST</span> EMPIRE
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Rest Empire. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;