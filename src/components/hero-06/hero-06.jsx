import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, CirclePlay } from "lucide-react";
import { BackgroundPattern } from "./particles";

const Hero06 = () => {
  return (
    <div id="home" className="min-h-screen flex items-center justify-center px-6">
      <BackgroundPattern />
      <div className="relative z-10 text-center max-w-3xl">
        <Badge
          variant="secondary"
          className="rounded-full py-1 border-border"
          asChild
        >
        
        </Badge>
        <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:leading-[1.2] font-semibold tracking-tighter">
          Track Your Carbon{" "}
          <span className="text-green-500">Footprint</span>.
        </h1>

        <p className="mt-6 md:text-lg">
           Make an Impact, join thousands of people reducing emissions, building streaks, and
            competing for a healthier planet.
        </p>
        <div className="mt-12 flex items-center justify-center gap-4">
          <Button asChild size="lg" className="rounded-full text-base">
            <a href="/signup" className="flex items-center gap-2">
              Get Started
              <ArrowUpRight className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero06;