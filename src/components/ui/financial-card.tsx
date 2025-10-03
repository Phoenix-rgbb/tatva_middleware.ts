import * as React from "react";
import { cn } from "@/lib/utils";

interface FinancialCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "revenue" | "expense" | "profit" | "income" | "neutral" | "investment";
}

const getVariantStyles = (variant: string) => {
  switch (variant) {
    case "revenue":
      return {
        gradient: "after:bg-gradient-to-br after:from-black/60 after:via-gray-900/70 after:to-black/80",
        border: "border-green-500/30",
        shine: "before:from-green-400/15 before:via-white/8 before:to-transparent",
        accent: "shadow-green-500/20"
      };
    case "expense":
      return {
        gradient: "after:bg-gradient-to-br after:from-black/60 after:via-gray-900/70 after:to-black/80",
        border: "border-red-500/30",
        shine: "before:from-red-400/15 before:via-white/8 before:to-transparent",
        accent: "shadow-red-500/20"
      };
    case "profit":
      return {
        gradient: "after:bg-gradient-to-br after:from-black/60 after:via-gray-900/70 after:to-black/80",
        border: "border-blue-500/30",
        shine: "before:from-blue-400/15 before:via-white/8 before:to-transparent",
        accent: "shadow-blue-500/20"
      };
    case "income":
      return {
        gradient: "after:bg-gradient-to-br after:from-black/60 after:via-gray-900/70 after:to-black/80",
        border: "border-green-500/30",
        shine: "before:from-green-400/15 before:via-white/8 before:to-transparent",
        accent: "shadow-green-500/20"
      };
    case "investment":
      return {
        gradient: "after:bg-gradient-to-br after:from-black/60 after:via-gray-900/70 after:to-black/80",
        border: "border-purple-500/30",
        shine: "before:from-purple-400/15 before:via-white/8 before:to-transparent",
        accent: "shadow-purple-500/20"
      };
    default:
      return {
        gradient: "after:bg-gradient-to-br after:from-black/60 after:via-gray-900/70 after:to-black/80",
        border: "border-gray-500/30",
        shine: "before:from-gray-400/15 before:via-white/8 before:to-transparent",
        accent: "shadow-gray-500/20"
      };
  }
};

const FinancialCard = React.forwardRef<HTMLDivElement, FinancialCardProps>(
  ({ className, variant = "neutral", ...props }, ref) => {
    const styles = getVariantStyles(variant);
    
    return (
      <div 
        ref={ref} 
        className={cn(
          "relative rounded-lg text-card-foreground backdrop-blur-xl overflow-hidden transition-all duration-300 hover:-translate-y-1",
          "shadow-2xl hover:shadow-3xl",
          styles.border,
          styles.accent,
          // Glass shine effect with colored tint
          `before:absolute before:inset-0 before:bg-gradient-to-br ${styles.shine} before:rounded-lg before:pointer-events-none`,
          // Black gradient background
          `after:absolute after:inset-0 ${styles.gradient} after:rounded-lg after:pointer-events-none`,
          className
        )} 
        {...props} 
      />
    );
  }
);
FinancialCard.displayName = "FinancialCard";

const FinancialCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("relative z-10 flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
FinancialCardHeader.displayName = "FinancialCardHeader";

const FinancialCardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight text-white", className)} {...props} />
  ),
);
FinancialCardTitle.displayName = "FinancialCardTitle";

const FinancialCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("relative z-10 p-6 pt-0", className)} {...props} />
  ),
);
FinancialCardContent.displayName = "FinancialCardContent";

const FinancialCardValue = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-4xl font-bold text-white mb-2", className)} {...props} />
  ),
);
FinancialCardValue.displayName = "FinancialCardValue";

const FinancialCardTrend = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm font-medium flex items-center gap-1", className)} {...props} />
  ),
);
FinancialCardTrend.displayName = "FinancialCardTrend";

export { 
  FinancialCard, 
  FinancialCardHeader, 
  FinancialCardTitle, 
  FinancialCardContent, 
  FinancialCardValue,
  FinancialCardTrend
};
