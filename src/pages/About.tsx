import { useI18n } from '../i18n'

export default function About() {
  const { t } = useI18n()
  return (
    <>
      <div className="page-header d-print-none">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <div className="page-pretitle">{t('header.overview')}</div>
              <h2 className="page-title">{t('nav.about')}</h2>
            </div>
          </div>
        </div>
      </div>
      <div className="page-body">
        <div className="container-xl">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-xl-9">
              <div className="card card-lg">
                <div className="card-body markdown">
                  <p>{t('about.content')}</p>
                  <div className="mt-3">
                    <iframe title="Dataverse" src="https://dataverse.harvard.edu/resources/js/widgets.js?alias=peskas&dvUrl=https://dataverse.harvard.edu&widgetScope=peskas&widget=iframe&heightPx=500" style={{ width: '100%', height: 520, border: 0 }} />
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

