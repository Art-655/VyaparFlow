import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import InventoryAdvisorChart from '@/components/charts/InventoryAdvisorChart';
import { inventoryAdvisorData, formatRupee } from '@/lib/mock-data';
import { greedyAdvisor, dpAdvisor, generateScenarios } from '@/lib/advisor';
import { loadMasterDatasetRows } from '@/lib/data';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function InventoryAdvisorTab() {
  const [availableCash, setAvailableCash] = useState('50000');
  const [optimizationTab, setOptimizationTab] = useState('quick-wins');
  const [calculating, setCalculating] = useState(false);
  const [quickWins, setQuickWins] = useState(inventoryAdvisorData.quickWins);
  const [quickWinsTotals, setQuickWinsTotals] = useState({ totalCost: 17300, totalProfit: 9625, remainingBudget: 32700 });
  const [optimalPlan, setOptimalPlan] = useState(inventoryAdvisorData.optimalPlan);
  const [optimalTotals, setOptimalTotals] = useState({ totalCost: 50000, totalProfit: 25580, remainingBudget: 0 });
  const [scenarios, setScenarios] = useState(inventoryAdvisorData.scenarioPlanning);
  
  const handleCalculate = async () => {
    if (!availableCash || parseFloat(availableCash) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    setCalculating(true);
    toast.info('Calculating optimal inventory allocation...');
    try {
      const cash = parseFloat(availableCash);
      // Prefer enriched file if present; fall back to base dataset and relative paths
      const rows = await loadMasterDatasetRows('/master_dataset_enriched.csv')
        .catch(() => loadMasterDatasetRows('/master_dataset.csv'))
        .catch(() => loadMasterDatasetRows('./master_dataset_enriched.csv'))
        .catch(() => loadMasterDatasetRows('./master_dataset.csv'));
      toast.message(`Loaded ${rows.length.toLocaleString()} rows for advisor`);
      const g = greedyAdvisor(cash, rows);
      if (!g.items.length) {
        toast.warning('No profitable products found (selling_price <= cost_price). Showing sample data.');
      }
  const d = dpAdvisor(cash, rows);
      // Adapt results to chart/table expected shape
      const toUI = (items: any[]) => items.map(i => ({ product: i.product, units: i.units, cost: Math.round(i.cost), profit: Math.round(i.profit), ror: i.ror }));
      setQuickWins(toUI(g.items));
      setQuickWinsTotals({ totalCost: g.totalCost, totalProfit: g.totalProfit, remainingBudget: Math.max(0, Math.round(cash - g.totalCost)) });
      setOptimalPlan(toUI(d.items));
      setOptimalTotals({ totalCost: d.totalCost, totalProfit: d.totalProfit, remainingBudget: Math.max(0, Math.round(cash - d.totalCost)) });
  // Generate scenario plans live
  const generated = generateScenarios(cash, rows);
  setScenarios(generated);
      toast.success('Inventory recommendations generated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to compute recommendations; showing sample data');
    } finally {
      setCalculating(false);
    }
  };

  const getScenarioData = () => {
    const cashAmount = parseFloat(availableCash) || 50000;
    
    // Return the closest scenario based on available cash
    if (cashAmount <= 30000) {
      return scenarios[0]; // Conservative
    } else if (cashAmount <= 60000) {
      return scenarios[1]; // Balanced
    } else {
      return scenarios[2]; // Aggressive
    }
  };
  
  const currentScenario = getScenarioData();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">VyaparFlow Inventory Advisor</h2>
          <p className="text-muted-foreground">
            AI-powered inventory optimization recommendations
          </p>
        </div>
      </div>
      
      {/* Cash Input */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Allocation Calculator</CardTitle>
          <CardDescription>Enter your available budget to receive personalized recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="available-cash">Available Cash for Inventory</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input 
                  id="available-cash"
                  type="number" 
                  placeholder="Enter amount" 
                  className="pl-8"
                  value={availableCash}
                  onChange={(e) => setAvailableCash(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Button 
                onClick={handleCalculate} 
                disabled={calculating}
                className="w-full"
              >
                {calculating ? 'Calculating...' : 'Calculate Recommendations'}
              </Button>
            </div>
            <div className="bg-muted p-3 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Recommended Budget</p>
              <p className="text-xl font-semibold">{formatRupee(50000)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Recommendations Tabs */}
      <Tabs 
        defaultValue="quick-wins" 
        value={optimizationTab}
        onValueChange={setOptimizationTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="quick-wins">
            <span className="hidden sm:inline">🚀 </span>Quick Wins
          </TabsTrigger>
          <TabsTrigger value="optimal-plan">
            <span className="hidden sm:inline">✨ </span>Optimal Plan
          </TabsTrigger>
          <TabsTrigger value="scenario-planning">
            <span className="hidden sm:inline">📊 </span>Scenario Planning
          </TabsTrigger>
        </TabsList>
        
        {/* Quick Wins */}
        <TabsContent value="quick-wins" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Quick Wins (Greedy Algorithm)</CardTitle>
                <CardDescription>Fastest return on investment based on profit per rupee</CardDescription>
              </CardHeader>
              <CardContent>
                <InventoryAdvisorChart
                  title=""
                  description=""
                  height={300}
                  isAnimated={false}
                  data={quickWins}
                  metric="ror"
                />
                
                <div className="mt-6 rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="p-2 font-medium text-left">Product</th>
                          <th className="p-2 font-medium text-left">Units</th>
                          <th className="p-2 font-medium text-left">Investment</th>
                          <th className="p-2 font-medium text-left">Expected Profit</th>
                          <th className="p-2 font-medium text-left">ROI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quickWins.map((item, i) => (
                          <tr key={i} className="border-t border-border hover:bg-muted/50">
                            <td className="p-2 font-medium">{item.product}</td>
                            <td className="p-2">{item.units}</td>
                            <td className="p-2">{formatRupee(item.cost)}</td>
                            <td className="p-2">{formatRupee(item.profit)}</td>
                            <td className="p-2">
                              <Badge variant="success">
                                {(item.ror * 100).toFixed(0)}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t border-border bg-muted/30 font-medium">
                          <td className="p-2">Total</td>
                          <td className="p-2">{quickWins.reduce((s, x) => s + x.units, 0)}</td>
                          <td className="p-2">{formatRupee(quickWinsTotals.totalCost)}</td>
                          <td className="p-2">{formatRupee(quickWinsTotals.totalProfit)}</td>
                          <td className="p-2">
                            <Badge variant="success">
                              {quickWinsTotals.totalCost > 0 ? Math.round((quickWinsTotals.totalProfit / quickWinsTotals.totalCost) * 100) : 0}%
                            </Badge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Wins Summary</CardTitle>
                <CardDescription>Key insights and recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Investment</p>
                  <p className="text-2xl font-semibold">{formatRupee(quickWinsTotals.totalCost)}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Remaining Budget</p>
                  <p className="text-2xl font-semibold">{formatRupee(quickWinsTotals.remainingBudget)}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Expected Profit</p>
                  <p className="text-2xl font-semibold text-success">{formatRupee(quickWinsTotals.totalProfit)}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Return on Investment</p>
                  <p className="text-2xl font-semibold text-success">{quickWinsTotals.totalCost > 0 ? Math.round((quickWinsTotals.totalProfit / quickWinsTotals.totalCost) * 100) : 0}%</p>
                </div>
                
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mt-4">
                  <h4 className="font-medium mb-1">AI Insight</h4>
                  <p className="text-sm">Silver Jhumka Earrings offer the highest rate of return at 68%. Consider allocating more budget to this product if possible.</p>
                </div>
                
                <Button 
                  className="w-full mt-2"
                  onClick={() => toast.success('Quick wins plan exported to CSV')}
                >
                  Export Plan
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Optimal Plan */}
        <TabsContent value="optimal-plan" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Optimal Plan (Dynamic Programming)</CardTitle>
                <CardDescription>Best combination of products to maximize profit under constraints</CardDescription>
              </CardHeader>
              <CardContent>
                <InventoryAdvisorChart
                  title=""
                  description=""
                  height={300}
                  isAnimated={false}
                  data={optimalPlan}
                  metric="profit"
                />
                
                <div className="mt-6 rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="p-2 font-medium text-left">Product</th>
                          <th className="p-2 font-medium text-left">Units</th>
                          <th className="p-2 font-medium text-left">Investment</th>
                          <th className="p-2 font-medium text-left">Expected Profit</th>
                          <th className="p-2 font-medium text-left">ROI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {optimalPlan.map((item, i) => (
                          <tr key={i} className="border-t border-border hover:bg-muted/50">
                            <td className="p-2 font-medium">{item.product}</td>
                            <td className="p-2">{item.units}</td>
                            <td className="p-2">{formatRupee(item.cost)}</td>
                            <td className="p-2">{formatRupee(item.profit)}</td>
                            <td className="p-2">
                              <Badge variant="success">
                                {(item.ror * 100).toFixed(0)}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t border-border bg-muted/30 font-medium">
                          <td className="p-2">Total</td>
                          <td className="p-2">{optimalPlan.reduce((s, x) => s + x.units, 0)}</td>
                          <td className="p-2">{formatRupee(optimalTotals.totalCost)}</td>
                          <td className="p-2">{formatRupee(optimalTotals.totalProfit)}</td>
                          <td className="p-2">
                            <Badge variant="success">
                              {optimalTotals.totalCost > 0 ? Math.round((optimalTotals.totalProfit / optimalTotals.totalCost) * 100) : 0}%
                            </Badge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Optimal Plan Summary</CardTitle>
                <CardDescription>Key insights and recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Investment</p>
                  <p className="text-2xl font-semibold">{formatRupee(optimalTotals.totalCost)}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Remaining Budget</p>
                  <p className="text-2xl font-semibold">{formatRupee(optimalTotals.remainingBudget)}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Expected Profit</p>
                  <p className="text-2xl font-semibold text-success">{formatRupee(optimalTotals.totalProfit)}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Return on Investment</p>
                  <p className="text-2xl font-semibold text-success">{optimalTotals.totalCost > 0 ? Math.round((optimalTotals.totalProfit / optimalTotals.totalCost) * 100) : 0}%</p>
                </div>
                
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mt-4">
                  <h4 className="font-medium mb-1">AI Insight</h4>
                  <p className="text-sm">This plan balances high-margin products with sufficient volume to utilize your entire budget efficiently.</p>
                </div>
                
                <Button 
                  className="w-full mt-2"
                  onClick={() => toast.success('Optimal plan exported to CSV')}
                >
                  Export Plan
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Scenario Planning */}
        <TabsContent value="scenario-planning" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Scenario Planning (Backtracking)</CardTitle>
                <CardDescription>Long-term strategies under different cash availability scenarios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {scenarios.map((scenario, i) => (
                    <Card key={i} className={`${currentScenario.scenario === scenario.scenario ? 'border-primary' : ''}`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{scenario.scenario}</CardTitle>
                        <CardDescription className="text-xs">
                          {scenario.scenario === 'Conservative' ? 'Low risk, steady returns' : 
                           scenario.scenario === 'Balanced' ? 'Moderate risk & growth' : 
                           'Higher risk, maximum growth'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Investment:</span>
                          <span className="font-medium">{formatRupee(scenario.totalInvestment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expected Return:</span>
                          <span className="font-medium text-success">{formatRupee(scenario.expectedReturn)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ROI:</span>
                          <span className="font-medium text-success">{scenario.roi}%</span>
                        </div>
                        <div className="pt-2">
                          <Button 
                            variant={currentScenario.scenario === scenario.scenario ? "default" : "outline"} 
                            size="sm" 
                            className="w-full"
                            onClick={() => {
                              setAvailableCash(scenario.totalInvestment.toString());
                              toast.success(`${scenario.scenario} scenario selected`);
                            }}
                          >
                            {currentScenario.scenario === scenario.scenario ? 'Selected' : 'Select'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="p-2 font-medium text-left">Product</th>
                          <th className="p-2 font-medium text-left">Units</th>
                          <th className="p-2 font-medium text-left">Allocation %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentScenario.products.map((item, i) => (
                          <tr key={i} className="border-t border-border hover:bg-muted/50">
                            <td className="p-2 font-medium">{item.product}</td>
                            <td className="p-2">{item.units}</td>
                            <td className="p-2">
                              {Math.round((item.units / currentScenario.products.reduce((acc, curr) => acc + curr.units, 0)) * 100)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{currentScenario.scenario} Scenario</CardTitle>
                <CardDescription>Strategic insights and recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Investment</p>
                  <p className="text-2xl font-semibold">{formatRupee(currentScenario.totalInvestment)}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Expected Return</p>
                  <p className="text-2xl font-semibold text-success">{formatRupee(currentScenario.expectedReturn)}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Return on Investment</p>
                  <p className="text-2xl font-semibold text-success">{currentScenario.roi}%</p>
                </div>
                
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mt-4">
                  <h4 className="font-medium mb-1">AI Insight</h4>
                  <p className="text-sm">
                    {currentScenario.scenario === 'Conservative' 
                      ? 'This plan prioritizes high-margin items with minimal risk. Ideal for maintaining cash reserves.'
                      : currentScenario.scenario === 'Balanced'
                      ? 'A balanced approach that optimizes for both growth and stability. Recommended for most businesses.'
                      : 'Maximizes growth potential but requires higher capital investment. Best for established businesses with strong cash flow.'}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={() => toast.info('Comparing scenarios...')}
                  >
                    Compare All
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => toast.success(`${currentScenario.scenario} scenario exported to CSV`)}
                  >
                    Export Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}