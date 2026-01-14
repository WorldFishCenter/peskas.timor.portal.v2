import { useMemo } from 'react';
import { useData } from '../hooks';
import { tabPalette } from '../constants/colors';
import { useI18n } from '../i18n';

interface MunicipalSummary {
  region: string;
  landing_revenue: number;
  landing_weight: number;
  n_landings_per_boat: number;
  revenue: number;
  catch: number;
  price_kg: number;
}

function interpolateColor(colors: string[], t: number): string {
  const n = colors.length - 1;
  const i = Math.min(Math.floor(t * n), n - 1);
  const f = t * n - i;
  
  const c1 = colors[i];
  const c2 = colors[i + 1];
  
  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);
  
  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);
  
  const r = Math.round(r1 + f * (r2 - r1));
  const g = Math.round(g1 + f * (g2 - g1));
  const b = Math.round(b1 + f * (b2 - b1));
  
  return `rgb(${r}, ${g}, ${b})`;
}

function normalize(value: number, values: number[]): number {
  const valid = values.filter(v => !isNaN(v));
  if (valid.length === 0) return 0.5;
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  if (min === max) return 0.5;
  const normalized = (value - min) / (max - min);
  return Math.max(0, Math.min(1, isNaN(normalized) ? 0.5 : normalized));
}

function biasedNormalize(value: number, values: number[], bias: number = 2): number {
  const n = normalize(value, values);
  return Math.pow(n, 1 / bias);
}

interface SummaryTableProps {
  municipality?: string;
}

export function SummaryTable({ municipality = 'all' }: SummaryTableProps) {
  const { t } = useI18n();
  const { data: municipalData, loading, error } = useData('municipal_aggregated');
  const { data: pars } = useData('pars');

  const summaryData = useMemo(() => {
    if (!municipalData) return [];

    // Filter by municipality if specified
    const filteredData = municipality === 'all' 
      ? municipalData 
      : municipalData.filter((record) => record.region.toLowerCase() === municipality.toLowerCase());

    type GroupedData = Record<string, {
      landing_revenues: number[];
      landing_weights: number[];
      n_landings_per_boats: number[];
      revenues: number[];
      catches: number[];
      price_kgs: number[];
    }>;

    const grouped: GroupedData = {};
    for (const record of filteredData) {
      if (!grouped[record.region]) {
        grouped[record.region] = {
          landing_revenues: [],
          landing_weights: [],
          n_landings_per_boats: [],
          revenues: [],
          catches: [],
          price_kgs: [],
        };
      }
      grouped[record.region].landing_revenues.push(record.landing_revenue);
      grouped[record.region].landing_weights.push(record.landing_weight);
      grouped[record.region].n_landings_per_boats.push(record.n_landings_per_boat);
      grouped[record.region].revenues.push(record.revenue);
      grouped[record.region].catches.push(record.catch);
      grouped[record.region].price_kgs.push(record.price_kg);
    }

    const median = (arr: number[]) => {
      const sorted = [...arr].filter(v => !isNaN(v)).sort((a, b) => a - b);
      if (sorted.length === 0) return 0;
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    };

    const sum = (arr: number[]) => arr.filter(v => !isNaN(v)).reduce((a, b) => a + b, 0);
    const mean = (arr: number[]) => {
      const valid = arr.filter(v => !isNaN(v));
      return valid.length > 0 ? sum(valid) / valid.length : 0;
    };

    const result: MunicipalSummary[] = Object.entries(grouped).map(([region, values]) => ({
      region,
      landing_revenue: Math.round(median(values.landing_revenues) * 100) / 100,
      landing_weight: Math.round(median(values.landing_weights) * 100) / 100,
      n_landings_per_boat: Math.round(median(values.n_landings_per_boats) * 100) / 100,
      revenue: Math.round(sum(values.revenues) / 1000000 * 100) / 100,
      catch: Math.round(sum(values.catches) / 1000 * 100) / 100,
      price_kg: Math.round(mean(values.price_kgs) * 100) / 100,
    }));

    return result.sort((a, b) => a.region.localeCompare(b.region));
  }, [municipalData, municipality]);

  const columnValues = useMemo(() => ({
    landing_revenue: summaryData.map(r => r.landing_revenue),
    landing_weight: summaryData.map(r => r.landing_weight),
    n_landings_per_boat: summaryData.map(r => r.n_landings_per_boat),
    revenue: summaryData.map(r => r.revenue),
    catch: summaryData.map(r => r.catch),
    price_kg: summaryData.map(r => r.price_kg),
  }), [summaryData]);

  const getCellStyle = (value: number, values: number[]) => {
    const t = biasedNormalize(value, values);
    return { backgroundColor: interpolateColor(tabPalette, t) };
  };

  if (loading) {
    return (
      <div className="text-muted text-center py-4">
        {t('table.loading')}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-danger text-center py-4">
        {t('table.error')}
      </div>
    );
  }

  const tableTitle = pars?.home?.table?.title ?? 'Fishery General Statistics';
  const tableCaption = pars?.home?.table?.caption ?? '';

  return (
    <div>
      <h3 className="mb-2" style={{ color: '#666a70' }}>{tableTitle}</h3>
      {tableCaption && (
        <p className="text-muted mb-3" style={{ fontSize: '0.875rem' }}>{tableCaption}</p>
      )}
      <div className="table-responsive">
        <table className="table table-vcenter table-hover" style={{ fontSize: '0.875rem' }}>
        <thead>
          <tr>
            <th style={{ minWidth: 140 }}>{t('table.municipality')}</th>
            <th className="text-center" style={{ minWidth: 100 }}>{t('table.revenue_per_trip')}</th>
            <th className="text-center" style={{ minWidth: 100 }}>{t('table.landings_per_boat')}</th>
            <th className="text-center" style={{ minWidth: 100 }}>{t('table.catch_per_trip')}</th>
            <th className="text-center" style={{ minWidth: 100 }}>{t('table.total_revenue')}</th>
            <th className="text-center" style={{ minWidth: 100 }}>{t('table.total_catch')}</th>
            <th className="text-center" style={{ minWidth: 100 }}>{t('table.price_per_kg')}</th>
          </tr>
        </thead>
        <tbody>
          {summaryData.map((row) => (
            <tr key={row.region}>
              <td className="text-center">{row.region}</td>
              <td className="text-center" style={getCellStyle(row.landing_revenue, columnValues.landing_revenue)}>
                ${row.landing_revenue.toFixed(2)}
              </td>
              <td className="text-center" style={getCellStyle(row.n_landings_per_boat, columnValues.n_landings_per_boat)}>
                {row.n_landings_per_boat.toFixed(2)}
              </td>
              <td className="text-center" style={getCellStyle(row.landing_weight, columnValues.landing_weight)}>
                {row.landing_weight.toFixed(2)} kg
              </td>
              <td className="text-center" style={getCellStyle(row.revenue, columnValues.revenue)}>
                ${row.revenue.toFixed(2)} M
              </td>
              <td className="text-center" style={getCellStyle(row.catch, columnValues.catch)}>
                {row.catch.toFixed(2)} t
              </td>
              <td className="text-center" style={getCellStyle(row.price_kg, columnValues.price_kg)}>
                ${row.price_kg.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
