import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'tet'

type Dict = Record<string, unknown>
type I18nParams = { defaultValue?: string } & Record<string, string | number>

function get(obj: Dict, path: string) {
  return path.split('.').reduce<unknown>((acc, key) => (acc as Dict)?.[key], obj)
}

function interpolate(template: string, params?: Record<string, string | number>) {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? ''))
}

export type I18nContextValue = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string, params?: I18nParams) => string
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

// Dictionaries
const en = {
  brand: {
    title: 'PESKAS | Timor-Leste',
    subtitle: 'Management Dashboard',
  },
  nav: {
    home: 'Home',
    catch: 'Catch',
    revenue: 'Revenue',
    market: 'Market',
    composition: 'Composition',
    nutrients: 'Nutrients',
    tracks: 'Fishery Indicators',
    about: 'About',
  },
  header: {
    overview: 'Small scale fisheries',
  },
  footer: {
    licence: 'License',
    source: 'Source code',
    project: 'The project',
    last_updated: 'Last update',
    copyright: 'Copyright © {year} Peskas. All rights reserved.',
  },
  user_menu: {
    name: 'Jane Pearson',
    role: 'UI Designer',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
  },
  actions: {
    toggle_navigation: 'Toggle navigation',
    toggle_theme: 'Toggle theme',
    toggle_language: 'Toggle language',
    open_user_menu: 'Open user menu',
  },
  common: {
    loading: 'Loading...',
    loading_short: '...',
    error_loading: 'Error loading data',
    no_data: 'No data available',
    all_years: 'All years',
    all_data: 'All data',
    last_12_months: 'Last 12 months',
    last_month: 'Last month',
    avg: 'Avg',
    municipalities: {
      all: 'All municipalities',
      ainaro: 'Ainaro',
      atauro: 'Atauro',
      baucau: 'Baucau',
      bobonaro: 'Bobonaro',
      covalima: 'Covalima',
      dili: 'Dili',
      lautem: 'Lautem',
      liquica: 'Liquica',
      manatuto: 'Manatuto',
      manufahi: 'Manufahi',
      oecusse: 'Oecusse',
      viqueque: 'Viqueque',
    },
    months_short: {
      jan: 'Jan',
      feb: 'Feb',
      mar: 'Mar',
      apr: 'Apr',
      may: 'May',
      jun: 'Jun',
      jul: 'Jul',
      aug: 'Aug',
      sep: 'Sep',
      oct: 'Oct',
      nov: 'Nov',
      dec: 'Dec',
    },
  },
  home: {
    title: 'National overview',
    subtitle: 'Small scale fisheries report',
    download_report: 'Download full report',
    intro_title: 'Automated analytics system for small scale fisheries in Timor-Leste',
    recent_activity: 'Recent Activity',
    fishing_map: 'Fishing Trips Around Timor-Leste Island',
    summary_table: 'Fishery General Statistics',
    indicator: 'Indicator',
    value: 'Value',
    change: 'Change',
    trips: 'Trips',
    revenue: 'Revenue',
    catch: 'Catch',
    marker: 'Peskas Timor-Leste',
    map_title: 'Fishing Activity Heatmap',
    map_description: 'Visualizing fishing vessel density in Timor-Leste waters',
    map_info: 'This heatmap shows the fishing vessel density along the Timor-Leste coasts. The data is based on a sample of 440 vessels equipped with GPS trackers, representing a subset of the total fishery. The gear type was predicted using a machine learning model analyzing the vessels\' movement patterns.',
    map_low_density: 'Low Density',
    map_high_density: 'High Density',
    map_gear_types: 'Gear Types',
    map_time_range: 'Time Range: {start} - {end}',
    map_radius: 'Radius: {value}m',
    map_hover_hint: 'Hover over a hexagon to view detailed fishing activity information.',
    map_tooltip_location: 'Location',
    map_tooltip_total_activities: 'Total Activities',
  },
  catch: {
    subtitle: 'Small scale fisheries',
    series: 'Catch over time',
    table: 'Catch summary',
    summary_table: 'Summary Table',
    series_name: 'Catch',
    month: 'Month',
    catch_t: 'Catch (tons)',
    habitat_treemap: 'Catch by Habitat and Gear',
    treemap_title: 'Catch rate per habitat and gear type',
    treemap_description: 'Each box represents the average hourly catch for an individual fisherman for each habitat and gear type.',
  },
  revenue: {
    series_name: 'Revenue',
    million_usd: 'Revenue (M USD)',
    warning_heading: 'Estimates are provisional',
    warning_content: 'These estimates have not been validated and might be inaccurate. Use with caution.',
    warning_more: 'Learn more',
    summary_table: 'Summary Table',
    habitat_treemap: 'Revenue by Habitat and Gear',
    treemap_title: 'Revenue rate per habitat and gear type',
    treemap_description: 'Each box represents the average hourly revenue for an individual fisherman for each habitat and gear type.',
    table_heading: 'Annual summary',
    description_heading: 'About the data',
    description_subheading: 'Indicator information',
    description_content: 'These estimates have not been thoroughly validated and might be inaccurate. There is some uncertainty on all data used in the calculations. Estimates, even from previous years, may be updated whenever new data is available. Indicators only include data from artisanal and subsistence fisheries.',
  },
  market: {
    title: 'Market',
    price_per_kg: 'Price per kg',
    avg_price: 'Avg price',
    series_name: 'Price',
    price_series: 'Price over time',
    price_usd: 'Price (USD/kg)',
    price_by_region: 'Price per kg by Region',
    all_data: 'All data',
    latest_month: 'Latest month',
    conservation_title: 'Catch Preservation by Region',
    conservation_description: 'Distribution of fish storage methods on boats across Timor-Leste municipalities',
    summary_table: 'Market Summary by Municipality',
    description_footer: '* All values in metric tonnes. Totals only include data after April 2018.',
  },
  composition: {
    title: 'Catch composition',
    percent_heading: 'Relative composition',
    highlight_heading: 'Total catch',
    table_heading: 'Total catch',
    table_footer: '*Pictures by FAO',
    description: 'Description',
    description_text: 'Key notes about composition and methodology.',
    treemap_title: 'Catch by Taxa (tons)',
    placeholder_region: 'Region composition chart placeholder',
    placeholder_taxa: 'Taxa bar highlight chart placeholder',
  },
  nutrients: {
    title: 'Nutritional metrics',
    highlight: 'Nutrient highlight',
    rdi: 'RDI',
    people_count: 'Number of people',
    people_count_short: '{value}k',
    people_count_tooltip: '{value}k people',
    treemap_average_title: 'Nutrients intake by average catch',
    treemap_average_description: 'Every box shows the count of people meeting the daily intake recommendation from an average catch in Timor-Leste.',
    treemap_kg_title: 'Habitats\' nutrient intake from 1 Kg of catch',
    treemap_kg_description: 'Every box shows the count of people meeting the daily intake recommendation from 1 Kg of catch in each habitat for each nutrient.',
    categories: {
      protein: 'Protein',
      iron: 'Iron',
      zinc: 'Zinc',
      vita: 'Vitamin A',
      omega3: 'Omega-3',
      vitd: 'Vitamin D',
      calcium: 'Calcium',
    },
  },
  tracks: {
    title: 'Fishery Indicators',
    map_title: 'Fishing Track Density',
    description: 'The dynamic map is the result of the data-crossing between boats\' GPS tracks (Pelagic Data Systems) and fishing information derived from survey landings (KoBo toolbox). The fishery indicators are aggregated on a geographic grid with a resolution of 0.1 x 0.1 degrees (approximately 11 x 11 kilometres).',
    map_caption: 'Explore fishing trips and associated statistics around the Timor Island coast with our interactive map. Select fishery indicators, fishing gear type, and fish group to filter the results. Click on a trip point to see detailed fishery statistics for that point and the associated municipality.',
    map_note: 'The map displays only the fishing trips for which we have geolocation data, these represent about 5% of the total fishing trips recorded.',
  },
  about: {
    content: 'PESKAS Timor-Leste — data and methods overview.',
    dataverse_title: 'Dataverse',
  },
  table: {
    municipality: 'Municipality',
    revenue_per_trip: 'Revenue per trip',
    landings_per_boat: 'Landings per boat',
    catch_per_trip: 'Catch per trip',
    total_revenue: 'Total revenue',
    total_catch: 'Total catch',
    price_per_kg: 'Price per kg',
    loading: 'Loading table data...',
    error: 'Error loading table data',
  },
  units: {
    kg: 'kg',
    t: 't',
    tons: 'tons',
    m: 'm',
    million_short: 'M',
    thousand_short: 'k',
    people: 'people',
    percentage_label: 'Percentage (%)',
  },
  vars: {
    n_landings: { short_name: 'Surveyed landings' },
    n_tracks: { short_name: 'Tracked trips' },
    n_matched: { short_name: 'Matched tracks' },
    revenue: { short_name: 'Estimated revenue' },
    total_revenue: { short_name: 'Total revenue' },
    recorded_revenue: { short_name: 'Recorded revenue' },
    catch: { short_name: 'Estimated catch' },
    recorded_catch: { short_name: 'Recorded catch' },
    price_kg: { short_name: 'Price per Kg' },
    landing_revenue: { short_name: 'Average trip value' },
    landing_weight: { short_name: 'Average catch per trip' },
    n_landings_per_boat: { short_name: 'Trips per boat' },
    n_boats: { short_name: 'Number of boats' },
    taxa: { short_name: 'Taxa (species)' },
    prop_landings_woman: { short_name: 'Trips with women' },
    pds_tracks_trips: { short_name: 'Number of trips' },
    pds_tracks_cpe: { short_name: 'Catch per unit effort' },
    pds_tracks_rpe: { short_name: 'Revenue per unit effort' },
    nut_supply: { short_name: 'Nutrients supply' },
    nut_rdi: { short_name: 'Number of people meeting the daily intake recommendation' },
  },
  indicators: {
    processing: 'Data processing and validation:',
    limitations: 'Known problems and limitations:',
    quality: 'Data quality:',
    not_assessed: 'Not assessed',
    quality_low: 'Low',
    quality_medium: 'Medium',
    quality_high: 'High',
  },
  data_test: {
    pretitle: 'Development',
    title: 'Data Loading Test',
    alert_title: 'Data Loading Examples',
    alert_description_lead: 'This page demonstrates loading data from {count} JSON files using the',
    alert_description_middle: 'and',
    alert_description_tail: 'hooks. All data is type-safe with TypeScript interfaces.',
    loading: 'Loading data files...',
    error_title: 'Error loading data',
    error_file: '{file}: {message}',
    error_multiple: 'Multiple files: {message}',
    retry: 'Retry',
    cards: {
      aggregated_title: 'aggregated.json',
      summary_title: 'summary_data.json',
      pars_title: 'pars.json',
      taxa_title: 'taxa_names.json ({count} taxa)',
    },
    aggregated: {
      daily_records: 'Daily records',
      weekly_records: 'Weekly records',
      monthly_records: 'Monthly records',
      yearly_records: 'Yearly records',
      latest_month: 'Latest month:',
    },
    summary: {
      survey_areas: 'Survey areas',
      fish_groups: 'Fish groups',
      habitat_series: 'Habitat series',
      portfolio_items: 'Portfolio items',
      fish_groups_label: 'Fish groups:',
    },
    pars: {
      variables: 'Variables',
      taxa_display: 'Taxa to display',
      nutrients: 'Nutrients',
      nav_items: 'Nav items',
      home_title: 'Home title:',
    },
    taxa: {
      code: 'Code',
      name: 'Name',
      more: '... and {count} more taxa',
    },
  },
  settings: {
    title: 'Settings',
    language_label: 'Language',
    close: 'Close',
  },
}

