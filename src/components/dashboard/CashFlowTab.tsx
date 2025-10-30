import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, Download, RefreshCw } from 'lucide-react';
import CashFlowChart from '@/components/charts/CashFlowChart';
import RemittanceDaysChart from '@/components/charts/RemittanceDaysChart';
import { cashFlowData, formatRupee } from '@/lib/mock-data';
import { buildCashFlowFromRows, loadMasterDatasetRows, type RawRow } from '@/lib/data';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function CashFlowTab() {
  const [timeFrame, setTimeFrame] = useState('30days');
  const [data, setData] = useState<any>(cashFlowData);
  const [rows, setRows] = useState<RawRow[] | null>(null);
  const tfToDays = (tf: string) => (tf === '7days' ? 7 : tf === '30days' ? 30 : 90);
  
  const handleDownload = () => {
    toast.success('Cash flow report downloaded successfully');
  };
  
  const handleRefresh = () => {
    toast.info('Refreshing cash flow data...');
    // attempt to reload master CSV rows and recompute for current timeframe
    loadMasterDatasetRows()
      .then(r => {
        setRows(r);
        const computed = buildCashFlowFromRows(r, { timeframeDays: tfToDays(timeFrame) });
        setData(computed);
        toast.success('Cash flow data updated');
      })
      .catch(() => {
        toast.error('Failed to load master_dataset.csv — using mock data');
      });
  };

  useEffect(() => {
    let mounted = true;
    loadMasterDatasetRows()
      .then(r => {
        if (!mounted) return;
        setRows(r);
        const computed = buildCashFlowFromRows(r, { timeframeDays: tfToDays(timeFrame) });
        setData(computed);
        toast.success('Loaded master_dataset.csv');
      })
      .catch(() => {
        // keep mock data and notify silently
        toast.error('master_dataset.csv not found or failed to parse — using mock data');
      });
    return () => { mounted = false; };
  }, []);

  // Recompute when timeframe changes
  useEffect(() => {
    if (!rows) return;
    const computed = buildCashFlowFromRows(rows, { timeframeDays: tfToDays(timeFrame) });
    setData(computed);
  }, [timeFrame, rows]);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Cash Flow Analytics</h2>
          <p className="text-muted-foreground">
            Track, predict, and optimize your D2C brand's cash flow
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Tabs defaultValue="30days" className="w-[260px]" onValueChange={setTimeFrame}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="7days">7 Days</TabsTrigger>
              <TabsTrigger value="30days">30 Days</TabsTrigger>
              <TabsTrigger value="90days">90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Sales", value: formatRupee(data.summary.totalSales), change: "+12%", positive: true },
          { label: "Pending COD", value: formatRupee(data.summary.pendingCOD), change: "-5%", positive: false },
          { label: "Predicted Cash In", value: formatRupee(data.summary.predictedCashIn), change: "+8%", positive: true },
          { label: "Available Cash", value: formatRupee(data.summary.availableCash), change: "+15%", positive: true }
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
        {/* Cash Flow Forecast */}
        <TabsContent value={timeFrame} className="mt-0 p-0 border-none" forceMount={true}>
          <CashFlowChart 
            title="Cash Flow Forecast" 
            description={`Predicted vs. Actual Cash In (${timeFrame === '7days' ? 'Last 7 days' : timeFrame === '30days' ? 'Last 30 days' : 'Last 90 days'})`}
            height={350}
            isAnimated={false}
            data={data.forecast}
          />
        </TabsContent>
        
        {/* Remittance Days Distribution */}
        <RemittanceDaysChart 
          title="Remittance Days Distribution"
          description="Time taken for COD payments to be remitted"
          height={350}
          isAnimated={false}
          data={data.remittanceDays}
        />
      </div>
      
      {/* Exceptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Delayed Remittances</CardTitle>
          <CardDescription>Orders with delayed remittance beyond expected timeframe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-2 font-medium text-left">Order ID</th>
                    <th className="p-2 font-medium text-left">Amount</th>
                    <th className="p-2 font-medium text-left">Delay (Days)</th>
                    <th className="p-2 font-medium text-left">Courier</th>
                    <th className="p-2 font-medium text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.exceptions.map((order, i) => (
                    <tr key={i} className="border-t border-border hover:bg-muted/50">
                      <td className="p-2">{order.orderId}</td>
                      <td className="p-2">{formatRupee(order.amount)}</td>
                      <td className="p-2">
                        <span className="font-medium text-destructive">{order.delay} days</span>
                      </td>
                      <td className="p-2">{order.courier}</td>
                      <td className="p-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toast.info(`Follow-up initiated for order ${order.orderId}`)}
                        >
                          Follow up
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* High RTO Orders */}
      <Card>
        <CardHeader>
          <CardTitle>High RTO Orders</CardTitle>
          <CardDescription>Recent orders with return to origin status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-2 font-medium text-left">Order ID</th>
                    <th className="p-2 font-medium text-left">Amount</th>
                    <th className="p-2 font-medium text-left">Reason</th>
                    <th className="p-2 font-medium text-left">Courier</th>
                    <th className="p-2 font-medium text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.highRtoOrders.map((order, i) => (
                    <tr key={i} className="border-t border-border hover:bg-muted/50">
                      <td className="p-2">{order.orderId}</td>
                      <td className="p-2">{formatRupee(order.amount)}</td>
                      <td className="p-2">
                        <span className="font-medium text-destructive">{order.reason}</span>
                      </td>
                      <td className="p-2">{order.courier}</td>
                      <td className="p-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toast.info(`Details viewed for order ${order.orderId}`)}
                        >
                          View details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}