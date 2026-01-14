import { useData } from '../hooks/useData'

export default function Composition() {
  const { data: pars, loading: parsLoading } = useData('pars')

  const pretitle = pars?.catch?.subtitle?.text ?? ''
  const title = pars?.composition?.title?.text ?? ''
  const percentHeading = pars?.composition?.percent?.heading?.text ?? ''
  const highlightHeading = pars?.composition?.highlight?.heading?.text ?? ''
  const tableHeading = pars?.composition?.table?.heading?.text ?? ''
  const tableFooter = pars?.composition?.table?.footer?.text ?? ''
  const descriptionHeading = pars?.revenue?.description?.heading?.text ?? ''
  const descriptionContent = pars?.revenue?.description?.content?.text ?? ''

  return (
    <>
      {/* Page Header */}
      <div className="page-header d-print-none">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              {parsLoading ? (
                <div className="placeholder-glow">
                  <span className="placeholder col-3"></span>
                </div>
              ) : (
                <>
                  <div className="page-pretitle">{pretitle}</div>
                  <h2 className="page-title">{title}</h2>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Page Body */}
      <div className="page-body">
        <div className="container-xl">
          <div className="row row-cards">
            {/* Taxa Table - Full width */}
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">{tableHeading}</h3>
                </div>
                <div className="card-body">
                  {/* TODO: TaxaTable component */}
                  <div className="text-muted">Taxa table placeholder</div>
                  <div className="small text-muted mt-2">{tableFooter}</div>
                </div>
              </div>
            </div>

            {/* Region Composition Stacked Bar - Full width */}
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">{percentHeading}</h3>
                </div>
                <div className="card-body" style={{ height: '30rem' }}>
                  {/* TODO: StackedBarChart component for region composition */}
                  <div className="d-flex align-items-center justify-content-center h-100 bg-secondary-lt rounded">
                    <span className="text-muted">Region composition chart placeholder</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Taxa Bar Highlight Chart - 7 columns */}
            <div className="col-12 col-lg-7">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">{highlightHeading}</h3>
                </div>
                <div className="card-body">
                  {/* TODO: TaxaBarChart component */}
                  <div className="ratio ratio-4x3 bg-secondary-lt rounded d-flex align-items-center justify-content-center">
                    <span className="text-muted">Taxa bar highlight chart placeholder</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Variable Descriptions - Remaining columns */}
            <div className="col-12 col-lg-5">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">{descriptionHeading}</h3>
                </div>
                <div className="card-body">
                  <div className="markdown text-muted">
                    {descriptionContent}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
