/**
 * DataTest Component - Demonstrates data loading from multiple JSON files
 * 
 * This component tests and showcases the data loading utilities:
 * - useData hook for single file loading
 * - useMultipleData hook for loading multiple files
 * - Error handling and loading states
 * - Type-safe data access
 */
import { useData, useMultipleData } from '../hooks';
import type {
  AggregatedData,
  SummaryData,
  ParsData,
  TaxaName,
} from '../types/data';

export default function DataTest() {
  // Example 1: Load single file with useData
  const aggregatedResult = useData('aggregated');

  // Example 2: Load multiple files with useMultipleData
  const multipleResult = useMultipleData(['summary_data', 'pars', 'taxa_names']);

  // Combined loading state
  const isLoading = aggregatedResult.loading || multipleResult.loading;
  const hasError = aggregatedResult.error || multipleResult.error;

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="d-flex align-items-center">
            <div className="spinner-border spinner-border-sm me-2" role="status" />
            <span>Loading data files...</span>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="alert alert-danger mb-0">
            <h4>Error loading data</h4>
            {aggregatedResult.error && <p>aggregated.json: {aggregatedResult.error.message}</p>}
            {multipleResult.error && <p>Multiple files: {multipleResult.error.message}</p>}
            <button 
              className="btn btn-outline-danger btn-sm mt-2"
              onClick={() => {
                aggregatedResult.refetch();
                multipleResult.refetch();
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Type-safe data access
  const aggregated: AggregatedData = aggregatedResult.data!;
  const summaryData: SummaryData = multipleResult.data!.summary_data;
  const pars: ParsData = multipleResult.data!.pars;
  const taxaNames: TaxaName[] = multipleResult.data!.taxa_names;

  return (
    <div className="row row-cards">
      {/* Card 1: Aggregated Data Summary */}
      <div className="col-md-6 col-lg-4">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">aggregated.json</h3>
          </div>
          <div className="card-body">
            <dl className="row mb-0">
              <dt className="col-6">Daily records</dt>
              <dd className="col-6">{aggregated.day.length}</dd>
              <dt className="col-6">Weekly records</dt>
              <dd className="col-6">{aggregated.week.length}</dd>
              <dt className="col-6">Monthly records</dt>
              <dd className="col-6">{aggregated.month.length}</dd>
              <dt className="col-6">Yearly records</dt>
              <dd className="col-6">{aggregated.year.length}</dd>
            </dl>
            {aggregated.month.length > 0 && (
              <div className="mt-3">
                <small className="text-muted">Latest month:</small>
                <br />
                <code>{aggregated.month[aggregated.month.length - 1].date_bin_start}</code>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card 2: Summary Data */}
      <div className="col-md-6 col-lg-4">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">summary_data.json</h3>
          </div>
          <div className="card-body">
            <dl className="row mb-0">
              <dt className="col-6">Survey areas</dt>
              <dd className="col-6">{summaryData.n_surveys.length}</dd>
              <dt className="col-6">Fish groups</dt>
              <dd className="col-6">{summaryData.estimated_tons.length}</dd>
              <dt className="col-6">Habitat series</dt>
              <dd className="col-6">{summaryData.catch_habitat.length}</dd>
              <dt className="col-6">Portfolio items</dt>
              <dd className="col-6">{summaryData.portfolio_data.length}</dd>
            </dl>
            <div className="mt-3">
              <small className="text-muted">Fish groups:</small>
              <br />
              <code className="text-wrap">
                {summaryData.estimated_tons.map(t => t.fish_group).join(', ')}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Pars/Config Data */}
      <div className="col-md-6 col-lg-4">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">pars.json</h3>
          </div>
          <div className="card-body">
            <dl className="row mb-0">
              <dt className="col-6">Variables</dt>
              <dd className="col-6">{Object.keys(pars.vars).length}</dd>
              <dt className="col-6">Taxa to display</dt>
              <dd className="col-6">{pars.taxa.to_display.length}</dd>
              <dt className="col-6">Nutrients</dt>
              <dd className="col-6">{pars.nutrients.to_display.length}</dd>
              <dt className="col-6">Nav items</dt>
              <dd className="col-6">{Object.keys(pars.header.nav).length}</dd>
            </dl>
            <div className="mt-3">
              <small className="text-muted">Home title:</small>
              <br />
              <code>{pars.home.title.text}</code>
            </div>
          </div>
        </div>
      </div>

      {/* Card 4: Taxa Names */}
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">taxa_names.json ({taxaNames.length} taxa)</h3>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-sm table-vcenter">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                  </tr>
                </thead>
                <tbody>
                  {taxaNames.slice(0, 10).map((taxa) => (
                    <tr key={taxa.grouped_taxa}>
                      <td><code>{taxa.grouped_taxa}</code></td>
                      <td>{taxa.grouped_taxa_names}</td>
                    </tr>
                  ))}
                  {taxaNames.length > 10 && (
                    <tr>
                      <td colSpan={2} className="text-muted">
                        ... and {taxaNames.length - 10} more taxa
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
