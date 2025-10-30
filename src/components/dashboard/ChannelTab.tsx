import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChannelComparisonChart from '@/components/charts/ChannelComparisonChart';
import { channelData as channelDataMock, formatRupee } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { buildPerformanceFromRows, loadInventorySnapshotRows, loadMasterDatasetRows } from '@/lib/data';

export default function ChannelTab() {
  const [metricType, setMetricType] = useState<'orders' | 'revenue' | 'rto' | 'remittanceDelay'>('orders');
  const [channelData, setChannelData] = useState(channelDataMock);
  const [loading, setLoading] = useState(false);
  
  const loadChannel = async () => {
    setLoading(true);
    try {
      const orders = await loadMasterDatasetRows('/master_dataset_enriched.csv').catch(() => loadMasterDatasetRows('/master_dataset.csv'));
      const inv = await loadInventorySnapshotRows('/inventory_snapshot.csv').catch(() => []);
      const built = buildPerformanceFromRows(orders, inv);
      setChannelData(built.channelData);
      setLoading(false);
      toast.success('Channel data updated');
    } catch (err) {
      setLoading(false);
      toast.error('Failed to load channel data, using fallback');
      setChannelData(channelDataMock);
    }
  };
  
  useEffect(() => {
    loadChannel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleDownload = () => {
    toast.success('Channel analysis report downloaded successfully');
  };
  
  const handleRefresh = () => {
    toast.info('Refreshing channel data...');
    loadChannel();
  };

  // derive summary from live channel data
  const bestCourier = channelData.courierComparison.slice().sort((a, b) => b.orders - a.orders)[0];
  const worstRto = channelData.courierComparison.slice().sort((a, b) => b.rto - a.rto)[0];
  const fastestRemit = channelData.courierComparison.slice().filter(c => c.remittanceDelay > 0).sort((a, b) => a.remittanceDelay - b.remittanceDelay)[0];
  const topRegion = channelData.geographicInsights.slice().sort((a, b) => b.revenue - a.revenue)[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Channel Analytics</h2>
          <p className="text-muted-foreground">
            Compare performance across payment methods and courier partners
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
      
      {/* Channel Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Best Courier", value: bestCourier?.courier ?? '—', metric: bestCourier ? `Orders: ${bestCourier.orders}` : 'Orders: —' },
          { label: "Worst RTO Rate", value: worstRto?.courier ?? '—', metric: worstRto ? `RTO: ${worstRto.rto}%` : 'RTO: —' },
          { label: "Fastest Remittance", value: fastestRemit?.courier ?? '—', metric: fastestRemit ? `${fastestRemit.remittanceDelay} days avg.` : '—' },
          { label: "Highest Value Region", value: topRegion?.region ?? '—', metric: topRegion ? `${formatRupee(topRegion.revenue)}` : '—' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <h3 className="text-xl font-semibold mt-1">{stat.value}</h3>
                <p className="text-sm text-muted-foreground mt-1">{stat.metric}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Courier Partner Comparison */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Courier Partner Comparison</CardTitle>
              <CardDescription>Performance metrics across courier services</CardDescription>
            </div>
            <Tabs 
              defaultValue="orders" 
              className="w-[300px]"
              onValueChange={(value) => setMetricType(value as any)}
            >
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="rto">RTO %</TabsTrigger>
                <TabsTrigger value="remittanceDelay">Delays</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <ChannelComparisonChart
            title=""
            description=""
            height={350}
            isAnimated={false}
            data={channelData.courierComparison}
            metric={metricType}
          />
          
          <div className="mt-6 rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-2 font-medium text-left">Courier</th>
                    <th className="p-2 font-medium text-left">Orders</th>
                    <th className="p-2 font-medium text-left">Revenue</th>
                    <th className="p-2 font-medium text-left">RTO %</th>
                    <th className="p-2 font-medium text-left">Remittance (days)</th>
                  </tr>
                </thead>
                <tbody>
                  {channelData.courierComparison.map((courier, i) => (
                    <tr key={i} className="border-t border-border hover:bg-muted/50">
                      <td className="p-2 font-medium">{courier.courier}</td>
                      <td className="p-2">{courier.orders}</td>
                      <td className="p-2">{formatRupee(courier.revenue)}</td>
                      <td className="p-2">
                        <Badge variant={courier.rto > 12 ? "destructive" : "default"}>
                          {courier.rto}%
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant={courier.remittanceDelay > 10 ? "warning" : "outline"}>
                          {courier.remittanceDelay} days
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Method Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method Comparison</CardTitle>
            <CardDescription>COD vs Prepaid performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="p-2 font-medium text-left">Method</th>
                      <th className="p-2 font-medium text-left">Orders</th>
                      <th className="p-2 font-medium text-left">Revenue</th>
                      <th className="p-2 font-medium text-left">RTO %</th>
                      <th className="p-2 font-medium text-left">Remittance (days)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {channelData.paymentComparison.map((method, i) => (
                      <tr key={i} className="border-t border-border hover:bg-muted/50">
                        <td className="p-2 font-medium">{method.method}</td>
                        <td className="p-2">{method.orders}</td>
                        <td className="p-2">{formatRupee(method.revenue)}</td>
                        <td className="p-2">
                          <Badge variant={method.rto > 10 ? "destructive" : "default"}>
                            {method.rto}%
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Badge variant={method.remittanceDelay > 7 ? "warning" : "outline"}>
                            {method.remittanceDelay} days
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Geographic Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Geographic Insights</CardTitle>
            <CardDescription>Regional performance breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="p-2 font-medium text-left">Region</th>
                      <th className="p-2 font-medium text-left">Orders</th>
                      <th className="p-2 font-medium text-left">Revenue</th>
                      <th className="p-2 font-medium text-left">RTO %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {channelData.geographicInsights.map((region, i) => (
                      <tr key={i} className="border-t border-border hover:bg-muted/50">
                        <td className="p-2 font-medium">{region.region}</td>
                        <td className="p-2">{region.orders}</td>
                        <td className="p-2">{formatRupee(region.revenue)}</td>
                        <td className="p-2">
                          <Badge variant={region.rto > 12 ? "destructive" : "default"}>
                            {region.rto}%
                          </Badge>
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
      
      {/* RTO Hotspots */}
      <Card>
        <CardHeader>
          <CardTitle>RTO Hotspots</CardTitle>
          <CardDescription>Locations with highest return to origin rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-2 font-medium text-left">Pincode</th>
                    <th className="p-2 font-medium text-left">City</th>
                    <th className="p-2 font-medium text-left">RTO Rate</th>
                    <th className="p-2 font-medium text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {channelData.rtoHotspots.map((hotspot, i) => (
                    <tr key={i} className="border-t border-border hover:bg-muted/50">
                      <td className="p-2">{hotspot.pincode}</td>
                      <td className="p-2">{hotspot.city}</td>
                      <td className="p-2">
                        <Badge variant="destructive">
                          {hotspot.rtoRate}%
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toast.info(`Analyzing RTO issues for ${hotspot.city}`)}
                        >
                          Analyze Issues
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