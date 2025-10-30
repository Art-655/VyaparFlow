// Inventory Advisor algorithms (TypeScript port of vyaparflow_app.py strategies)
// Two strategies:
// 1) Greedy: rank by profit_per_unit / cost_price and buy as many as budget allows
// 2) Dynamic Programming (unbounded knapsack): maximize total profit under budget

export type RawRow = Record<string, string>;

const toNumber = (s?: string) => {
	if (!s) return 0;
	const n = Number(String(s).replace(/[^0-9.-]+/g, ''));
	return Number.isFinite(n) ? n : 0;
};

type Product = {
	product: string;
	costPrice: number;
	sellingPrice: number;
	profitPerUnit: number;
	ror: number; // profit_per_unit / cost_price
};

function buildUniqueProducts(rows: RawRow[]): Product[] {
	const seen = new Map<string, Product>();
	for (const r of rows) {
		const id = (r['product_id'] || '').toString();
		const name = (r['product_name'] || id || 'Unknown').toString();
		const cost = toNumber(r['cost_price']);
		const sell = toNumber(r['selling_price']);
		if (!(cost > 0) || !(sell > cost)) continue; // must be profitable
		const key = `${id}|${name}|${cost}|${sell}`;
		if (seen.has(key)) continue;
		const profit = sell - cost;
		const ror = profit > 0 && cost > 0 ? profit / cost : 0;
		if (ror <= 0) continue;
		seen.set(key, { product: name, costPrice: cost, sellingPrice: sell, profitPerUnit: profit, ror });
	}
	return Array.from(seen.values());
}

export type AdvisorItem = { product: string; units: number; cost: number; profit: number; ror: number };
export type AdvisorResult = { items: AdvisorItem[]; totalCost: number; totalProfit: number; remainingBudget: number };

export function greedyAdvisor(availableCash: number, rows: RawRow[]): AdvisorResult {
	const products = buildUniqueProducts(rows).sort((a, b) => b.ror - a.ror);
	let budget = Math.max(0, Math.floor(availableCash));
	const items: AdvisorItem[] = [];
	for (const p of products) {
		if (p.costPrice <= 0 || budget <= 0) continue;
		if (p.costPrice > budget) continue;
		const units = Math.floor(budget / p.costPrice);
		if (units <= 0) continue;
		const cost = units * p.costPrice;
		const profit = units * p.profitPerUnit;
		items.push({ product: p.product, units, cost, profit, ror: p.ror });
		budget -= cost;
		if (budget <= 0) break;
	}
	const totalCost = Math.round(items.reduce((s, i) => s + i.cost, 0));
	const totalProfit = Math.round(items.reduce((s, i) => s + i.profit, 0));
	return { items, totalCost, totalProfit, remainingBudget: Math.max(0, availableCash - totalCost) };
}

