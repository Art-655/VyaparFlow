// Lightweight CSV loader and transformer for the dashboard.
// It expects a CSV at `/master_dataset.csv` (place the file in the `public/` folder).
// The CSV should contain at least these columns (case-insensitive):
// order_id, amount, payment_type, remittance_days, remitted, courier, rto, rto_reason, status
// We make conservative, documented assumptions when fields are missing.

export type RawRow = Record<string, string>;

const parseCSV = (text: string): RawRow[] => {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    // naive CSV split (no quoted-commas support). Suitable for small, well-formed CSVs.
    const parts = line.split(',').map(p => p.trim());
    const obj: RawRow = {};
    for (let i = 0; i < headers.length; i++) {
      obj[headers[i]] = parts[i] ?? '';
    }
    return obj;
  });
};

const toNumber = (s?: string) => {
  if (!s) return 0;
  const n = Number(s.replace(/[^0-9.-]+/g, ''));
  return Number.isFinite(n) ? n : 0;
};

const parseDate = (s?: string | null) => {
  if (!s) return null;
  const t = s.trim();
  if (!t) return null;
  // normalize "YYYY-MM-DD HH:mm:ss" to ISO by inserting 'T'
  const iso = t.includes('T') ? t : t.replace(' ', 'T');
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
};

const getMondayKey = (d: Date) => {
  const dd = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = dd.getDay(); // 0 Sun - 6 Sat
  const diff = (day + 6) % 7; // days since Monday
  dd.setDate(dd.getDate() - diff);
  // key as YYYY-MM-DD of Monday
  const y = dd.getFullYear();
  const m = String(dd.getMonth() + 1).padStart(2, '0');
  const da = String(dd.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
};

const getAmount = (r: RawRow) => {
  const amt = toNumber(r['amount']);
  if (amt > 0) return amt;
  // derive from selling_price * quantity if amount not present
  const price = toNumber(r['selling_price']);
  const qty = toNumber(r['quantity']) || 1;
  return price * qty;
};

export function buildCashFlowFromRows(rows: RawRow[], options?: { timeframeDays?: number }) {
  const timeframeDays = options?.timeframeDays;
  // reference date: max of order_date/remittance_date in dataset to make filters stable
  let ref = 0;
  rows.forEach(r => {
    const d1 = parseDate(r['order_date']);
    const d2 = parseDate(r['remittance_date']);
    if (d1 && d1.getTime() > ref) ref = d1.getTime();
    if (d2 && d2.getTime() > ref) ref = d2.getTime();
  });
  const refDate = ref ? new Date(ref) : new Date();

  const withinWindow = (date: Date | null) => {
    if (!date) return false;
    if (!timeframeDays || timeframeDays <= 0) return true;
    const diffMs = refDate.getTime() - date.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= timeframeDays;
  };

  // summary over entire dataset (not filtered) to match earlier behavior
  const totalSales = rows.reduce((sum, r) => sum + getAmount(r), 0);
  const pendingCOD = rows.reduce((sum, r) => {
    const payment = (r['payment_type'] || r['payment_method'] || '').toLowerCase();
    const remitted = (r['remitted'] || '').toLowerCase();
    const remittanceDate = (r['remittance_date'] || '').trim();
    if (payment === 'cod' && remitted !== 'true' && remittanceDate === '') {
      return sum + getAmount(r);
    }
    return sum;
  }, 0);
  const predictedCashIn = rows.reduce((sum, r) => {
    const payment = (r['payment_type'] || r['payment_method'] || '').toLowerCase();
    const days = toNumber(r['remittance_days']);
    if (payment === 'cod' && days > 0 && days <= 7) return sum + getAmount(r);
    return sum;
  }, 0);
  const availableCash = totalSales - pendingCOD;

  // remittance days buckets (filtered by window on remittance_date)
  const buckets: Record<string, number> = { '1-3': 0, '4-7': 0, '8-14': 0, '15+': 0 };
  rows.forEach(r => {
    const remitDate = parseDate(r['remittance_date']);
    if (timeframeDays && timeframeDays > 0 && !withinWindow(remitDate)) return;
    const d = toNumber(r['remittance_days']);
    if (d >= 1 && d <= 3) buckets['1-3'] += 1;
    else if (d >= 4 && d <= 7) buckets['4-7'] += 1;
    else if (d >= 8 && d <= 14) buckets['8-14'] += 1;
    else if (d >= 15) buckets['15+'] += 1;
  });
  const remittanceDays = Object.keys(buckets).map(k => ({ days: k, count: buckets[k] }));

  const exceptions = rows
    .filter(r => toNumber(r['remittance_days']) > 14)
    .slice(0, 10)
    .map(r => ({ orderId: r['order_id'] || r['orderid'] || 'N/A', amount: getAmount(r), delay: toNumber(r['remittance_days']), courier: r['courier'] || r['courier_partner'] || 'Unknown' }));

  const highRtoOrders = rows
    .filter(r => (r['rto'] || r['rto_status'] || '').toLowerCase() === 'true' || (r['status'] || '').toLowerCase() === 'rto')
    .slice(0, 10)
    .map(r => ({ orderId: r['order_id'] || r['orderid'] || 'N/A', amount: getAmount(r), reason: r['rto_reason'] || 'Unknown', courier: r['courier'] || r['courier_partner'] || 'Unknown' }));

  // Forecast with window filters
  const predictedMap = new Map<string, number>();
  const actualMap = new Map<string, number>();
  const actualPresence = new Set<string>();

  rows.forEach(r => {
    const payment = (r['payment_method'] || r['payment_type'] || '').toLowerCase();
    if (payment !== 'cod') return;
    const amount = getAmount(r);

    const orderDate = parseDate(r['order_date']);
    const remittanceDays = toNumber(r['remittance_days']);
    const predictedDays = remittanceDays > 0 ? Math.round(remittanceDays) : 7;
    if (orderDate) {
      const predictedDate = new Date(orderDate);
      predictedDate.setDate(predictedDate.getDate() + predictedDays);
      if (!timeframeDays || withinWindow(predictedDate)) {
        const k = getMondayKey(predictedDate);
        predictedMap.set(k, (predictedMap.get(k) || 0) + amount);
      }
    }

    const remitDate = parseDate(r['remittance_date']);
    if (remitDate && (!timeframeDays || withinWindow(remitDate))) {
      const k2 = getMondayKey(remitDate);
      actualMap.set(k2, (actualMap.get(k2) || 0) + amount);
      actualPresence.add(k2);
    }
  });

  const allKeys = Array.from(new Set<string>([...predictedMap.keys(), ...actualMap.keys()]));
  allKeys.sort((a, b) => a.localeCompare(b));
  // keep reasonable number of buckets depending on window
  const maxBuckets = timeframeDays ? (timeframeDays <= 7 ? 1 : timeframeDays <= 30 ? 4 : 12) : 4;
  const keys = allKeys.slice(-maxBuckets);
  const forecast = keys.map((k, idx) => {
    const predicted = predictedMap.get(k) || 0;
    const actual = actualMap.get(k) || 0;
    const actualValue = actualPresence.has(k) ? actual : null;
    const label = `Week ${idx + 1}`;
    return { week: label, predictedCashIn: predicted, actualCashIn: actualValue as number | null };
  });

  return {
    summary: {
      totalSales,
      pendingCOD,
      predictedCashIn,
      availableCash
    },
    forecast,
    remittanceDays,
    exceptions,
    highRtoOrders
  };
}

export async function loadMasterDataset(url = '/master_dataset.csv') {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const txt = await res.text();
    const rows = parseCSV(txt);
    return buildCashFlowFromRows(rows);
  } catch (err) {
    // bubble up for caller to handle
    throw err;
  }
}

