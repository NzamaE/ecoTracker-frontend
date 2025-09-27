import {
  Blocks,
  Bot,
  ChartPie,
  Film,
  MessageCircle,
  Settings2,
} from "lucide-react";
import React from "react";

const features = [
  {
    icon: Settings2,
    title: "Personal Insights",
    description:
      "See your total emissions in real time and monitor progress.",
  },
  {
    icon: Blocks,
    title: "Community Average",
    description:
      "Compare your footprint with friends and local communities.",
  },
  {
    icon: Bot,
    title: "Gamified Progress",
    description:
      "Build streaks and climb the leaderboard while helping the planet",
  }
 /* {
    icon: Film,
    title: "Media Integrations",
    description:
      "Connect with Spotify, Instagram, or your own media library for dynamic visuals and sound.",
  },
  {
    icon: ChartPie,
    title: "Advanced Analytics",
    description:
      "Track engagement, clicks, and user activity with intuitive charts and reports.",
  },
  {
    icon: MessageCircle,
    title: "Seamless Collaboration",
    description:
      "Comment, tag, and assign tasks directly within your documents.",
  },*/
];

const Features01 = () => {
  return (
   <div id="features" className="min-h-screen flex items-center justify-center py-12">
      <div>
        <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-center">
          Why EcoTracker?
        </h2>
        <div className="mt-10 sm:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col border rounded-xl py-6 px-5 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="mb-4 h-10 w-10 flex items-center justify-center bg-muted rounded-full">
                <feature.icon className="size-5" />
              </div>
              <span className="text-lg font-semibold">{feature.title}</span>
              <p className="mt-1 text-foreground/80 text-[15px]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features01;