// NOTE: Tetum (Tetun) translations - update as needed
const tet: typeof en = {
  brand: {
    title: 'PESKAS Timor-Leste',
    subtitle: 'Dashboard Jestaun',
  },
  nav: {
    home: 'Uma',
    catch: 'Kaptura',
    revenue: 'Renda',
    market: 'Merkadu',
    composition: 'Kompozisaun',
    nutrients: 'Nutriente',
    tracks: 'Indicador Peska',
    about: 'Konaba',
  },
  header: {
    overview: 'Peska eskala ki\'ik',
  },
  footer: {
    licence: 'Lisensia',
    source: 'Código fonte',
    project: 'Projetu',
    last_updated: 'Atualizadu ikus',
    copyright: 'Direitu autór © {year} Peskas. Direitu hotu reservadu.',
  },
  user_menu: {
    name: 'Jane Pearson',
    role: 'Dezenhadór UI',
    profile: 'Perfil',
    settings: 'Konfigurasaun',
    logout: 'Sai',
  },
  actions: {
    toggle_navigation: 'Troka navegasaun',
    toggle_theme: 'Troka tema',
    toggle_language: 'Troka lian',
    open_user_menu: 'Loke menu utilizadór',
  },
  common: {
    loading: 'Karrega...',
    loading_short: '...',
    error_loading: 'Erru karrega dadus',
    no_data: 'Sei la iha dadus',
    all_years: 'Tinan hotu-hotu',
    all_data: 'Dadus hotu',
    last_12_months: 'Fulan 12 ikus',
    last_month: 'Fulan ikus',
    avg: 'Média',
    municipalities: {
      all: 'Municipiu hotu-hotu',
      ainaro: 'Ainaro',
      atauro: 'Atauro',
      baucau: 'Baukau',
      bobonaro: 'Bobonaru',
      covalima: 'Covalima',
      dili: 'Dili',
      lautem: 'Lautem',
      liquica: 'Likisá',
      manatuto: 'Manatuto',
      manufahi: 'Manufahi',
      oecusse: 'Oekusi',
      viqueque: 'Viqueque',
    },
    months_short: {
      jan: 'Jan',
      feb: 'Fev',
      mar: 'Mar',
      apr: 'Abr',
      may: 'Mai',
      jun: 'Jun',
      jul: 'Jul',
      aug: 'Ago',
      sep: 'Set',
      oct: 'Out',
      nov: 'Nov',
      dec: 'Dez',
    },
  },
  home: {
    title: 'Vizaun jeral nasionál',
    subtitle: 'Relatóriu peska eskala ki\'ik',
    download_report: 'Download relatóriu kompletu',
    intro_title: 'Sistema análise automátiku ba peska eskala ki\'ik iha Timor-Leste',
    recent_activity: 'Atividade Recenti',
    fishing_map: 'Viajen Peska iha Illa Timor-Leste',
    summary_table: 'Estatístika Jerál Peska',
    indicator: 'Indicador',
    value: 'Valor',
    change: 'Mudansa',
    trips: 'Viajen',
    revenue: 'Renda',
    catch: 'Kaptura',
    marker: 'Peskas Timor-Leste',
    map_title: 'Mapa Kalor Atividade Peska',
    map_description: 'Hatudu densidade ro\'o peska iha bee Timor-Leste',
    map_info: 'Mapa kalor ne\'e hatudu densidade ro\'o peska iha kosta Timor-Leste. Dadus ne\'e basa ba amostru ro\'o 440 ho rastreadór GPS, ne\'ebé reprezenta parte husi peska tomak. Tipu ekipamentu peska previzu uza modelu aprendizajen makinal ne\'ebé analiza padraun movimentu ro\'o sira.',
    map_low_density: 'Densidade ki\'ik',
    map_high_density: 'Densidade aas',
    map_gear_types: 'Tipu Ekipamentu',
    map_time_range: 'Intervalu Tempu: {start} - {end}',
    map_radius: 'Raiu: {value}m',
    map_hover_hint: 'Tau mouse iha hexagon ida atu haree informasaun atividade peska detalyadu.',
    map_tooltip_location: 'Lokalizasaun',
    map_tooltip_total_activities: 'Atividade Totál',
  },
  catch: {
    subtitle: 'Peska eskala ki\'ik',
    series: 'Kaptura iha tempu',
    table: 'Resumo kaptura',
    summary_table: 'Tabela Resumu',
    series_name: 'Kaptura',
    month: 'Fulan',
    catch_t: 'Kaptura (tonelada)',
    habitat_treemap: 'Kaptura tuir Habitat no Ekipamentu',
    treemap_title: 'Taxa kaptura ba habitat no tipu ekipamentu',
    treemap_description: 'Kada kaixa reprezenta kaptura média ba oras ida ba peskador ida-idak ba habitat no tipu ekipamentu ida-idak.',
  },
  revenue: {
    series_name: 'Renda',
    million_usd: 'Renda (M USD)',
    warning_heading: 'Estimativa provizóriu',
    warning_content: 'Estimativa sira ne\'e seidauk validadu no bele loos. Uza ho kuidadu.',
    warning_more: 'Hatene liutan',
    summary_table: 'Tabela Resumu',
    habitat_treemap: 'Renda tuir Habitat no Ekipamentu',
    treemap_title: 'Taxa renda ba habitat no tipu ekipamentu',
    treemap_description: 'Kada kaixa reprezenta renda média ba oras ida ba peskador ida-idak ba habitat no tipu ekipamentu ida-idak.',
    table_heading: 'Resumo anuál',
    description_heading: 'Konaba dadus',
    description_subheading: 'Informasaun indicador',
    description_content: 'Estimativa sira ne\'e seidauk validadu kompletu no bele loos. Iha incerteza iha dadus hotu ne\'ebé uza iha kálkulu. Estimativa, maski husi tinan kotuk, bele atualiza bainhira dadus foun disponível. Indicador sira inklui de\'it dadus husi peska artesanál no subsisténsia.',
  },
  market: {
    title: 'Merkadu',
    price_per_kg: 'Presu ba kg',
    avg_price: 'Presu média',
    series_name: 'Presu',
    price_series: 'Presu iha tempu',
    price_usd: 'Presu (USD/kg)',
    price_by_region: 'Presu ba kg tuir Rejiaun',
    all_data: 'Dadus hotu',
    latest_month: 'Fulan ikus',
    conservation_title: 'Preservasaun Kaptura tuir Rejiaun',
    conservation_description: 'Distribuisaun métodu armazenamentu ikan iha ro\'o iha municipiu Timor-Leste',
    summary_table: 'Resumo Merkadu tuir Municipiu',
    description_footer: '* Valor hotu iha tonelada métrika. Total inklui de\'it dadus depois Abril 2018.',
  },
  composition: {
    title: 'Kompozisaun kaptura',
    percent_heading: 'Kompozisaun relativa',
    highlight_heading: 'Kaptura totál',
    table_heading: 'Kaptura totál',
    table_footer: '*Foto husi FAO',
    description: 'Deskrisaun',
    description_text: 'Nota sira konaba kompozisaun no metodolojia.',
    treemap_title: 'Kaptura tuir Taxa (tonelada)',
    placeholder_region: 'Gráfiku kompozisaun rejiaun',
    placeholder_taxa: 'Gráfiku taxa destake',
  },
  nutrients: {
    title: 'Métrika nutrisaun',
    highlight: 'Destaque nutriente',
    rdi: 'RDI',
    people_count: 'Numeru ema',
    people_count_short: '{value}k',
    people_count_tooltip: '{value}k ema',
    treemap_average_title: 'Intake nutriente tuir kaptura média',
    treemap_average_description: 'Kada kaixa hatudu ema nia kontajen ne\'ebé satisfaz rekomendásaun intake loroloron husi kaptura média iha Timor-Leste.',
    treemap_kg_title: 'Intake nutriente habitat husi 1 Kg kaptura',
    treemap_kg_description: 'Kada kaixa hatudu ema nia kontajen ne\'ebé satisfaz rekomendásaun intake loroloron husi 1 Kg kaptura iha habitat ida-idak ba nutriente ida-idak.',
    categories: {
      protein: 'Proteína',
      iron: 'Ferru',
      zinc: 'Zinku',
      vita: 'Vitamina A',
      omega3: 'Omega-3',
      vitd: 'Vitamina D',
      calcium: 'Kálsiu',
    },
  },
  tracks: {
    title: 'Indicador Peska',
    map_title: 'Densidade Trilha Peska',
    description: 'Mapa dinámiku mak rezultadu husi krusamentu dadus entre trilha GPS ro\'o (Pelagic Data Systems) no informasaun peska husi survey landing (KoBo toolbox). Indicador peska sira agrega iha grade jeográfiku ho rezulusaun 0.1 x 0.1 grau (aproximadamente 11 x 11 kilómetru).',
    map_caption: 'Explora viajen peska no estatístika asosiadu iha kosta illa Timor ho mapa interativu ami nian. Hili indicador peska, tipu ekipamentu peska, no grupu ikan atu filtra rezultadu. Klik iha pontu viajen atu haree estatístika peska detalhadu ba pontu ne\'e no municipiu asosiadu.',
    map_note: 'Mapa hatudu de\'it viajen peska ne\'ebé iha dadus jeolokalizasaun, sira reprezenta aproximadamente 5% husi total viajen peska ne\'ebé registadu.',
  },
  about: {
    content: 'PESKAS Timor-Leste — dadus no metodu.',
    dataverse_title: 'Dataverse',
  },
  table: {
    municipality: 'Municipiu',
    revenue_per_trip: 'Renda ba viajen',
    landings_per_boat: 'Landing ba ro\'o',
    catch_per_trip: 'Kaptura ba viajen',
    total_revenue: 'Renda totál',
    total_catch: 'Kaptura totál',
    price_per_kg: 'Presu ba kg',
    loading: 'Karrega dadus tabela...',
    error: 'Erru karrega dadus tabela',
  },
  units: {
    kg: 'kg',
    t: 't',
    tons: 'tonelada',
    m: 'm',
    million_short: 'M',
    thousand_short: 'k',
    people: 'ema',
    percentage_label: 'Percentajen (%)',
  },
  vars: {
    n_landings: { short_name: 'Landing ne\'ebé survey' },
    n_tracks: { short_name: 'Viajen ne\'ebé track' },
    n_matched: { short_name: 'Track ne\'ebé match' },
    revenue: { short_name: 'Renda estimadu' },
    total_revenue: { short_name: 'Renda totál' },
    recorded_revenue: { short_name: 'Renda registadu' },
    catch: { short_name: 'Kaptura estimadu' },
    recorded_catch: { short_name: 'Kaptura registadu' },
    price_kg: { short_name: 'Presu ba Kg' },
    landing_revenue: { short_name: 'Valor viajen média' },
    landing_weight: { short_name: 'Kaptura média ba viajen' },
    n_landings_per_boat: { short_name: 'Viajen ba ro\'o' },
    n_boats: { short_name: 'Numeru ro\'o' },
    taxa: { short_name: 'Taxa (espésie)' },
    prop_landings_woman: { short_name: 'Viajen ho feto' },
    pds_tracks_trips: { short_name: 'Numeru viajen' },
    pds_tracks_cpe: { short_name: 'Kaptura ba unidade esforsu' },
    pds_tracks_rpe: { short_name: 'Renda ba unidade esforsu' },
    nut_supply: { short_name: 'Fornese nutriente' },
    nut_rdi: { short_name: 'Numeru ema ne\'ebé satisfaz rekomendásaun intake loroloron' },
  },
  indicators: {
    processing: 'Prosesamentu no validasaun dadus:',
    limitations: 'Problema no limitasaun ne\'ebé hatene:',
    quality: 'Kualidade dadus:',
    not_assessed: 'Sei la avalia',
    quality_low: 'Kraik',
    quality_medium: 'Médiu',
    quality_high: 'Aas',
  },
  data_test: {
    pretitle: 'Dezenvolvimentu',
    title: 'Teste Karrega Dadus',
    alert_title: 'Ezemplu Karrega Dadus',
    alert_description_lead: 'Pájina ne\'e hatudu karrega dadus husi ficheiru JSON {count} uza hook',
    alert_description_middle: 'no',
    alert_description_tail: 'hooks. Dadus hotu iha tipu-seguru ho interface TypeScript.',
    loading: 'Karrega ficheiru dadus...',
    error_title: 'Erru karrega dadus',
    error_file: '{file}: {message}',
    error_multiple: 'Ficheiru barak: {message}',
    retry: 'Koko fali',
    cards: {
      aggregated_title: 'aggregated.json',
      summary_title: 'summary_data.json',
      pars_title: 'pars.json',
      taxa_title: 'taxa_names.json ({count} taxa)',
    },
    aggregated: {
      daily_records: 'Rekordu loroloron',
      weekly_records: 'Rekordu semanál',
      monthly_records: 'Rekordu fulan',
      yearly_records: 'Rekordu tinan',
      latest_month: 'Fulan ikus:',
    },
    summary: {
      survey_areas: 'Área survey',
      fish_groups: 'Grupu ikan',
      habitat_series: 'Seri habitat',
      portfolio_items: 'Item portfólio',
      fish_groups_label: 'Grupu ikan:',
    },
    pars: {
      variables: 'Variavel',
      taxa_display: 'Taxa atu hatudu',
      nutrients: 'Nutriente',
      nav_items: 'Item navegasaun',
      home_title: 'Titulu Uma:',
    },
    taxa: {
      code: 'Kódigu',
      name: 'Naran',
      more: '... no {count} taxa tan',
    },
  },
  settings: {
    title: 'Konfigurasaun',
    language_label: 'Lian',
    close: 'Taka',
  },
}

const DICTS: Record<Lang, Dict> = { en, tet }

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'en'
    const stored = window.localStorage.getItem('appLang') as Lang | null
    return stored ?? 'en'
  })

  const setLang = (l: Lang) => {
    setLangState(l)
    if (typeof window !== 'undefined') window.localStorage.setItem('appLang', l)
  }

  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.setAttribute('lang', lang)
  }, [lang])

  const t = useMemo(() => {
    const dict = DICTS[lang]
    return (key: string, params?: I18nParams) => {
      const { defaultValue, ...interpolations } = params ?? {}
      const raw = (get(dict, key) as string)
        ?? (get(DICTS.en, key) as string)
        ?? defaultValue
        ?? key
      return typeof raw === 'string' ? interpolate(raw, interpolations) : String(raw)
    }
  }, [lang])

  const value = useMemo<I18nContextValue>(() => ({ lang, setLang, t }), [lang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
