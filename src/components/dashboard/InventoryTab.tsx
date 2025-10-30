import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, Search } from 'lucide-react';
import InventoryChart from '@/components/charts/InventoryChart';
import { inventoryData, formatRupee } from '@/lib/mock-data';
import { buildInventoryFromRows, loadInventorySnapshotRows, loadMasterDatasetRows } from '@/lib/data';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function InventoryTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState(inventoryData);
  const [chartStyle, setChartStyle] = useState<'solid' | 'labelled' | 'stacked'>('solid');

  // Load live inventory data from both datasets
  useEffect(() => {
    const load = async () => {
      try {
        const [orders, inv] = await Promise.all([
          loadMasterDatasetRows('/master_dataset.csv'),
          loadInventorySnapshotRows('/inventory_snapshot.csv')
        ]);
        const built = buildInventoryFromRows(orders, inv);
        setData(built);
      } catch (e) {
        console.error('Inventory load failed, using mock fallback', e);
        toast.error('Failed to load live inventory. Showing sample data.');
      }
    };
    load();
  }, []);
  
  const handleDownload = () => {
    toast.success('Inventory report downloaded successfully');
  };
  
  const handleRefresh = async () => {
    toast.info('Refreshing inventory data...');
    try {
      const [orders, inv] = await Promise.all([
        loadMasterDatasetRows('/master_dataset.csv'),
        loadInventorySnapshotRows('/inventory_snapshot.csv')
      ]);
      const built = buildInventoryFromRows(orders, inv);
      setData(built);
      toast.success('Inventory data updated');
    } catch (e) {
      console.error(e);
      toast.error('Failed to refresh inventory');
    }
  };

  const handleReorder = (product: string) => {
    toast.success(`Reorder initiated for ${product}`);
  };
  
  // Filter products based on search query
  const filteredTopSelling = searchQuery 
    ? data.topSelling.filter(item => 
        item.product.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : data.topSelling;
    
  const filteredSlowMoving = searchQuery 
    ? data.slowMoving.filter(item => 
        item.product.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : data.slowMoving;

  const filteredReorderSignals = searchQuery
    ? data.reorderSignals.filter(item =>
        item.product.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : data.reorderSignals;

  const filteredSalesDensity = searchQuery
    ? data.salesDensity.filter(loc =>
        (loc.pincode || '').toString().includes(searchQuery) || (loc.city || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : data.salesDensity;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Inventory Analytics</h2>
          <p className="text-muted-foreground">
            Track sales performance and optimize your inventory
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search products..." 
              className="pl-8 w-[200px]" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Inventory Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: (data as any).summary?.totalProducts ?? 120, change: "+5", positive: true },
          { label: "Low Stock Items", value: (data as any).summary?.lowStockItems ?? 18, change: "-3", positive: true },
          { label: "Out of Stock", value: (data as any).summary?.outOfStock ?? 7, change: "+2", positive: false },
          { label: "Avg. Inventory Age", value: `${(data as any).summary?.avgInventoryAge ?? 32} days`, change: "-4", positive: true }
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
        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Products with highest sales volume and revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="p-2 font-medium text-left">Product</th>
                      <th className="p-2 font-medium text-left">Units Sold</th>
                      <th className="p-2 font-medium text-left">Revenue</th>
                      <th className="p-2 font-medium text-left">Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTopSelling.map((product, i) => (
                      <tr key={i} className="border-t border-border hover:bg-muted/50">
                        <td className="p-2 font-medium">{product.product}</td>
                        <td className="p-2">{product.units_sold}</td>
                        <td className="p-2">{formatRupee(product.revenue)}</td>
                        <td className="p-2">
                          <Badge variant={product.margin > 50 ? "success" : "default"}>
                            {product.margin}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {filteredTopSelling.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-muted-foreground">
                          No products found matching your search
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Slow Moving Products */}
        <Card>
          <CardHeader>
            <CardTitle>Slow Moving Products</CardTitle>
            <CardDescription>Products with low sales velocity requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="p-2 font-medium text-left">Product</th>
                      <th className="p-2 font-medium text-left">Units Sold</th>
                      <th className="p-2 font-medium text-left">Inventory</th>
                      <th className="p-2 font-medium text-left">Days in Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSlowMoving.map((product, i) => (
                      <tr key={i} className="border-t border-border hover:bg-muted/50">
                        <td className="p-2 font-medium">{product.product}</td>
                        <td className="p-2">{product.units_sold}</td>
                        <td className="p-2">{product.inventory}</td>
                        <td className="p-2">
                          <Badge variant={product.days_in_stock > 50 ? "destructive" : "default"}>
                            {product.days_in_stock} days
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {filteredSlowMoving.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-muted-foreground">
                          No products found matching your search
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Reorder Signals */}
      <Card>
        <CardHeader>
          <CardTitle>Reorder Signals</CardTitle>
          <CardDescription>AI-powered recommendations for inventory replenishment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div />
            <div className="flex items-center gap-2">
              <Button variant={chartStyle === 'solid' ? 'default' : 'ghost'} size="sm" onClick={() => setChartStyle('solid')}>Solid</Button>
              <Button variant={chartStyle === 'labelled' ? 'default' : 'ghost'} size="sm" onClick={() => setChartStyle('labelled')}>Labels</Button>
              <Button variant={chartStyle === 'stacked' ? 'default' : 'ghost'} size="sm" onClick={() => setChartStyle('stacked')}>Stacked</Button>
            </div>
          </div>
          <div className="mt-3">
            <InventoryChart 
              title=""
              description=""
              height={300}
              isAnimated={false}
              data={data.reorderSignals}
              style={chartStyle}
            />
          </div>
          
          <div className="mt-6 rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-2 font-medium text-left">Product</th>
                    <th className="p-2 font-medium text-left">Units to Restock</th>
                      <th className="p-2 font-medium text-left">Urgency</th>
                      <th className="p-2 font-medium text-left">Risk</th>
                    <th className="p-2 font-medium text-left">Margin</th>
                    <th className="p-2 font-medium text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReorderSignals.map((product, i) => (
                    <tr key={i} className="border-t border-border hover:bg-muted/50">
                      <td className="p-2 font-medium">{product.product}</td>
                      <td className="p-2">{product.units_to_restock}</td>
                      <td className="p-2">
                        <Badge variant={product.urgency === "High" ? "destructive" : "default"}>
                          {product.urgency}
                        </Badge>
                      </td>
                      <td className="p-2">
                        {(() => {
                          const risk = (product as any).riskScore ?? 0;
                          const variant = risk >= 66 ? 'destructive' : risk >= 33 ? 'warning' : 'default';
                          return (
                            <Badge variant={variant}>
                              {risk}%
                            </Badge>
                          );
                        })()}
                      </td>
                      <td className="p-2">{product.margin}%</td>
                      <td className="p-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleReorder(product.product)}
                        >
                          Reorder
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
      
      {/* Sales Density by Location */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Density by Location</CardTitle>
          <CardDescription>Geographic distribution of sales and revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-2 font-medium text-left">Pincode</th>
                    <th className="p-2 font-medium text-left">City</th>
                    <th className="p-2 font-medium text-left">Orders</th>
                    <th className="p-2 font-medium text-left">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSalesDensity.map((location, i) => (
                    <tr key={i} className="border-t border-border hover:bg-muted/50">
                      <td className="p-2">{location.pincode}</td>
                      <td className="p-2">{location.city}</td>
                      <td className="p-2">{location.orders}</td>
                      <td className="p-2">{formatRupee(location.revenue)}</td>
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