import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatMarketCap(value: number): string {
  if (value === 0) return "$0"
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`
  return `$${value.toFixed(2)}`
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "已归零":
      return "bg-red-500 text-white"
    case "濒临归零":
      return "bg-orange-500 text-white"
    case "大幅下跌":
      return "bg-yellow-500 text-white"
    case "正常":
      return "bg-green-500 text-white"
    default:
      return "bg-gray-500 text-white"
  }
}
