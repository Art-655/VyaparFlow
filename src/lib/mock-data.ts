// Mock data for VyaparFlow dashboard prototype

// Cash Flow data
export const cashFlowData = {
  summary: {
    totalSales: 428500,
    pendingCOD: 185420,
    predictedCashIn: 78420,
    availableCash: 243080
  },
  forecast: [
    { week: 'Week 1', predictedCashIn: 50000, actualCashIn: 52000 },
    { week: 'Week 2', predictedCashIn: 78000, actualCashIn: 75000 },
    { week: 'Week 3', predictedCashIn: 65000, actualCashIn: 68000 },
    { week: 'Week 4', predictedCashIn: 92000, actualCashIn: null }
  ],
  remittanceDays: [
    { days: '1-3', count: 42 },
    { days: '4-7', count: 78 },
    { days: '8-14', count: 35 },
    { days: '15+', count: 12 }
  ],
  exceptions: [
    { orderId: 'ORD-12345', amount: 5200, delay: 10, courier: 'FastDelivery' },
    { orderId: 'ORD-23456', amount: 8700, delay: 15, courier: 'SpeedPost' },
    { orderId: 'ORD-34567', amount: 4300, delay: 12, courier: 'DeliverNow' },
    { orderId: 'ORD-45678', amount: 7800, delay: 18, courier: 'SpeedPost' }
  ],
  highRtoOrders: [
    { orderId: 'ORD-56789', amount: 3200, reason: 'Address not found', courier: 'FastDelivery' },
    { orderId: 'ORD-67890', amount: 5500, reason: 'Customer refused', courier: 'SpeedPost' },
    { orderId: 'ORD-78901', amount: 2800, reason: 'Customer unavailable', courier: 'DeliverNow' }
  ]
};

// Inventory Analytics data
export const inventoryData = {
  topSelling: [
    { product: "Classic Blue Kurta", units_sold: 185, revenue: 92500, margin: 42 },
    { product: "Handwoven Silk Saree", units_sold: 120, revenue: 240000, margin: 55 },
    { product: "Silver Jhumka Earrings", units_sold: 230, revenue: 115000, margin: 68 },
    { product: "Leather Kolhapuri Chappal", units_sold: 170, revenue: 85000, margin: 45 },
    { product: "Men's Linen Shirt", units_sold: 195, revenue: 97500, margin: 38 }
  ],
  slowMoving: [
    { product: "Designer Party Clutch", units_sold: 15, inventory: 75, days_in_stock: 45 },
    { product: "Formal Blazer", units_sold: 12, inventory: 50, days_in_stock: 60 },
    { product: "Gold Plated Necklace Set", units_sold: 8, inventory: 40, days_in_stock: 50 },
    { product: "Premium Leather Belt", units_sold: 20, inventory: 85, days_in_stock: 42 }
  ],
  reorderSignals: [
    { product: "Classic Blue Kurta", units_to_restock: 85, urgency: "High", margin: 42, riskScore: 78 },
    { product: "Handwoven Silk Saree", units_to_restock: 50, urgency: "Medium", margin: 55, riskScore: 44 },
    { product: "Silver Jhumka Earrings", units_to_restock: 120, urgency: "High", margin: 68, riskScore: 85 },
    { product: "Leather Kolhapuri Chappal", units_to_restock: 70, urgency: "Medium", margin: 45, riskScore: 50 },
    { product: "Men's Linen Shirt", units_to_restock: 95, urgency: "High", margin: 38, riskScore: 71 }
  ],
  salesDensity: [
    { pincode: "400001", city: "Mumbai", orders: 125, revenue: 187500 },
    { pincode: "110001", city: "Delhi", orders: 105, revenue: 157500 },
    { pincode: "560001", city: "Bangalore", orders: 95, revenue: 142500 },
    { pincode: "600001", city: "Chennai", orders: 75, revenue: 112500 },
    { pincode: "700001", city: "Kolkata", orders: 65, revenue: 97500 }
  ]
};

