import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, AlertTriangle, TrendingUp } from 'lucide-react';
import OrderFunnelChart from '@/components/charts/OrderFunnelChart';
import { performanceData as performanceDataMock, formatRupee } from '@/lib/mock-data';
import { useEffect, useState } from 'react';
import { loadMasterDatasetRows, loadInventorySnapshotRows, buildPerformanceFromRows } from '@/lib/data';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function PerformanceTab() {
  const [performanceData, setPerformanceData] = useState<any>(performanceDataMock);
  const [loading, setLoading] = useState(false);

  const loadPerformance = async () => {
    setLoading(true);
    try {
      const orders = await loadMasterDatasetRows('/master_dataset_enriched.csv').catch(() => loadMasterDatasetRows('/master_dataset.csv'));
      const inv = await loadInventorySnapshotRows('/inventory_snapshot.csv').catch(() => []);
      const built = buildPerformanceFromRows(orders, inv);
      setPerformanceData(built);
      setLoading(false);
      toast.success('Performance data updated');
    } catch (err) {
      setLoading(false);
      toast.error('Failed to load performance data, using fallback');
      setPerformanceData(performanceDataMock);
    }
  };

  useEffect(() => {
    loadPerformance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleDownload = () => {
    toast.success('Performance report downloaded successfully');
  };
  
  const handleRefresh = () => {
    toast.info('Refreshing performance data...');
    loadPerformance();
  };

  // Calculate the funnel data for the chart
  const funnelData = [
    { name: 'Orders Placed', value: performanceData?.orderFunnel?.placed ?? 0, fill: 'hsl(var(--primary))' },
    { name: 'Orders Shipped', value: performanceData?.orderFunnel?.shipped ?? 0, fill: 'hsl(var(--accent))' },
    { name: 'Orders Delivered', value: performanceData?.orderFunnel?.delivered ?? 0, fill: 'hsl(var(--success))' },
    { name: 'RTO', value: performanceData?.orderFunnel?.rto ?? 0, fill: 'hsl(var(--destructive))' },
    { name: 'Orders Remitted', value: performanceData?.orderFunnel?.remitted ?? 0, fill: 'hsl(var(--warning))' }
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Performance Analytics</h2>
          <p className="text-muted-foreground">
            Track key performance metrics and identify opportunities
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Performance Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Overall RTO Rate", value: `${performanceData?.summary?.overallRto ?? performanceData?.rtoRates?.overall ?? 0}%`, change: "-2%", positive: true, icon: AlertTriangle },
          { label: "COD Orders", value: `${performanceData?.summary?.codPct ?? 0}%`, change: "+5%", positive: false, icon: TrendingUp },
          { label: "Avg. Remittance Time", value: `${performanceData?.summary?.avgRemittanceDays ?? 0} days`, change: "-1.5", positive: true, icon: TrendingUp },
          { label: "Delivery Success Rate", value: `${performanceData?.summary?.deliverySuccessRate ?? 0}%`, change: "+3%", positive: true, icon: TrendingUp }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <h3 className="text-xl md:text-2xl font-semibold mt-1">{stat.value}</h3>
                </div>
                <div className={`flex items-center text-sm ${stat.positive ? 'text-success' : 'text-destructive'}`}>
                  {stat.positive ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 transform rotate-180"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                  )}
                  {stat.change}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Funnel */}
        <OrderFunnelChart 
          title="Order Funnel"
          description="Order lifecycle from placement to remittance"
          height={400}
          isAnimated={false}
          data={funnelData}
        />
        
        {/* Payment Method Split */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method Split</CardTitle>
            <CardDescription>Distribution of orders by payment method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {performanceData.paymentSplit.map((method, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{method.method}</span>
                  <span className="text-sm text-muted-foreground">{method.percentage}%</span>
                </div>
                <Progress value={method.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      
      {/* RTO Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RTO by Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>RTO by Payment Method</CardTitle>
            <CardDescription>Return to origin rates by payment type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {performanceData.rtoRates.byPaymentMethod.map((method, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{method.method}</span>
                  <Badge variant={method.rate > 15 ? "destructive" : "default"}>
                    {method.rate}% RTO
                  </Badge>
                </div>
                <Progress 
                  value={method.rate} 
                  max={30}
                  className={`h-2 ${method.rate > 15 ? 'bg-destructive/20' : ''}`}
                />
              </div>
            ))}
          </CardContent>
        </Card>
        
        {/* RTO by Courier */}
        <Card>
          <CardHeader>
            <CardTitle>RTO by Courier Partner</CardTitle>
            <CardDescription>Return to origin rates by courier service</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {performanceData.rtoRates.byCourier.map((courier, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{courier.courier}</span>
                  <Badge variant={courier.rate > 12 ? "destructive" : "default"}>
                    {courier.rate}% RTO
                  </Badge>
                </div>
                <Progress 
                  value={courier.rate} 
                  max={30}
                  className={`h-2 ${courier.rate > 12 ? 'bg-destructive/20' : ''}`}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      
      {/* Correlations */}
      <Card>
        <CardHeader>
          <CardTitle>Key Correlations</CardTitle>
          <CardDescription>AI-detected patterns and correlations in your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.correlations.map((correlation, i) => (
              <div key={i} className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-primary/20 p-2 rounded-full">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div className="font-medium">
                    {correlation.factor1} → {correlation.factor2}
                  </div>
                  <Badge variant="outline" className="ml-auto">
                    Correlation: {correlation.strength}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{correlation.insight}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}