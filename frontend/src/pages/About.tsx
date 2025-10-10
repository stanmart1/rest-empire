import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Header from "@/components/layout/Header";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-secondary">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxjaXJjbGUgY3g9IjEwIiBjeT0iMTAiIHI9IjEuNSIgZmlsbD0id2hpdGUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybikiLz48L3N2Zz4=')]"></div>
        </div>
        
        <div className="container mx-auto px-4 py-28 md:py-36 lg:py-44 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-primary-foreground leading-tight">
              About Us
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto">
              Building the future of network marketing with innovative technology and sustainable income opportunities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90">
                <Link to="/register">
                  Create Account <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" className="text-lg px-8 py-6 bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Link to="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
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
          <div className="bg-card rounded-xl border p-8 mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">OUR SERVICES</h2>
            <p className="text-muted-foreground mb-6 text-lg">
              At OPENED SEAL AND REST EMPIRE, our mission is to liberate individuals from the confines of poverty, ignorance, and disease. Our three-pronged approach focuses on Wealth Education, Health Education and Capacity Development to empower people and help them take control of their lives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-8 mb-16">
            <div className="bg-card rounded-xl border p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6">WEALTH EDUCATION</h3>
              <p className="text-muted-foreground mb-4 text-lg">
                Our Wealth Education programs utilize cutting-edge Blockchain technology and cryptography, providing individuals with the tools to create unstoppable wealth and secure their financial futures. Through our comprehensive resources and expert guidance, participants gain the knowledge and confidence to navigate the ever-evolving world of finance and secure long-lasting prosperity.
              </p>
            </div>

            <div className="bg-card rounded-xl border p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6">HEALTH EDUCATION</h3>
              <p className="text-muted-foreground mb-4 text-lg">
                In the realm of Health Education, we draw upon our extensive expertise in Naturopathic medicine to promote plant and nature-based health practices. By offering transformative programs that focus on natural healing and holistic well-being, we enable individuals to overcome various ailments and enhance their health in ways that conventional medicine often falls short.
              </p>
            </div>

            <div className="bg-card rounded-xl border p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6">CAPACITY DEVELOPMENT</h3>
              <p className="text-muted-foreground mb-4 text-lg">
                Through our Capacity Development initiatives, we are dedicated to fostering personal and professional growth by providing educational products and practices that cultivate a range of skills and knowledge. Our customized programs focus on nurturing talent and potential, enabling participants to enhance their capacities and confidently contribute to their communities and the world at large.
              </p>
            </div>
          </div>

          <div className="bg-primary/5 rounded-xl border border-primary/10 p-8">
            <p className="text-muted-foreground text-lg">
              At OPENED SEAL AND REST EMPIRE, we are steadfast in our commitment to create a brighter future for all, and we believe that by combining Wealth Creation, Health Education and Capacity Development, we can empower individuals to reach their full potential and lead more fulfilling lives.
            </p>
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
    </div>
  );
};

export default About;