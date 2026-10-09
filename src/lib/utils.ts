import { Product, WarrantyType, DeliveryType, ReturnPolicyType } from '@/types/database';

export function formatIqd(amount: number, locale: string = 'en'): string {
  if (locale === 'ku') {
    return `${amount.toLocaleString('en-US')} دینار`;
  } else if (locale === 'ar') {
    return `${amount.toLocaleString('en-US')} د.ع`;
  }
  return `${amount.toLocaleString('en-US')} IQD`;
}

export function formatUsd(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`;
}

export function calculateTransparencyScore(product: {
  warranty_type: WarrantyType;
  warranty_period?: string;
  delivery_type: DeliveryType;
  delivery_cost_iqd?: number;
  return_window_days: number;
  return_policy_type: ReturnPolicyType;
}): number {
  let score = 0;

  // Warranty signal (max 35)
  if (product.warranty_type !== 'none') {
    score += 25;
    if (product.warranty_period && product.warranty_period.trim().length > 0) {
      score += 10;
    }
  }

  // Delivery signal (max 35)
  if (product.delivery_type === 'same_day' || product.delivery_type === 'express_kurdistan') {
    score += 25;
    if (typeof product.delivery_cost_iqd === 'number' && product.delivery_cost_iqd >= 0) {
      score += 10;
    }
  } else if (product.delivery_type === 'pickup_only') {
    score += 15;
  }

  // Return policy signal (max 30)
  if (product.return_window_days > 0 && product.return_policy_type !== 'non_returnable') {
    score += 20;
    if (product.return_window_days >= 3) {
      score += 10;
    }
  } else if (product.return_policy_type !== 'non_returnable') {
    score += 10;
  }

  return Math.min(100, Math.max(0, score));
}

export function getMissingSignalsList(product: Product): string[] {
  const missing: string[] = [];
  if (product.warranty_type === 'none' || !product.warranty_period) {
    missing.push('Missing Warranty Details');
  }
  if (!product.delivery_type || (product.delivery_type !== 'pickup_only' && !product.delivery_cost_iqd)) {
    missing.push('Missing Delivery Info');
  }
  if (!product.return_window_days || product.return_policy_type === 'non_returnable') {
    missing.push('Missing Return Window');
  }
  return missing;
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]): void {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      headers
        .map(header => {
          const val = row[header];
          const escaped = String(val ?? '').replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
