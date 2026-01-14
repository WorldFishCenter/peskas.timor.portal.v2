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
import { useI18n } from '../i18n';
import type {
  AggregatedData,
  SummaryData,
  ParsData,
  TaxaName,
} from '../types/data';

export default function DataTest() {
  const { t } = useI18n();
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
            <span>{t('data_test.loading', { defaultValue: 'Loading data files...' })}</span>
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
            <h4>{t('data_test.error_title', { defaultValue: 'Error loading data' })}</h4>
            {aggregatedResult.error && (
              <p>
                {t('data_test.error_file', {
                  file: t('data_test.cards.aggregated_title', { defaultValue: 'aggregated.json' }),
                  message: aggregatedResult.error.message,
                  defaultValue: '{file}: {message}',
                })}
              </p>
            )}
            {multipleResult.error && (
              <p>
                {t('data_test.error_multiple', {
                  message: multipleResult.error.message,
                  defaultValue: 'Multiple files: {message}',
                })}
              </p>
            )}
            <button 
              className="btn btn-outline-danger btn-sm mt-2"
              onClick={() => {
                aggregatedResult.refetch();
                multipleResult.refetch();
              }}
            >
              {t('data_test.retry', { defaultValue: 'Retry' })}
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
            <h3 className="card-title">
              {t('data_test.cards.aggregated_title', { defaultValue: 'aggregated.json' })}
            </h3>
          </div>
          <div className="card-body">
            <dl className="row mb-0">
              <dt className="col-6">{t('data_test.aggregated.daily_records', { defaultValue: 'Daily records' })}</dt>
              <dd className="col-6">{aggregated.day.length}</dd>
              <dt className="col-6">{t('data_test.aggregated.weekly_records', { defaultValue: 'Weekly records' })}</dt>
              <dd className="col-6">{aggregated.week.length}</dd>
              <dt className="col-6">{t('data_test.aggregated.monthly_records', { defaultValue: 'Monthly records' })}</dt>
              <dd className="col-6">{aggregated.month.length}</dd>
              <dt className="col-6">{t('data_test.aggregated.yearly_records', { defaultValue: 'Yearly records' })}</dt>
              <dd className="col-6">{aggregated.year.length}</dd>
            </dl>
            {aggregated.month.length > 0 && (
              <div className="mt-3">
                <small className="text-muted">{t('data_test.aggregated.latest_month', { defaultValue: 'Latest month:' })}</small>
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
            <h3 className="card-title">
              {t('data_test.cards.summary_title', { defaultValue: 'summary_data.json' })}
            </h3>
          </div>
          <div className="card-body">
            <dl className="row mb-0">
              <dt className="col-6">{t('data_test.summary.survey_areas', { defaultValue: 'Survey areas' })}</dt>
              <dd className="col-6">{summaryData.n_surveys.length}</dd>
              <dt className="col-6">{t('data_test.summary.fish_groups', { defaultValue: 'Fish groups' })}</dt>
              <dd className="col-6">{summaryData.estimated_tons.length}</dd>
              <dt className="col-6">{t('data_test.summary.habitat_series', { defaultValue: 'Habitat series' })}</dt>
              <dd className="col-6">{summaryData.catch_habitat.length}</dd>
              <dt className="col-6">{t('data_test.summary.portfolio_items', { defaultValue: 'Portfolio items' })}</dt>
              <dd className="col-6">{summaryData.portfolio_data.length}</dd>
            </dl>
            <div className="mt-3">
              <small className="text-muted">{t('data_test.summary.fish_groups_label', { defaultValue: 'Fish groups:' })}</small>
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
            <h3 className="card-title">
              {t('data_test.cards.pars_title', { defaultValue: 'pars.json' })}
            </h3>
          </div>
          <div className="card-body">
            <dl className="row mb-0">
              <dt className="col-6">{t('data_test.pars.variables', { defaultValue: 'Variables' })}</dt>
              <dd className="col-6">{Object.keys(pars.vars).length}</dd>
              <dt className="col-6">{t('data_test.pars.taxa_display', { defaultValue: 'Taxa to display' })}</dt>
              <dd className="col-6">{pars.taxa.to_display.length}</dd>
              <dt className="col-6">{t('data_test.pars.nutrients', { defaultValue: 'Nutrients' })}</dt>
              <dd className="col-6">{pars.nutrients.to_display.length}</dd>
              <dt className="col-6">{t('data_test.pars.nav_items', { defaultValue: 'Nav items' })}</dt>
              <dd className="col-6">{Object.keys(pars.header.nav).length}</dd>
            </dl>
            <div className="mt-3">
              <small className="text-muted">{t('data_test.pars.home_title', { defaultValue: 'Home title:' })}</small>
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
            <h3 className="card-title">
              {t('data_test.cards.taxa_title', {
                count: taxaNames.length,
                defaultValue: 'taxa_names.json ({count} taxa)',
              })}
            </h3>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-sm table-vcenter">
                <thead>
                  <tr>
                    <th>{t('data_test.taxa.code', { defaultValue: 'Code' })}</th>
                    <th>{t('data_test.taxa.name', { defaultValue: 'Name' })}</th>
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
                        {t('data_test.taxa.more', {
                          count: taxaNames.length - 10,
                          defaultValue: '... and {count} more taxa',
                        })}
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
