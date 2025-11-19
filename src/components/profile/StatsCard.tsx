import React from "react";
import { Card, CardContent } from "@/components/ui/card";

type StatsCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  gradient: string;
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
}: StatsCardProps) {
  return (
    <Card
      className={`bg-gradient-to-br ${gradient} border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300`}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium opacity-90 uppercase tracking-wide">
              {title}
            </p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {subtitle && (
              <p className="text-sm opacity-75 mt-1">{subtitle}</p>
            )}
          </div>
          {Icon && (
            <div className="bg-white/20 p-3 rounded-xl">
              <Icon className="w-6 h-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
