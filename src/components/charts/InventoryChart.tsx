import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

// Sample data
const sampleData = [
  { product: "Classic Blue Kurta", units_to_restock: 85 },
  { product: "Handwoven Silk Saree", units_to_restock: 50 },
  { product: "Silver Jhumka Earrings", units_to_restock: 120 },
  { product: "Leather Kolhapuri Chappal", units_to_restock: 70 },
  { product: "Men's Linen Shirt", units_to_restock: 95 }
];

interface InventoryChartProps {
  title?: string;
  description?: string;
  isAnimated?: boolean;
  height?: number;
  className?: string;
  data?: typeof sampleData;
  style?: 'solid' | 'labelled' | 'stacked';
}

export default function InventoryChart({
  title = "Inventory Advisor",
  description = "Top 5 Recommended Products to Restock",
  isAnimated = true,
  height = 300,
  className = "",
  data = sampleData,
  style = 'solid'
}: InventoryChartProps) {
  const [chartData, setChartData] = useState<typeof sampleData>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isAnimated) {
      // Animate the data loading
      const timer = setTimeout(() => {
        setChartData([...data].sort((a, b) => b.units_to_restock - a.units_to_restock));
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setChartData([...data].sort((a, b) => b.units_to_restock - a.units_to_restock));
    }
  }, [isAnimated, data]);

  // Truncate long product names (shorter on mobile, longer on desktop)
  const formatProductName = (name: string) => {
    const limit = isMobile ? 15 : 20;
    if (name.length > limit) return `${name.slice(0, limit)}...`;
    return name;
  };

  // Custom tooltip that shows full product name and riskScore if available
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0].payload as any;
    return (
      <div className="p-2 bg-white border rounded shadow">
        <div className="text-sm font-semibold">{p.product}</div>
        <div className="text-xs text-muted-foreground">Units to Restock: {p.units_to_restock}</div>
        {p.riskScore !== undefined && (
          <div className="text-xs">Risk: {p.riskScore}%</div>
        )}
      </div>
    );
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                top: 5,
                right: 30,
                left: isMobile ? 60 : 140,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis 
                dataKey="product" 
                type="category" 
                tick={{ fontSize: 12 }}
                tickFormatter={formatProductName}
                width={isMobile ? 80 : 140}
              />
              <Tooltip content={<CustomTooltip />} />
              {style === 'stacked' ? (
                // stacked visualization: units_to_restock + risk-scaled segment
                (() => {
                  const maxUnits = Math.max(...chartData.map((d: any) => d.units_to_restock), 1);
                  const stackedData = chartData.map((d: any) => ({
                    ...d,
                    riskUnits: Math.round(((d.riskScore ?? 0) / 100) * maxUnits)
                  }));
                  return (
                    <>
                      <Bar dataKey="units_to_restock" name="Units to Restock" fill="#2563eb" radius={[0,4,4,0]} animationDuration={isAnimated ? 1500 : 0} />
                      <Bar dataKey="riskUnits" name="Risk (scaled)" fill="#f97316" radius={[0,4,4,0]} animationDuration={isAnimated ? 1500 : 0} />
                    </>
                  );
                })()
              ) : (
                <Bar 
                  dataKey="units_to_restock" 
                  name="Units to Restock" 
                  fill="hsl(var(--primary))" 
                  radius={[0, 4, 4, 0]}
                  animationDuration={isAnimated ? 1500 : 0}
                >
                  {chartData.map((entry, idx) => {
                    // color bars by riskScore if available
                    const risk = (entry as any).riskScore ?? 0;
                    // green (low) -> yellow (mid) -> red (high)
                    const color = risk >= 66 ? '#ef4444' : risk >= 33 ? '#f59e0b' : '#10b981';
                    return <Cell key={`cell-${idx}`} fill={color} />;
                  })}
                  {style === 'labelled' && <LabelList dataKey="units_to_restock" position="right" formatter={(v:any)=>`${v}`} />}
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}