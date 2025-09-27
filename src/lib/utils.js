import { config } from "@/components/config";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function groupBy(array, key) {
  return array.reduce((acc, item) => {
    const keyValue = String(item[key]);
    if (!acc[keyValue]) {
      acc[keyValue] = [];
    }
    acc[keyValue].push(item);
    return acc;
  }, {});
}

export function absoluteUrl(path) {
  return process.env.NODE_ENV === "development"
    ? `http://localhost:3000${path}`
    : `https://${config.appUrl}${path}`;
}
