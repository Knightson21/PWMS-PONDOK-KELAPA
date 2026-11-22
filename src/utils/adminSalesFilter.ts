import type { WasteSaleRecord, WasteType } from '../types';

const PREFERRED_CATEGORY_ORDER = [
  'Organik',
  'Plastik',
  'Plastik Campur',
  'Kertas & Karton',
  'Kertas',
  'Logam',
  'Kaca & Botol',
  'Limbah Minyak'
];

/**
 * Builds the waste category dropdown list using exact database category names
 * from wasteTypes and recorded sales, always ensuring "Organik" is available.
 */
export function buildWasteCategoryOptions(
  wasteTypes: WasteType[],
  sales: WasteSaleRecord[]
): string[] {
  const canonicalByLower = new Map<string, string>();
  canonicalByLower.set('organik', 'Organik');

  wasteTypes.forEach((wt) => {
    const clean = (wt.category || '').trim();
    if (clean && !canonicalByLower.has(clean.toLowerCase())) {
      canonicalByLower.set(clean.toLowerCase(), clean);
    }
  });

  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      const clean = (item.category || '').trim();
      if (clean && !canonicalByLower.has(clean.toLowerCase())) {
        canonicalByLower.set(clean.toLowerCase(), clean);
      }
    });
  });

  const allCategories = Array.from(canonicalByLower.values());

  return allCategories.sort((a, b) => {
    const idxA = PREFERRED_CATEGORY_ORDER.findIndex((p) => p.toLowerCase() === a.toLowerCase());
    const idxB = PREFERRED_CATEGORY_ORDER.findIndex((p) => p.toLowerCase() === b.toLowerCase());
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b, 'id');
  });
}

export interface SalesFilterCriteria {
  category?: string;
  searchQuery?: string;
  rt?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Filters sales by date range, RT, specific waste category (item-level), and search query.
 * When a specific category is selected, multi-item transactions are projected to only the
 * matching items with recalculated totalWeight and totalAmount so KPIs, charts, tables,
 * and CSV exports remain 100% accurate. Original records are returned in originalById
 * so Edit/Delete actions always operate on the intact record.
 */
export function filterAndProjectSales(
  sales: WasteSaleRecord[],
  criteria: SalesFilterCriteria
): {
  projectedSales: WasteSaleRecord[];
  originalById: Map<string, WasteSaleRecord>;
} {
  const originalById = new Map<string, WasteSaleRecord>();
  const targetCat =
    criteria.category && criteria.category !== 'ALL'
      ? criteria.category.trim().toLowerCase()
      : '';
  const targetRt =
    criteria.rt && criteria.rt !== 'ALL' ? criteria.rt.trim().toLowerCase() : '';
  const query = (criteria.searchQuery || '').trim().toLowerCase();
  const startMs = criteria.startDate ? new Date(`${criteria.startDate}T00:00:00`).getTime() : null;
  const endMs = criteria.endDate ? new Date(`${criteria.endDate}T23:59:59.999`).getTime() : null;

  const projectedSales: WasteSaleRecord[] = [];

  for (const sale of sales) {
    originalById.set(sale.id, sale);

    if (targetRt && (sale.sellerRt || '').trim().toLowerCase() !== targetRt) {
      continue;
    }

    if (startMs !== null || endMs !== null) {
      const saleMs = new Date(sale.date).getTime();
      if (startMs !== null && saleMs < startMs) continue;
      if (endMs !== null && saleMs > endMs) continue;
    }

    // Item-level category filtering
    const matchingItems = targetCat
      ? sale.items.filter(
          (it) => (it.category || 'Anorganik').trim().toLowerCase() === targetCat
        )
      : sale.items;

    if (matchingItems.length === 0) {
      continue;
    }

    if (query) {
      const inHeader =
        sale.id.toLowerCase().includes(query) ||
        sale.sellerName.toLowerCase().includes(query) ||
        sale.sellerRt.toLowerCase().includes(query) ||
        (sale.notes || '').toLowerCase().includes(query);

      const inItems = matchingItems.some(
        (it) =>
          it.wasteTypeName.toLowerCase().includes(query) ||
          (it.category || '').toLowerCase().includes(query)
      );

      if (!inHeader && !inItems) {
        continue;
      }
    }

    if (targetCat && matchingItems.length !== sale.items.length) {
      const recalcWeight = Number(
        matchingItems.reduce((sum, it) => sum + (it.weight || 0), 0).toFixed(2)
      );
      const recalcAmount = Math.round(
        matchingItems.reduce((sum, it) => sum + (it.subtotal || 0), 0)
      );
      projectedSales.push({
        ...sale,
        items: matchingItems,
        totalWeight: recalcWeight,
        totalAmount: recalcAmount
      });
    } else {
      projectedSales.push(sale);
    }
  }

  return { projectedSales, originalById };
}
