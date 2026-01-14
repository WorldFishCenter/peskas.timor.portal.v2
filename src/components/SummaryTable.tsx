import { useMemo } from 'react';
import { useData } from '../hooks';

interface MunicipalSummary {
  region: string;
  landing_revenue: number;
  landing_weight: number;
  n_landings_per_boat: number;
  revenue: number;
  catch: number;
  price_kg: number;
}

export function SummaryTable() {
  const { data: municipalData, loading, error } = useData('municipal_aggregated');

  const summaryData = useMemo(() => {
    if (!municipalData) return [];

    type GroupedData = Record<string, {
      landing_revenues: number[];
      landing_weights: number[];
      n_landings_per_boats: number[];
      revenues: number[];
      catches: number[];
      price_kgs: number[];
    }>;

    const grouped: GroupedData = {};
    for (const record of municipalData) {
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
      revenue: Math.round(sum(values.revenues) / 1000000 * 100) / 100, // Convert to millions
      catch: Math.round(sum(values.catches) / 1000 * 100) / 100, // Convert to tons
      price_kg: Math.round(mean(values.price_kgs) * 100) / 100,
    }));

    return result.sort((a, b) => a.region.localeCompare(b.region));
  }, [municipalData]);

  if (loading) {
    return (
      <div className="text-muted text-center py-4">
        Loading table data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-danger text-center py-4">
        Error loading table data
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-vcenter">
        <thead>
          <tr>
            <th>Municipality</th>
            <th className="text-center">Revenue per trip</th>
            <th className="text-center">Landings per boat</th>
            <th className="text-center">Catch per trip</th>
            <th className="text-center">Total revenue</th>
            <th className="text-center">Total catch</th>
            <th className="text-center">Price per kg</th>
          </tr>
        </thead>
        <tbody>
          {summaryData.map((row) => (
            <tr key={row.region}>
              <td>{row.region}</td>
              <td className="text-center">${row.landing_revenue}</td>
              <td className="text-center">{row.n_landings_per_boat}</td>
              <td className="text-center">{row.landing_weight} kg</td>
              <td className="text-center">${row.revenue} M</td>
              <td className="text-center">{row.catch} t</td>
              <td className="text-center">${row.price_kg}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
