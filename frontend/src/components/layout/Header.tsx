import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-md border-b border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]" style={{ backdropFilter: 'blur(10px) saturate(180%)' }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <img src="/favicon.png" alt="Logo" className="w-8 h-8" />
              <span className="font-bold text-lg text-foreground">
                Opened Seal and Rest Empire
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-primary font-medium">Home</Link>
            <Link to="/about" className="text-foreground hover:text-primary font-medium">About</Link>
            <Link to="/blog" className="text-foreground hover:text-primary font-medium">Blog</Link>
            <Link to="/contact" className="text-foreground hover:text-primary font-medium">Contact</Link>
            <Link to="/faq" className="text-foreground hover:text-primary font-medium">FAQ</Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button asChild variant="outline" size="lg" className="bg-[hsl(45,100%,55%)] hover:bg-[hsl(45,100%,50%)] text-gray-900 border-[hsl(45,100%,45%)] hover:border-[hsl(45,100%,50%)] font-semibold">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild size="lg">
              <Link to="/register">Sign Up</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="text-foreground hover:text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>

    {/* Mobile Sidebar Overlay */}
    <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </AnimatePresence>

    {/* Mobile Sidebar */}
    <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-screen w-64 bg-background border-l border-border z-50 md:hidden overflow-y-auto"
        >
          <div className="flex justify-end p-4">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-foreground hover:text-primary"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
            }}
            className="p-6 space-y-6"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, x: 20 },
                visible: { opacity: 1, x: 0 }
              }}
            >
              <div className="flex items-center gap-2 mb-8">
                <img src="/favicon.png" alt="Logo" className="w-8 h-8" />
                <span className="font-bold text-lg text-foreground">
                  Opened Seal and Rest Empire
                </span>
              </div>
            </motion.div>

            <div className="flex flex-col space-y-4">
              {[
                { to: "/", label: "Home" },
                { to: "/about", label: "About" },
                { to: "/blog", label: "Blog" },
                { to: "/contact", label: "Contact" },
                { to: "/faq", label: "FAQ" }
              ].map((link) => (
                <motion.div
                  key={link.to}
                  variants={{
                    hidden: { opacity: 0, x: 20 },
                    visible: { opacity: 1, x: 0 }
                  }}
                >
                  <Link 
                    to={link.to} 
                    className="text-foreground hover:text-primary font-medium block py-2" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div 
              variants={{
                hidden: { opacity: 0, x: 20 },
                visible: { opacity: 1, x: 0 }
              }}
              className="flex flex-col space-y-3 pt-6 border-t border-border"
            >
              <Button asChild variant="outline" size="lg" className="w-full bg-[hsl(45,100%,55%)] hover:bg-[hsl(45,100%,50%)] text-gray-900 border-[hsl(45,100%,45%)] hover:border-[hsl(45,100%,50%)] font-semibold">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              </Button>
              <Button asChild size="lg" className="w-full">
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

export default Header;