export async function loadMasterDatasetRows(url = '/master_dataset.csv') {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const txt = await res.text();
  return parseCSV(txt);
}

// Inventory snapshot loader and builder
export async function loadInventorySnapshotRows(url = '/inventory_snapshot.csv') {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const txt = await res.text();
  return parseCSV(txt);
}

export function buildInventoryFromRows(orderRows: RawRow[], invRows: RawRow[]) {
  // Index inventory snapshot by product_id for quick lookup
  const invById = new Map<string, RawRow>();
  invRows.forEach(r => invById.set((r['product_id'] || '').trim(), r));

  // Top selling from orders
  type Agg = { product: string; units_sold: number; revenue: number; cost_price?: number };
  const aggById = new Map<string, Agg>();

  orderRows.forEach(r => {
    const id = (r['product_id'] || '').trim();
    const name = r['product_name'] || id || 'Unknown';
    const price = toNumber(r['selling_price']);
    const qty = toNumber(r['quantity']) || 1;
    const revenue = price * qty;
    const prev = aggById.get(id) || { product: name, units_sold: 0, revenue: 0 };
    prev.units_sold += qty;
    prev.revenue += revenue;
    // stash cost ref if available in snapshot
    const inv = invById.get(id);
    if (inv && toNumber(inv['cost_price']) > 0) {
      prev.cost_price = toNumber(inv['cost_price']);
    }
    aggById.set(id, prev);
  });

  const topSelling = Array.from(aggById.entries())
    .map(([id, a]) => {
      const cost = a.cost_price || 0;
      // estimate margin% based on unit cost vs avg selling (revenue/units)
      const avgSell = a.units_sold > 0 ? a.revenue / a.units_sold : 0;
      const marginPct = avgSell > 0 ? Math.round(((avgSell - cost) / avgSell) * 100) : 0;
      return { product: a.product, units_sold: a.units_sold, revenue: Math.round(a.revenue), margin: Math.max(0, marginPct) };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Slow moving: use inventory snapshot with days in stock and units sold
  const now = new Date();
  const slowMoving = invRows.map(ir => {
    const id = (ir['product_id'] || '').trim();
    const name = ir['product_name'] || id || 'Unknown';
    const onHand = toNumber(ir['on_hand_qty']);
    const fr = parseDate(ir['first_received_date']);
    const daysInStock = fr ? Math.max(0, Math.round((now.getTime() - fr.getTime()) / (1000 * 60 * 60 * 24))) : 0;
    const soldAgg = aggById.get(id);
    const unitsSold = soldAgg ? soldAgg.units_sold : 0;
    return { product: name, units_sold: unitsSold, inventory: onHand, days_in_stock: daysInStock };
  })
  .sort((a, b) => b.days_in_stock - a.days_in_stock)
  .slice(0, 10);

  // Reorder signals: use a small unsupervised "AI" scorer (k-means over inventory features)
  // Features considered: daysCover (available / daily_sales_velocity), days_in_stock, units_sold, daily_sales_velocity, margin
  const featureRows: { id: string; name: string; available: number; onHand: number; reserved: number; daysInStock: number; dsv: number; unitsSold: number; margin: number; reorderPoint: number; reorderQty: number }[] = invRows.map(ir => {
    const id = (ir['product_id'] || '').trim();
    const name = ir['product_name'] || id || 'Unknown';
    const onHand = toNumber(ir['on_hand_qty']);
    const reserved = toNumber(ir['reserved_qty']);
    const available = Math.max(0, onHand - reserved);
    const fr = parseDate(ir['first_received_date']);
    const daysInStock = fr ? Math.max(0, Math.round((now.getTime() - fr.getTime()) / (1000 * 60 * 60 * 24))) : 0;
    const dsv = toNumber(ir['daily_sales_velocity']);
    const unitsSold = aggById.get(id)?.units_sold || 0;
    const avgSell = unitsSold > 0 ? (aggById.get(id)!.revenue / unitsSold) : 0;
    const cost = toNumber(ir['cost_price']);
    const margin = avgSell > 0 ? Math.max(0, Math.round(((avgSell - cost) / avgSell) * 100)) : 0;
    const reorderPoint = toNumber(ir['reorder_point']);
    const reorderQty = toNumber(ir['reorder_qty']) || 0;
    return { id, name, available, onHand, reserved, daysInStock, dsv, unitsSold, margin, reorderPoint, reorderQty };
  });

  // Build numeric feature matrix and normalize (min-max)
  const features = featureRows.map(f => {
    const daysCover = f.dsv > 0 ? f.available / f.dsv : 3650; // large number when no velocity
    return [daysCover, f.daysInStock, f.unitsSold, f.dsv, f.margin];
  });

  const transpose = (m: number[][]) => m[0].map((_, i) => m.map(row => row[i]));
  const cols = transpose(features);
  const mins = cols.map(c => Math.min(...c));
  const maxs = cols.map(c => Math.max(...c));
  const normalize = (val: number, i: number) => {
    const min = mins[i];
    const max = maxs[i];
    if (max === min) return 0.5;
    return (val - min) / (max - min);
  };

  const normFeatures = features.map(row => row.map((v, i) => normalize(v, i)));

  // simple k-means (k=3) implementation
  const kmeans = (dataMat: number[][], k = 3, maxIter = 10) => {
    if (dataMat.length === 0) return { labels: [] as number[], centroids: [] as number[][] };
    const dim = dataMat[0].length;
    // init centroids as first k points (or random fallback)
    const centroids: number[][] = [];
    for (let i = 0; i < k; i++) centroids.push(dataMat[i % dataMat.length].slice());
    let labels = new Array(dataMat.length).fill(0);
    for (let iter = 0; iter < maxIter; iter++) {
      // assign
      for (let i = 0; i < dataMat.length; i++) {
        let best = 0;
        let bestDist = Infinity;
        for (let c = 0; c < k; c++) {
          const d = dataMat[i].reduce((s, v, idx) => s + (v - centroids[c][idx]) ** 2, 0);
          if (d < bestDist) { bestDist = d; best = c; }
        }
        labels[i] = best;
      }
      // update
      const sums = Array.from({ length: k }, () => Array(dim).fill(0));
      const counts = Array(k).fill(0);
      for (let i = 0; i < dataMat.length; i++) {
        const c = labels[i];
        counts[c]++;
        for (let j = 0; j < dim; j++) sums[c][j] += dataMat[i][j];
      }
      for (let c = 0; c < k; c++) {
        if (counts[c] === 0) continue;
        for (let j = 0; j < dim; j++) centroids[c][j] = sums[c][j] / counts[c];
      }
    }
    return { labels, centroids };
  };

  const { labels, centroids } = kmeans(normFeatures, 3, 15);

  // Determine which cluster corresponds to highest risk: cluster with lowest centroid daysCover (index 0)
  // centroid feature order: [daysCover, daysInStock, unitsSold, dsv, margin]
  const centroidDaysCover = centroids.map(c => c[0] ?? 0);
  // smaller daysCover -> higher cluster risk
  const rawClusterRisk = centroidDaysCover.map(v => 1 - v);
  const minCR = Math.min(...rawClusterRisk);
  const maxCR = Math.max(...rawClusterRisk);
  const normClusterRisk = rawClusterRisk.map(r => (maxCR === minCR ? 0.5 : (r - minCR) / (maxCR - minCR)));

  // Linear weighted scorer (interpretable): combines normalized features with tuned weights
  // feature order: [daysCover, daysInStock, unitsSold, dsv, margin]
  const weights = [0.45, 0.05, 0.2, 0.25, 0.05]; // emphasize daysCover and velocity
  const linearScores = normFeatures.map(row => {
    // for features where higher value means lower risk (daysCover, daysInStock, margin) we invert appropriately
    // daysCover: higher -> lower risk (use 1 - normalized)
    const daysCoverInv = 1 - row[0];
    const daysInStockInv = 1 - row[1];
    const unitsSoldNorm = row[2];
    const dsvNorm = row[3];
    const marginInv = 1 - row[4];
    const score = weights[0] * daysCoverInv + weights[1] * daysInStockInv + weights[2] * unitsSoldNorm + weights[3] * dsvNorm + weights[4] * marginInv;
    return score; // ~0..1
  });

  // Blend linear score with cluster-derived score to get final risk (alpha controls blend)
  const alpha = 0.7; // favor linear interpretable model
  const reorderSignals = featureRows.map((f, i) => {
    const clusterLabel = labels[i] ?? 0;
    const clusterScore = normClusterRisk[clusterLabel] ?? 0;
    const lin = linearScores[i] ?? 0;
    const finalScore = Math.max(0, Math.min(1, alpha * lin + (1 - alpha) * clusterScore));
    const suggestedBase = f.reorderQty || Math.max(0, f.reorderPoint - f.available);
    const suggested = Math.max(0, Math.round(suggestedBase * (1 + finalScore)));
    const urgency = finalScore >= 0.66 ? 'High' : finalScore >= 0.33 ? 'Medium' : 'Low';
    return {
      product: f.name,
      units_to_restock: suggested,
      urgency,
      margin: f.margin,
      riskScore: Math.round(finalScore * 100)
    };
  }).filter(r => r.units_to_restock > 0).sort((a, b) => b.units_to_restock - a.units_to_restock).slice(0, 10);

  // Sales density by pincode from orders
  const byPin = new Map<string, { orders: number; revenue: number }>();
  orderRows.forEach(r => {
    const pin = (r['destination_pincode'] || '').toString();
    const price = toNumber(r['selling_price']);
    const qty = toNumber(r['quantity']) || 1;
    const rev = price * qty;
    const cur = byPin.get(pin) || { orders: 0, revenue: 0 };
    cur.orders += 1;
    cur.revenue += rev;
    byPin.set(pin, cur);
  });
  const salesDensity = Array.from(byPin.entries())
    .map(([pincode, v]) => ({ pincode, city: '', orders: v.orders, revenue: Math.round(v.revenue) }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 10);

  // Summary metrics for Inventory overview
  const totalProducts = invRows.length;
  let lowStockItems = 0;
  let outOfStock = 0;
  let ageSum = 0;
  let ageCount = 0;
  invRows.forEach(ir => {
    const onHand = toNumber(ir['on_hand_qty']);
    const reserved = toNumber(ir['reserved_qty']);
    const available = Math.max(0, onHand - reserved);
    const reorderPoint = toNumber(ir['reorder_point']);
    if (available <= reorderPoint) lowStockItems++;
    if (available <= 0) outOfStock++;
    const fr = parseDate(ir['first_received_date']) || parseDate(ir['last_restock_date']);
    if (fr) {
      ageSum += Math.max(0, Math.round((now.getTime() - fr.getTime()) / (1000 * 60 * 60 * 24)));
      ageCount++;
    }
  });
  const avgInventoryAge = ageCount > 0 ? Math.round(ageSum / ageCount) : 0;

  return {
    summary: {
      totalProducts,
      lowStockItems,
      outOfStock,
      avgInventoryAge
    },
    topSelling,
    slowMoving,
    reorderSignals,
    salesDensity
  };
}

// Build performance analytics from orders and inventory rows
export function buildPerformanceFromRows(orderRows: RawRow[], invRows: RawRow[]) {
  const total = orderRows.length;
  const shipped = orderRows.filter(r => !!parseDate(r['shipped_date']) || /(shipped|in_transit)/i.test(r['status'] || '')).length;
  const delivered = orderRows.filter(r => !!parseDate(r['delivered_date']) || /delivered/i.test(r['status'] || '')).length;
  const rto = orderRows.filter(r => (/true/i.test(r['rto'] || '') || /rto/i.test(r['status'] || ''))).length;
  const remitted = orderRows.filter(r => !!parseDate(r['remittance_date']) || /true/i.test(r['remitted'] || '')).length;

  // Payment split
  const paymentCounts = new Map<string, { count: number; revenue: number }>();
  orderRows.forEach(r => {
    const method = (r['payment_method'] || r['payment_type'] || 'Unknown').toString();
    const price = toNumber(r['selling_price']);
    const qty = toNumber(r['quantity']) || 1;
    const rev = price * qty;
    const cur = paymentCounts.get(method) || { count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += rev;
    paymentCounts.set(method, cur);
  });
  const paymentSplit = Array.from(paymentCounts.entries()).map(([method, v]) => ({ method, percentage: Math.round((v.count / Math.max(1, total)) * 100) }));

  // RTO rates overall / by payment / by courier
  const rtoByPayment = new Map<string, { rto: number; total: number }>();
  const rtoByCourier = new Map<string, { rto: number; total: number }>();
  orderRows.forEach(r => {
    const method = (r['payment_method'] || r['payment_type'] || 'Unknown').toString();
    const courier = (r['courier'] || r['courier_partner'] || 'Unknown').toString();
    const isRto = (/true/i.test(r['rto'] || '') || /rto/i.test(r['status'] || ''));
    const pm = rtoByPayment.get(method) || { rto: 0, total: 0 };
    pm.total += 1;
    if (isRto) pm.rto += 1;
    rtoByPayment.set(method, pm);
    const pc = rtoByCourier.get(courier) || { rto: 0, total: 0 };
    pc.total += 1;
    if (isRto) pc.rto += 1;
    rtoByCourier.set(courier, pc);
  });
  const rtoRatesByPayment = Array.from(rtoByPayment.entries()).map(([method, v]) => ({ method, rate: Math.round((v.rto / Math.max(1, v.total)) * 100) }));
  const rtoRatesByCourier = Array.from(rtoByCourier.entries()).map(([courier, v]) => ({ courier, rate: Math.round((v.rto / Math.max(1, v.total)) * 100) }));
  const overallRto = Math.round((rto / Math.max(1, total)) * 100);

  // Order funnel
  const orderFunnel = { placed: total, shipped, delivered, rto, remitted };

  // Channel / courier comparison: compute avg remittance days and revenue
  const courierMap = new Map<string, { orders: number; revenue: number; rto: number; remittanceDaysSum: number; remittanceCount: number }>();
  orderRows.forEach(r => {
    const courier = (r['courier'] || r['courier_partner'] || 'Unknown').toString();
    const price = toNumber(r['selling_price']);
    const qty = toNumber(r['quantity']) || 1;
    const rev = price * qty;
    const isRto = (/true/i.test(r['rto'] || '') || /rto/i.test(r['status'] || ''));
    const days = toNumber(r['remittance_days']);
    const cur = courierMap.get(courier) || { orders: 0, revenue: 0, rto: 0, remittanceDaysSum: 0, remittanceCount: 0 };
    cur.orders += 1;
    cur.revenue += rev;
    if (isRto) cur.rto += 1;
    if (days > 0) { cur.remittanceDaysSum += days; cur.remittanceCount += 1; }
    courierMap.set(courier, cur);
  });
  const courierComparison = Array.from(courierMap.entries()).map(([courier, v]) => ({ courier, orders: v.orders, revenue: Math.round(v.revenue), rto: Math.round((v.rto / Math.max(1, v.orders)) * 100), remittanceDelay: v.remittanceCount ? Math.round(v.remittanceDaysSum / v.remittanceCount) : 0 })).sort((a, b) => b.orders - a.orders);

  // Payment comparison (similar)
  const paymentComparison = Array.from(paymentCounts.entries()).map(([method, v]) => {
    const rto = rtoByPayment.get(method)?.rto || 0;
    return { method, orders: v.count, revenue: Math.round(v.revenue), rto: Math.round((rto / Math.max(1, v.count)) * 100), remittanceDelay: 0 };
  }).sort((a, b) => b.orders - a.orders);

  // RTO hotspots by pincode
  const byPin = new Map<string, { orders: number; rto: number; city: string }>();
  orderRows.forEach(r => {
    const pin = (r['destination_pincode'] || '').toString() || 'Unknown';
    const cityVal = (r['destination_city'] || r['destination_town'] || r['city'] || '').toString();
    const cur = byPin.get(pin) || { orders: 0, rto: 0, city: '' };
    cur.orders += 1;
    if (/true/i.test(r['rto'] || '') || /rto/i.test(r['status'] || '')) cur.rto += 1;
    // prefer a non-empty city if available
    if (!cur.city && cityVal) cur.city = cityVal;
    byPin.set(pin, cur);
  });
  const rtoHotspots = Array.from(byPin.entries())
    .map(([pincode, v]) => ({ pincode, city: v.city || '', rtoRate: Math.round((v.rto / Math.max(1, v.orders)) * 100) }))
    .sort((a, b) => b.rtoRate - a.rtoRate)
    .slice(0, 4);

  // Geographic insights (region-level aggregation for India)
  const stateToRegion: Record<string, string> = {
    // North
    'delhi': 'North', 'haryana': 'North', 'punjab': 'North', 'uttar pradesh': 'North', 'uttarakhand': 'North', 'himachal pradesh': 'North', 'jammu and kashmir': 'North', 'ladakh': 'North',
    // South
    'tamil nadu': 'South', 'kerala': 'South', 'karnataka': 'South', 'andhra pradesh': 'South', 'telangana': 'South', 'pondicherry': 'South', 'puducherry': 'South',
    // East
    'west bengal': 'East', 'odisha': 'East', 'assam': 'East', 'bihar': 'East', 'jharkhand': 'East', 'sikkim': 'East', 'arunachal pradesh': 'East', 'manipur': 'East', 'meghalaya': 'East', 'mizoram': 'East', 'nagaland': 'East', 'tripura': 'East',
    // West
    'maharashtra': 'West', 'gujarat': 'West', 'rajasthan': 'West', 'goa': 'West', 'dadra and nagar haveli and daman and diu': 'West', 'daman and diu': 'West',
    // Central
    'madhya pradesh': 'Central', 'chhattisgarh': 'Central',
    // North-East mapping already covered in East
  };

  const regionMap = new Map<string, { orders: number; revenue: number; rto: number }>();
  orderRows.forEach(r => {
    const state = (r['destination_state'] || '').toString().trim().toLowerCase();
    const region = stateToRegion[state] || 'Other';
    const price = toNumber(r['selling_price']);
    const qty = toNumber(r['quantity']) || 1;
    const rev = price * qty;
    const isRto = (/true/i.test(r['rto'] || '') || /rto/i.test(r['status'] || ''));
    const cur = regionMap.get(region) || { orders: 0, revenue: 0, rto: 0 };
    cur.orders += 1;
    cur.revenue += rev;
    if (isRto) cur.rto += 1;
    regionMap.set(region, cur);
  });
  const geographicInsights = Array.from(regionMap.entries()).map(([region, v]) => ({ region, orders: v.orders, revenue: Math.round(v.revenue), rto: Math.round((v.rto / Math.max(1, v.orders)) * 100) }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);

  // Basic correlations: COD vs RTO and courier vs remittance delay
  const codRate = rtoRatesByPayment.find(p => /cod/i.test(p.method))?.rate ?? null;
  const prepaidRate = rtoRatesByPayment.find(p => /prepaid|card|upi|net/i.test(p.method))?.rate ?? null;
  const correlations: { factor1: string; factor2: string; strength: number; insight: string }[] = [];
  if (codRate !== null && prepaidRate !== null && codRate - prepaidRate > 5) {
    correlations.push({ factor1: 'COD', factor2: 'RTO%', strength: Math.round((codRate - prepaidRate) / 100 * 100) / 100, insight: `COD orders have ${codRate}% RTO vs ${prepaidRate}% for prepaid` });
  }
  // courier with highest avg remittance delay
  const courierDelay = courierComparison.slice().sort((a, b) => b.remittanceDelay - a.remittanceDelay)[0];
  if (courierDelay && courierDelay.remittanceDelay > 3) {
    correlations.push({ factor1: courierDelay.courier, factor2: 'Remittance Delay', strength: 0.5, insight: `${courierDelay.courier} shows avg remittance delay of ${courierDelay.remittanceDelay} days` });
  }

  // Summary metrics for top-level dashboard cards
  const codCount = orderRows.filter(r => /(cod)/i.test((r['payment_method'] || r['payment_type'] || '').toString())).length;
  const codPct = Math.round((codCount / Math.max(1, total)) * 100);
  const remittanceVals = orderRows.map(r => toNumber(r['remittance_days'])).filter(d => d >= 0);
  const avgRemittanceDays = remittanceVals.length ? Math.round((remittanceVals.reduce((s, v) => s + v, 0) / remittanceVals.length) * 10) / 10 : 0;
  const deliverySuccessRate = Math.round((delivered / Math.max(1, total)) * 100);

  return {
    summary: {
      overallRto: overallRto,
      codPct,
      avgRemittanceDays,
      deliverySuccessRate
    },
    rtoRates: {
      overall: overallRto,
      byPaymentMethod: rtoRatesByPayment,
      byCourier: rtoRatesByCourier
    },
    paymentSplit,
    orderFunnel,
    correlations,
    channelData: {
      courierComparison,
      paymentComparison,
      geographicInsights,
      rtoHotspots
    }
  };
}

