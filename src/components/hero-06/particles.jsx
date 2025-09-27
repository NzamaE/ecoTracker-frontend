import { useState, useEffect } from "react";
import DotPattern from "@/components/ui/dot-pattern";
import Particles from "@/components/ui/particles";
import { cn } from "@/lib/utils";

export const BackgroundPattern = () => {
  // Simple theme detection (you can enhance this or use a theme provider)
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for system preference or existing theme
    const checkTheme = () => {
      const isDarkMode = 
        document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(isDarkMode);
    };

    checkTheme();
    
    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkTheme);
    
    // Also listen for manual theme changes on the document
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      mediaQuery.removeEventListener('change', checkTheme);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <DotPattern
        width={20}
        height={20}
        cx={1}
        cy={1}
        cr={1}
        className={cn(
          "mask-[radial-gradient(ellipse,rgba(0,0,0,0.3)_30%,black_50%)]",
          "dark:fill-slate-700"
        )}
      />
      <Particles
        className="absolute inset-0"
        quantity={100}
        ease={80}
        color={isDark ? "#fff" : "#000"}
        refresh
      />
    </>
  );
};