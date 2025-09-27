import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const steps = [
  {
    title: "Log Activity",
    description:
      "Log your daily eco-friendly activities easily.",
    completed: true,
  },
  {
    title: "Track",
    description:
      "Track your carbon reduction progress over time.",
    completed: true,
  },
  {
    title: "Share",
    description:
      "Share achievements and compete in the leaderboard.",
    completed: true,
  },
  {
    title: "Improve",
    description:
      "Get feedback and reduce your carbon contribution for a better planet",
    completed: false,
  }
 
];

export default function Timeline06() {
  return (
    <div id="how-it-works" className="max-w-2xl mx-auto py-12 md:py-20 px-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
          How It Works
        </h2>
        <p className="text-muted-foreground text-lg">
          Follow our proven methodology from concept to deployment
        </p>
      </div>
      
      <div className="relative ml-6">
        {/* Timeline line */}
        <div className="absolute left-0 inset-y-0 border-l-2 border-muted-foreground/20" />
        
        {steps.map(({ title, description, completed }, index) => (
          <div key={index} className="relative pl-10 pb-10 last:pb-0">
            {/* Timeline Icon */}
            <div
              className={cn(
                "absolute left-px -translate-x-1/2 h-9 w-9 border-2 border-muted-foreground/40 flex items-center justify-center rounded-full bg-accent ring-8 ring-background transition-all duration-300",
                {
                  "bg-primary border-primary text-primary-foreground shadow-lg":
                    completed,
                }
              )}
            >
              <span className="font-semibold text-sm">
                {completed ? <Check className="h-4 w-4" /> : index + 1}
              </span>
            </div>
            
            {/* Content */}
            <div className="pt-1 space-y-2">
              <h3 className={cn(
                "text-xl font-medium tracking-[-0.015em] transition-colors",
                {
                  "text-foreground": completed,
                  "text-muted-foreground": !completed
                }
              )}>
                {title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}