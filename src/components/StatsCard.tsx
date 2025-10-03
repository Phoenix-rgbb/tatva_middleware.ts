import { FinancialCard, FinancialCardContent, FinancialCardValue, FinancialCardTrend } from "@/components/ui/financial-card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  variant?: "revenue" | "expense" | "profit" | "income" | "neutral" | "investment";
  className?: string;
}

export function StatsCard({ 
  title, 
  value,
  icon: Icon, 
  trend, 
  variant = "neutral",
  className = "" 
}: StatsCardProps) {
  const getTrendColor = () => {
    if (!trend) return "";
    return trend.startsWith('+') ? "text-green-400" : "text-red-400";
  };

  return (
    <FinancialCard variant={variant} className={className}>
      <FinancialCardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-white/70">{title}</p>
            <FinancialCardValue>{value}</FinancialCardValue>
            {trend && (
              <FinancialCardTrend className={getTrendColor()}>
                {trend} from yesterday
              </FinancialCardTrend>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Icon className="h-6 w-6 text-white/80" />
          </div>
        </div>
      </FinancialCardContent>
      
      {/* Additional glassy shine effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-2 left-2 w-16 h-16 bg-white/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-2 right-2 w-12 h-12 bg-white/10 rounded-full blur-lg"></div>
      </div>
    </FinancialCard>
  );
}