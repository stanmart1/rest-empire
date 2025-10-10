import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">RE</span>
              </div>
              <span className="font-bold text-lg text-foreground">
                <span className="text-primary">REST</span> EMPIRE
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-primary font-medium">Home</Link>
            <Link to="/about" className="text-foreground hover:text-primary font-medium">About</Link>
            <Link to="/contact" className="text-foreground hover:text-primary font-medium">Contact</Link>
            <Link to="/faq" className="text-foreground hover:text-primary font-medium">FAQ</Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button asChild variant="outline" size="sm">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild size="sm">
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

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-foreground hover:text-primary font-medium" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link to="/about" className="text-foreground hover:text-primary font-medium" onClick={() => setMobileMenuOpen(false)}>About</Link>
              <Link to="/contact" className="text-foreground hover:text-primary font-medium" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
              <Link to="/faq" className="text-foreground hover:text-primary font-medium" onClick={() => setMobileMenuOpen(false)}>FAQ</Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;