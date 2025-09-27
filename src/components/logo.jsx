"use client";

import { cn } from "@/lib/utils";

export const Logo = ({
  className,
  ...props
}) => {
  return (
    <img
      src="/images/android-chrome-192x192.png"
      alt="logo"
      className={cn("h-7 w-7", className)}
      {...props} />
  );
};
