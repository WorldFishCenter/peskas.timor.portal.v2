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

export default function DataTestPage() {
  return (
    <>
      <div className="page-header d-print-none">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <div className="page-pretitle">Development</div>
              <h2 className="page-title">Data Loading Test</h2>
            </div>
          </div>
        </div>
      </div>
      <div className="page-body">
        <div className="container-xl">
          <div className="alert alert-info mb-4">
            <h4 className="alert-title">Data Loading Examples</h4>
            <p className="mb-0">
              This page demonstrates loading data from 4 JSON files using the 
              <code className="mx-1">useData</code> and 
              <code className="mx-1">useMultipleData</code> hooks.
              All data is type-safe with TypeScript interfaces.
            </p>
          </div>
          <DataTest />
        </div>
      </div>
    </>
  );
}
