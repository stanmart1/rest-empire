import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, Users, Gift, TrendingUp, Shield, Award, Globe, CheckCircle, BarChart3, Zap, Lock } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, animate as motionAnimate } from "motion/react";

const Counter = ({ to }: { to: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const controls = motionAnimate(count, to, { duration: 2 });
      return controls.stop;
    }
  }, [isInView, to, count]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
};

const Index = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Hero carousel state
  const [heroSlide, setHeroSlide] = useState(0);
  const heroSlides = [
    {
      title: "Build Your Network Marketing",
      subtitle: "Empire Today",
      description: "Join over 10,000+ entrepreneurs building sustainable income streams with Opened Seal and Rest Empire.",
      cta: "Create Account",
      gradient: "from-purple-700 via-purple-800 to-indigo-900"
    },
    {
      title: "Unlock Financial Freedom",
      subtitle: "Through Education",
      description: "Master wealth creation with cutting-edge Blockchain technology and cryptocurrency education with Opened Seal and Rest Empire.",
      cta: "Start Learning",
      gradient: "from-amber-700 via-yellow-800 to-orange-900"
    },
    {
      title: "Transform Your Health",
      subtitle: "Naturally",
      description: "Discover naturopathic medicine and plant-based health practices for a better lifestyle with Opened Seal and Rest Empire.",
      cta: "Explore Health",
      gradient: "from-emerald-700 via-green-800 to-teal-900"
    },
    {
      title: "Develop Your Capacity",
      subtitle: "Grow Your Skills",
      description: "Access educational products and practices that cultivate personal and professional growth with Opened Seal and Rest Empire.",
      cta: "Begin Journey",
      gradient: "from-slate-700 via-gray-800 to-zinc-900"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Features carousel state - continuous infinite scroll
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const nextSlide = () => {
    setCurrentSlide((prev) => prev + 1);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => prev - 1);
  };

  // Continuous auto-advance - never stops
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => prev + 1);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Handle infinite loop - reset when reaching clones
  useEffect(() => {
    if (currentSlide === 4) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentSlide(1);
      }, 500);
      setTimeout(() => {
        setIsTransitioning(true);
      }, 50);
    } else if (currentSlide === 0) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentSlide(3);
      }, 500);
      setTimeout(() => {
        setIsTransitioning(true);
      }, 50);
    }
  }, [currentSlide]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={heroSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className={`absolute inset-0 bg-gradient-to-r ${heroSlides[heroSlide].gradient}`}
          />
        </AnimatePresence>
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlckNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxjaXJjbGUgY3g9IjEwIiBjeT0iMTAiIHI9IjEuNSIgZmlsbD0id2hpdGUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybikiLz48L3N2Zz4=')]"></div>
        </div>

        <div className="container mx-auto px-4 py-32 md:py-40 lg:py-48 relative z-20">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-16 h-16 md:w-24 md:h-24 rounded-full bg-white/5 blur-xl"
              style={{ top: `${10 + i * 15}%`, left: `${5 + i * 18}%` }}
              animate={{
                y: [0, -80, 0],
                x: [0, 40, 0],
                scale: [1, 1.3, 1],
              }}
              transition={{ duration: 8 + i * 2, repeat: Infinity, delay: i * 0.5 }}
            />
          ))}

          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={heroSlide}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 text-primary-foreground leading-tight">
                  {heroSlides[heroSlide].title} <span className="block">{heroSlides[heroSlide].subtitle}</span>
                </h1>
                <p className="text-xl md:text-2xl text-primary-foreground/90 mb-10 max-w-3xl mx-auto">
                  {heroSlides[heroSlide].description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button asChild size="lg" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90">
                      <Link to="/register">
                        {heroSlides[heroSlide].cta} <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button asChild size="lg" className="text-lg px-8 py-6 bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                      <Link to="/login">
                        Login to Account
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Slide indicators */}
            <div className="flex justify-center gap-2 mt-12">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setHeroSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    heroSlide === index ? 'w-8 bg-white' : 'w-2 bg-white/40'
                  }`}
                />
              ))}
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

      {/* Why Choose Us Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            Why Thousands Choose Opened Seal and Rest Empire
          </h2>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              visible: { transition: { staggerChildren: 0.15 } }
            }}
          >
            <motion.div
              className="bg-card p-6 rounded-xl border shadow-sm text-center"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
            >
              <motion.div
                className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <BarChart3 className="w-8 h-8 text-primary" />
              </motion.div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Wealth Education</h3>
              <p className="text-muted-foreground">
                Our Wealth Education programs utilize cutting-edge Blockchain technology and cryptography, providing individuals with the tools to create unstoppable wealth and secure their financial futures.
              </p>
            </motion.div>

            <motion.div
              className="bg-card p-6 rounded-xl border shadow-sm text-center"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
            >
              <motion.div
                className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Zap className="w-8 h-8 text-primary" />
              </motion.div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Health Education</h3>
              <p className="text-muted-foreground">
                In the realm of Health Education, we draw upon our extensive expertise in Naturopathic medicine to promote plant and nature-based health practices.
              </p>
            </motion.div>

            <motion.div
              className="bg-card p-6 rounded-xl border shadow-sm text-center"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
            >
              <motion.div
                className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Lock className="w-8 h-8 text-primary" />
              </motion.div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Capacity Development</h3>
              <p className="text-muted-foreground">
                Through our Capacity Development initiatives, we are dedicated to fostering personal and professional growth by providing educational products and practices that cultivate a range of skills and knowledge.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16 relative z-10 bg-gray-50">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          Powerful Features for Your Success
        </motion.h2>

        {/* Full Width Carousel */}
        <div className="relative max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.02, boxShadow: "0 25px 50px rgba(0,0,0,0.2)" }}
              className="bg-card rounded-2xl shadow-lg overflow-hidden transition-all"
            >
              <div className="grid md:grid-cols-2 gap-8 items-center min-h-[400px]">
                {/* Image Side */}
                <div className="h-full min-h-[400px] bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center p-8">
                  {((currentSlide - 1 + 3) % 3) === 0 && (
                    <Users className="w-32 h-32 text-primary" />
                  )}
                  {((currentSlide - 1 + 3) % 3) === 1 && (
                    <Gift className="w-32 h-32 text-primary" />
                  )}
                  {((currentSlide - 1 + 3) % 3) === 2 && (
                    <TrendingUp className="w-32 h-32 text-primary" />
                  )}
                </div>

                {/* Text Side */}
                <div className="p-8 md:p-12">
                  {((currentSlide - 1 + 3) % 3) === 0 && (
                    <>
                      <h3 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Book Review</h3>
                      <p className="text-lg text-muted-foreground mb-6">
                        Access our curated library of personal development and business books with reviews and insights from our community.
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-3">
                          <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                          <span className="text-base">Extensive digital library</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                          <span className="text-base">Community reviews and ratings</span>
                        </li>
                      </ul>
                    </>
                  )}
                  {((currentSlide - 1 + 3) % 3) === 1 && (
                    <>
                      <h3 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Crypto Signals</h3>
                      <p className="text-lg text-muted-foreground mb-6">
                        Get access to expert cryptocurrency trading signals and market analysis to help you make informed investment decisions.
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-3">
                          <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                          <span className="text-base">Real-time market insights</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                          <span className="text-base">Expert trading recommendations</span>
                        </li>
                      </ul>
                    </>
                  )}
                  {((currentSlide - 1 + 3) % 3) === 2 && (
                    <>
                      <h3 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Video Gallery</h3>
                      <p className="text-lg text-muted-foreground mb-6">
                        Watch training videos, webinars, and success stories from our community to accelerate your learning and growth.
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-3">
                          <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                          <span className="text-base">Training and tutorials</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                          <span className="text-base">Success stories and testimonials</span>
                        </li>
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index + 1)}
                className={`w-3 h-3 rounded-full transition-all ${
                  ((currentSlide - 1 + 3) % 3) === index ? 'w-8 bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-lg"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-lg"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>


      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.div 
          className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 md:p-12 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Ready to Start Your Journey?
          </motion.h2>
          <motion.p 
            className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Join thousands of distributors who are already building their empires with Opened Seal and Rest Empire.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button asChild size="lg" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90">
              <Link to="/register">
                Create Your Account <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default Index;