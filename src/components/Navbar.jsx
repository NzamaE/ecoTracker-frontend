import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Simple Logo component (replace with your actual logo)
const Logo = () => (
  <div className="font-bold text-lg">YourLogo</div>
)

// Navigation links array with proper hrefs
const navigationLinks = [
  { href: "#home", label: "Home", active: true },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
]

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("home");

  // Smooth scroll function
  const scrollToSection = (e, href) => {
    e.preventDefault();
    const targetId = href.substring(1); // Remove the # from href
    const targetSection = document.getElementById(targetId);
    
    if (targetSection) {
      const offsetTop = targetSection.offsetTop - 80; // Account for navbar height
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = navigationLinks.map(link => link.href.substring(1));
      const scrollPosition = window.scrollY + 100;

      for (const sectionId of sections) {
        const section = document.getElementById(sectionId);
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionBottom = sectionTop + section.offsetHeight;

          if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="border-b px-4 md:px-6 sticky top-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {/* Mobile menu trigger */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="group size-8 md:hidden"
                variant="ghost"
                size="icon"
              >
                <svg
                  className="pointer-events-none"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 12L20 12"
                    className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                  />
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-36 p-1 md:hidden">
              <NavigationMenu className="max-w-none *:w-full">
                <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                  {navigationLinks.map((link, index) => (
                    <NavigationMenuItem key={index} className="w-full">
                      <NavigationMenuLink
                        href={link.href}
                        className="py-1.5"
                        active={activeSection === link.href.substring(1)}
                        onClick={(e) => scrollToSection(e, link.href)}
                      >
                        {link.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </PopoverContent>
          </Popover>
          
          {/* Main nav */}
          <div className="flex items-center gap-6">
            <a 
              href="#home" 
              className="text-primary hover:text-primary/90"
              onClick={(e) => scrollToSection(e, "#home")}
            >
              <Logo />
            </a>
            
            {/* Navigation menu */}
            <NavigationMenu className="max-md:hidden">
              <NavigationMenuList className="gap-2">
                {navigationLinks.map((link, index) => (
                  <NavigationMenuItem key={index}>
                    <NavigationMenuLink
                      active={activeSection === link.href.substring(1)}
                      href={link.href}
                      className="text-muted-foreground hover:text-primary py-1.5 font-medium transition-colors"
                      onClick={(e) => scrollToSection(e, link.href)}
                    >
                      {link.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="text-sm">
            <a href="/login">Sign In</a>
          </Button>
          <Button asChild size="sm" className="text-sm">
            <a href="/signup">Get Started</a>
          </Button>
        </div>

      </div>
    </header>
  )
}