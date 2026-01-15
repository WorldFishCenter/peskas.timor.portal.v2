import { useI18n } from '../i18n'

type TableOfContentsItem = {
  id: string
  label: string
  children?: { id: string; label: string }[]
}

type WorkflowStep = {
  id: string
  title: string
  description: string
}

export default function About() {
  const { t } = useI18n()

  const tableOfContents: TableOfContentsItem[] = [
    { id: 'about-peskas', label: t('about.contents.about_peskas') },
    {
      id: 'methodological-information',
      label: t('about.contents.methodological'),
      children: [{ id: 'workflow', label: t('about.contents.workflow') }],
    },
    { id: 'download-data', label: t('about.contents.download') },
  ]

  const aboutParagraphs = [
    t('about.sections.aboutPeskas.p1'),
    t('about.sections.aboutPeskas.p2'),
    t('about.sections.aboutPeskas.p3'),
    t('about.sections.aboutPeskas.p4'),
    t('about.sections.aboutPeskas.p5'),
    t('about.sections.aboutPeskas.p6'),
    t('about.sections.aboutPeskas.p7'),
  ]

  const publications = [
    {
      id: 'fao',
      href: 'http://www.fao.org/documents/card/en/c/cb2030en',
      title: t('about.publications.fao.title'),
      description: t('about.publications.fao.description'),
    },
    {
      id: 'plos',
      href: 'https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0234760',
      title: t('about.publications.plos.title'),
      description: t('about.publications.plos.description'),
    },
    {
      id: 'frontiers',
      href: 'https://www.frontiersin.org/articles/10.3389/fmars.2019.00487/full',
      title: t('about.publications.frontiers.title'),
      description: t('about.publications.frontiers.description'),
    },
  ]

  const methodologyParagraphs = [
    t('about.sections.methodological.p1'),
    t('about.sections.methodological.p2'),
    t('about.sections.methodological.p3'),
    t('about.sections.methodological.p4'),
    t('about.sections.methodological.p5'),
  ]

  const methodologyDiagram = t('about.sections.methodological.diagram')

  const workflowSteps: WorkflowStep[] = [
    {
      id: 'build',
      title: t('about.sections.workflow.steps.build.title'),
      description: t('about.sections.workflow.steps.build.description'),
    },
    {
      id: 'acquisition',
      title: t('about.sections.workflow.steps.acquisition.title'),
      description: t('about.sections.workflow.steps.acquisition.description'),
    },
    {
      id: 'preprocessing',
      title: t('about.sections.workflow.steps.preprocessing.title'),
      description: t('about.sections.workflow.steps.preprocessing.description'),
    },
    {
      id: 'merging',
      title: t('about.sections.workflow.steps.merging.title'),
      description: t('about.sections.workflow.steps.merging.description'),
    },
    {
      id: 'validation',
      title: t('about.sections.workflow.steps.validation.title'),
      description: t('about.sections.workflow.steps.validation.description'),
    },
    {
      id: 'modelling',
      title: t('about.sections.workflow.steps.modelling.title'),
      description: t('about.sections.workflow.steps.modelling.description'),
    },
    {
      id: 'export',
      title: t('about.sections.workflow.steps.export.title'),
      description: t('about.sections.workflow.steps.export.description'),
    },
  ]

  const downloadIntro = t('about.download.description')
  const downloadLinkText = t('about.download.link_text')

  return (
    <>
      <div className="page-header d-print-none">
        <div className="container-xl">
          <div className="row g-2 align-items-center">
            <div className="col">
              <div className="page-pretitle">{t('about.pretitle')}</div>
              <h2 className="page-title">{t('about.title')}</h2>
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
                  <h2>{t('about.contents_title')}</h2>
                  <ul>
                    {tableOfContents.map((item) => (
                      <li key={item.id}>
                        <a href={`#${item.id}`}>{item.label}</a>
                        {item.children && (
                          <ul>
                            {item.children.map((child) => (
                              <li key={child.id}>
                                <a href={`#${child.id}`}>{child.label}</a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>

                  <h1 id="about-peskas">{t('about.sections.aboutPeskas.title')}</h1>
                  {aboutParagraphs.map((text, index) => (
                    <p key={index}>{text}</p>
                  ))}

                  <ul>
                    {publications.map((pub) => (
                      <li key={pub.id}>
                        <a href={pub.href} target="_blank" rel="noopener noreferrer">
                          {pub.title}
                        </a>
                        . {pub.description}
                      </li>
                    ))}
                  </ul>

                  <h1 id="methodological-information">
                    {t('about.sections.methodological.title')}
                  </h1>
                  {methodologyParagraphs.map((text, index) => (
                    <p key={index}>{text}</p>
                  ))}
                  <p className="text-center mb-3">{methodologyDiagram}</p>
                  <div className="text-center my-4">
                    <img
                      src="/images/peskas-infrastructure.png"
                      alt={methodologyDiagram}
                      style={{ maxWidth: '600px', width: '100%' }}
                    />
                  </div>

                  <h1 id="workflow">{t('about.sections.workflow.title')}</h1>
                  <p>{t('about.sections.workflow.description')}</p>
                  {workflowSteps.map((step) => (
                    <div key={step.id}>
                      <h4 id={`workflow-step-${step.id}`}>{step.title}</h4>
                      <p>{step.description}</p>
                    </div>
                  ))}

                  <h1 id="download-data">{t('about.contents.download')}</h1>
                  <p>
                    {downloadIntro}{' '}
                    <a href="https://dataverse.harvard.edu/dataverse/peskas" target="_blank" rel="noopener noreferrer">
                      {downloadLinkText}
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
