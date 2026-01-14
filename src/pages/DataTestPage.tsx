/**
 * Data Test Page - Demonstrates and tests data loading utilities
 * 
 * This page shows examples of loading data from multiple JSON files:
 * - aggregated.json
 * - summary_data.json
 * - pars.json
 * - taxa_names.json
 * 
 * Access at: /data-test
 */
import DataTest from '../components/DataTest';
import { useI18n } from '../i18n';

export default function DataTestPage() {
  const { t } = useI18n();
  const fileCount = 4;

  return (
    <>
      <div className="page-header d-print-none">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <div className="page-pretitle">{t('data_test.pretitle', { defaultValue: 'Development' })}</div>
              <h2 className="page-title">{t('data_test.title', { defaultValue: 'Data Loading Test' })}</h2>
            </div>
          </div>
        </div>
      </div>
      <div className="page-body">
        <div className="container-xl">
          <div className="alert alert-info mb-4">
            <h4 className="alert-title">{t('data_test.alert_title', { defaultValue: 'Data Loading Examples' })}</h4>
            <p className="mb-0">
              {t('data_test.alert_description_lead', {
                count: fileCount,
                defaultValue: 'This page demonstrates loading data from {count} JSON files using the',
              })}{' '}
              <code className="mx-1">useData</code>{' '}
              {t('data_test.alert_description_middle', { defaultValue: 'and' })}{' '}
              <code className="mx-1">useMultipleData</code>{' '}
              {t('data_test.alert_description_tail', { defaultValue: 'hooks. All data is type-safe with TypeScript interfaces.' })}
            </p>
          </div>
          <DataTest />
        </div>
      </div>
    </>
  );
}