export function dpAdvisor(availableCash: number, rows: RawRow[], stepRupees = 100, maxStates = 10000): AdvisorResult {
	const products = buildUniqueProducts(rows);
	if (availableCash <= 0 || products.length === 0) {
		return { items: [], totalCost: 0, totalProfit: 0, remainingBudget: Math.max(0, availableCash) };
	}

	// Dynamically choose step size so that DP states <= maxStates
	const dynamicStep = Math.max(1, Math.max(stepRupees, Math.ceil(availableCash / maxStates)));
	const B = Math.floor(availableCash / dynamicStep);
	if (B <= 0) {
		return { items: [], totalCost: 0, totalProfit: 0, remainingBudget: Math.max(0, availableCash) };
	}

	// Convert items to step units
	const items = products.map(p => ({
		name: p.product,
		costSteps: Math.max(1, Math.floor(p.costPrice / dynamicStep)),
		unitCost: p.costPrice,
		unitProfit: p.profitPerUnit,
		ror: p.ror
	})).filter(i => i.unitCost > 0 && i.unitProfit > 0);

	if (items.length === 0) {
		return { items: [], totalCost: 0, totalProfit: 0, remainingBudget: Math.max(0, availableCash) };
	}

	const dp = new Array<number>(B + 1).fill(0);
	const pick: number[] = new Array(B + 1).fill(-1);

	for (let b = 1; b <= B; b++) {
		let best = 0;
		let bestIdx = -1;
		for (let idx = 0; idx < items.length; idx++) {
			const it = items[idx];
			if (it.costSteps <= b) {
				const cand = dp[b - it.costSteps] + it.unitProfit;
				if (cand > best) { best = cand; bestIdx = idx; }
			}
		}
		dp[b] = best;
		pick[b] = bestIdx;
	}

	// reconstruct
	let b = B;
	const counts = new Map<number, number>();
	while (b > 0 && pick[b] !== -1) {
		const idx = pick[b];
		counts.set(idx, (counts.get(idx) || 0) + 1);
		b -= items[idx].costSteps;
	}

	const resultItems: AdvisorItem[] = [];
	let totalCost = 0;
	let totalProfit = 0;
	for (const [idx, units] of counts.entries()) {
		const it = items[idx];
		const cost = it.unitCost * units;
		const profit = it.unitProfit * units;
		totalCost += cost;
		totalProfit += profit;
		resultItems.push({ product: it.name, units, cost, profit, ror: it.ror });
	}
	resultItems.sort((a, b2) => b2.profit - a.profit);

	return {
		items: resultItems,
		totalCost: Math.round(totalCost),
		totalProfit: Math.round(totalProfit),
		remainingBudget: Math.max(0, Math.round(availableCash - totalCost))
	};
}

	// Scenario Planning
	export type Scenario = {
		scenario: 'Conservative' | 'Balanced' | 'Aggressive';
		totalInvestment: number;
		expectedReturn: number; // interpreted as total profit for the plan
		roi: number; // % of profit over investment
		products: { product: string; units: number }[];
	};

	export function generateScenarios(availableCash: number, rows: RawRow[]): Scenario[] {
		const products = buildUniqueProducts(rows);
		if (availableCash <= 0 || products.length === 0) {
			return [
				{ scenario: 'Conservative', totalInvestment: 0, expectedReturn: 0, roi: 0, products: [] },
				{ scenario: 'Balanced', totalInvestment: 0, expectedReturn: 0, roi: 0, products: [] },
				{ scenario: 'Aggressive', totalInvestment: 0, expectedReturn: 0, roi: 0, products: [] },
			];
		}

		// Helper to pack with greedy ROI under budget and per-product share cap
		function greedyPack(budget: number, maxShare: number): AdvisorResult {
			const sorted = products.slice().sort((a, b) => b.ror - a.ror);
			let remaining = budget;
			const items: AdvisorItem[] = [];
			for (const p of sorted) {
				if (remaining <= 0) break;
				const cap = Math.max(0, Math.floor((maxShare * budget) / p.costPrice)); // max units by share
				const afford = Math.floor(remaining / p.costPrice);
				const units = Math.max(0, Math.min(cap || afford, afford));
				if (units <= 0) continue;
				const cost = units * p.costPrice;
				const profit = units * p.profitPerUnit;
				items.push({ product: p.product, units, cost, profit, ror: p.ror });
				remaining -= cost;
			}
			const totalCost = Math.round(items.reduce((s, i) => s + i.cost, 0));
			const totalProfit = Math.round(items.reduce((s, i) => s + i.profit, 0));
			return { items, totalCost, totalProfit, remainingBudget: Math.max(0, budget - totalCost) };
		}

		// Aggressive: full budget via DP
		const aggressive = dpAdvisor(availableCash, rows);

		// Balanced: start with DP and diversify if a single product dominates (>50%)
		const halfShare = 0.5 * availableCash;
		const balancedItems = aggressive.items.map(i => ({ ...i }));
		let balancedCost = aggressive.totalCost;
		let balancedProfit = aggressive.totalProfit;
		// Trim dominating product if needed
		for (const it of balancedItems) {
			if (it.cost > halfShare && it.units > 0) {
				const unitCost = it.cost / it.units;
				const unitProfit = it.profit / it.units;
				const maxUnits = Math.max(0, Math.floor(halfShare / unitCost));
				const removeUnits = Math.max(0, it.units - maxUnits);
				if (removeUnits > 0) {
					const reduceCost = removeUnits * unitCost;
					const reduceProfit = removeUnits * unitProfit;
					it.units = maxUnits;
					it.cost -= reduceCost;
					it.profit -= reduceProfit;
					balancedCost -= reduceCost;
					balancedProfit -= reduceProfit;
				}
			}
		}
		const remainingForBalanced = Math.max(0, availableCash - balancedCost);
		if (remainingForBalanced > 0) {
			// Fill remaining with greedy under 50% per-product share
			const topUp = greedyPack(remainingForBalanced, 0.5);
			// Merge items by product
			const byName = new Map<string, AdvisorItem>();
			for (const it of balancedItems) {
				if (it.units <= 0) continue;
				const cur = byName.get(it.product) || { ...it };
				if (!byName.has(it.product)) byName.set(it.product, cur); // ensure entry
				else {
					cur.units += it.units; cur.cost += it.cost; cur.profit += it.profit; cur.ror = cur.ror; byName.set(it.product, cur);
				}
			}
			for (const it of topUp.items) {
				const cur = byName.get(it.product) || { ...it };
				if (!byName.has(it.product)) byName.set(it.product, cur);
				else {
					cur.units += it.units; cur.cost += it.cost; cur.profit += it.profit; byName.set(it.product, cur);
				}
			}
			balancedCost = 0; balancedProfit = 0;
			const merged = Array.from(byName.values());
			for (const m of merged) { balancedCost += m.cost; balancedProfit += m.profit; }
			// Replace balancedItems with merged for consistent reporting
			balancedItems.length = 0; balancedItems.push(...merged);
		}

		const conservativeBudget = Math.floor(availableCash * 0.7); // keep ~30% reserve
		const conservative = greedyPack(conservativeBudget, 0.25); // limit 25% per product

		const toScenario = (name: Scenario['scenario'], res: AdvisorResult): Scenario => {
			const invest = res.totalCost;
			const profit = res.totalProfit;
			const roi = invest > 0 ? Math.round((profit / invest) * 100) : 0;
			// Take top few for display, convert to minimal shape
			const productsList = res.items
				.slice()
				.sort((a, b) => b.profit - a.profit)
				.slice(0, 10)
				.map(i => ({ product: i.product, units: i.units }));
			return { scenario: name, totalInvestment: invest, expectedReturn: profit, roi, products: productsList };
		};

		return [
			toScenario('Conservative', conservative),
			toScenario('Balanced', { items: balancedItems, totalCost: Math.round(balancedCost), totalProfit: Math.round(balancedProfit), remainingBudget: Math.max(0, availableCash - Math.round(balancedCost)) }),
			toScenario('Aggressive', aggressive),
		];
	}