// Performance Analytics data
export const performanceData = {
  summary: {
    overallRto: 12,
    codPct: 65,
    avgRemittanceDays: 9.2,
    deliverySuccessRate: 90
  },
  rtoRates: {
    overall: 12,
    byPaymentMethod: [
      { method: "COD", rate: 18 },
      { method: "Prepaid", rate: 5 }
    ],
    byCourier: [
      { courier: "FastDelivery", rate: 14 },
      { courier: "SpeedPost", rate: 10 },
      { courier: "DeliverNow", rate: 15 }
    ]
  },
  paymentSplit: [
    { method: "COD", percentage: 65 },
    { method: "Prepaid Card", percentage: 20 },
    { method: "UPI", percentage: 12 },
    { method: "Net Banking", percentage: 3 }
  ],
  orderFunnel: {
    placed: 1000,
    shipped: 980,
    delivered: 900,
    rto: 80,
    remitted: 820
  },
  correlations: [
    { factor1: "COD", factor2: "RTO%", strength: 0.75, insight: "Higher COD correlates with higher RTO rates" },
    { factor1: "SpeedPost", factor2: "Remittance Delays", strength: 0.62, insight: "SpeedPost shows longer remittance times" },
    { factor1: "Order Value > ₹5000", factor2: "RTO%", strength: 0.58, insight: "Higher value orders have higher RTO rates" }
  ]
};

// Channel Analytics data
export const channelData = {
  courierComparison: [
    { courier: "FastDelivery", orders: 450, revenue: 225000, rto: 14, remittanceDelay: 8 },
    { courier: "SpeedPost", orders: 320, revenue: 160000, rto: 10, remittanceDelay: 12 },
    { courier: "DeliverNow", orders: 230, revenue: 115000, rto: 15, remittanceDelay: 7 }
  ],
  paymentComparison: [
    { method: "COD", orders: 650, revenue: 325000, rto: 18, remittanceDelay: 10 },
    { method: "Prepaid", orders: 350, revenue: 175000, rto: 5, remittanceDelay: 1 }
  ],
  geographicInsights: [
    { region: "North", orders: 280, revenue: 140000, rto: 11 },
    { region: "South", orders: 320, revenue: 160000, rto: 9 },
    { region: "East", orders: 200, revenue: 100000, rto: 15 },
    { region: "West", orders: 200, revenue: 100000, rto: 13 }
  ],
  rtoHotspots: [
    { pincode: "110045", city: "Delhi", rtoRate: 25 },
    { pincode: "400072", city: "Mumbai", rtoRate: 22 },
    { pincode: "700019", city: "Kolkata", rtoRate: 20 },
    { pincode: "560037", city: "Bangalore", rtoRate: 18 }
  ]
};

// Inventory Advisor data
export const inventoryAdvisorData = {
  quickWins: [
    { product: "Silver Jhumka Earrings", cost: 2800, profit: 1900, units: 50, ror: 0.68 },
    { product: "Handwoven Silk Saree", cost: 12000, profit: 6600, units: 10, ror: 0.55 },
    { product: "Leather Kolhapuri Chappal", cost: 2500, profit: 1125, units: 40, ror: 0.45 }
  ],
  optimalPlan: [
    { product: "Silver Jhumka Earrings", cost: 7000, profit: 4760, units: 125, ror: 0.68 },
    { product: "Handwoven Silk Saree", cost: 24000, profit: 13200, units: 20, ror: 0.55 },
    { product: "Classic Blue Kurta", cost: 10000, profit: 4200, units: 100, ror: 0.42 },
    { product: "Men's Linen Shirt", cost: 9000, profit: 3420, units: 90, ror: 0.38 }
  ],
  scenarioPlanning: [
    {
      scenario: "Conservative",
      totalInvestment: 30000,
      expectedReturn: 15300,
      roi: 51,
      products: [
        { product: "Silver Jhumka Earrings", units: 75 },
        { product: "Handwoven Silk Saree", units: 10 }
      ]
    },
    {
      scenario: "Balanced",
      totalInvestment: 50000,
      expectedReturn: 25500,
      roi: 48,
      products: [
        { product: "Silver Jhumka Earrings", units: 100 },
        { product: "Handwoven Silk Saree", units: 15 },
        { product: "Classic Blue Kurta", units: 50 }
      ]
    },
    {
      scenario: "Aggressive",
      totalInvestment: 80000,
      expectedReturn: 38400,
      roi: 45,
      products: [
        { product: "Silver Jhumka Earrings", units: 150 },
        { product: "Handwoven Silk Saree", units: 20 },
        { product: "Classic Blue Kurta", units: 100 },
        { product: "Men's Linen Shirt", units: 80 }
      ]
    }
  ]
};

// Format INR currency
export const formatRupee = (value: number) => {
  return `₹${value.toLocaleString('en-IN')}`;
};