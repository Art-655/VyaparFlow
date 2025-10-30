import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

// Sample data
const sampleData = [
  { days: '1-3', count: 42 },
  { days: '4-7', count: 78 },
  { days: '8-14', count: 35 },
  { days: '15+', count: 12 }
];

interface RemittanceDaysChartProps {
  title?: string;
  description?: string;
  isAnimated?: boolean;
  height?: number;
  className?: string;
  data?: typeof sampleData;
}

// High-contrast, readable slice colors
const COLORS = ['#2563EB', '#16A34A', '#F59E0B', '#DC2626']; // blue-600, green-600, amber-500, red-600

export default function RemittanceDaysChart({
  title = "Remittance Days Distribution",
  description = "Distribution of orders by remittance time",
  isAnimated = true,
  height = 300,
  className = "",
  data = sampleData
}: RemittanceDaysChartProps) {
  const [chartData, setChartData] = useState<typeof data>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isAnimated) {
      // Animate the data loading
      const timer = setTimeout(() => {
        setChartData(data);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setChartData(data);
    }
  }, [isAnimated, data]);

  // Calculate percentages
  const total = chartData.reduce((sum, item) => sum + item.count, 0);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
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
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={isMobile ? 80 : 110}
                fill="#8884d8"
                dataKey="count"
                nameKey="days"
                stroke="#ffffff"
                strokeWidth={2}
                animationDuration={isAnimated ? 1500 : 0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                formatter={(value, entry: any) => {
                  const d = entry && entry.payload ? entry.payload : undefined;
                  const label = d?.days ?? value;
                  const percentage = d ? ((d.count / (total || 1)) * 100).toFixed(0) : '0';
                  return <span className="text-sm">{`${label} (${percentage}%)`}</span>;
                }}
              />
              <Tooltip
                formatter={(value: number) => [`${value} orders`, 'Count']}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: 'var(--radius)',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}