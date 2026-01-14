/**
 * TypeScript type definitions for Peskas Timor Portal data files
 * Generated from public/data/*.json files
 */

// ============ Time period bins ============
export type TimeBin = 'day' | 'week' | 'month' | 'year';

// ============ aggregated.json ============
export interface AggregatedRecord {
  date_bin_start: string;
  n_landings: number;
  prop_landings_woman?: number;
  fuel?: number;
  n_tracks: number;
  n_matched: number;
  prop_matched: number;
  landing_revenue?: number;
  landing_weight?: number;
  n_landings_per_boat?: number;
  revenue?: number;
  catch?: number;
  price_kg?: number;
  recorded_revenue?: number;
  recorded_catch?: number;
  n_boats: number;
  day?: string;
  week?: string;
  month?: string;
  year?: string;
}

export interface AggregatedData {
  day: AggregatedRecord[];
  week: AggregatedRecord[];
  month: AggregatedRecord[];
  year: AggregatedRecord[];
}

// ============ municipal_aggregated.json ============
export interface MunicipalAggregatedRecord {
  region: string;
  date_bin_start: string;
  is_imputed: boolean;
  n_landings_per_boat: number;
  landing_revenue: number;
  landing_weight: number;
  price_kg: number;
  revenue: number;
  catch: number;
  n_boats: number;
  recorded_catch?: number;
  recorded_revenue?: number;
  month: string;
  year: string;
}

// ============ taxa_aggregated.json ============
export interface TaxaAggregatedRecord {
  date_bin_start: string;
  grouped_taxa: string;
  landing_weight: number;
  n_landings_per_boat: number;
  revenue: number;
  catch: number;
  n_boats: number;
  month: string;
  year: string;
}

export interface TaxaAggregatedData {
  day: TaxaAggregatedRecord[];
  week: TaxaAggregatedRecord[];
  month: TaxaAggregatedRecord[];
  year: TaxaAggregatedRecord[];
}

// ============ municipal_taxa.json ============
export interface MunicipalTaxaRecord {
  region: string;
  date_bin_start: string;
  grouped_taxa: string;
  landing_weight: number;
  n_landings_per_boat: number;
  catch: number;
  month: string;
  year: string;
}

// ============ nutrients_aggregated.json ============
export interface NutrientsAggregatedRecord {
  date_bin_start: string;
  nutrient: NutrientType;
  nut_supply: number;
  nut_rdi: number;
  n_boats: number;
  month: string;
  year: string;
}

export interface NutrientsAggregatedData {
  day: NutrientsAggregatedRecord[];
  week: NutrientsAggregatedRecord[];
  month: NutrientsAggregatedRecord[];
  year: NutrientsAggregatedRecord[];
}

export type NutrientType = 'omega3' | 'protein' | 'zinc' | 'calcium' | 'vitaminA' | 'iron';

// ============ summary_data.json ============
export interface SurveyCountByArea {
  Area: string;
  n: number;
}

export interface EstimatedTonsByGroup {
  fish_group: string;
  tons: number;
}

export interface EstimatedRevenueByArea {
  Area: string;
  'Estimated revenue': number;
}

export interface HabitatDataPoint {
  x: string;
  y: number;
}

export interface HabitatSeries {
  name: string;
  data: HabitatDataPoint[];
}

export interface RegionalDonut {
  region: string;
  estimated_revenue?: number;
  estimated_catch?: number;
  n_landings?: number;
}

export interface HabitatRadar {
  habitat: string;
  mean_catch: number;
  mean_revenue: number;
}

export interface ConservationMethods {
  region: string;
  method: string;
  perc: number;
  landings: number;
}

export interface ConservationRecord {
  municipality: string;
  catch_preservation: string;
  count: number;
  perc: number;
}

export interface PortfolioData {
  habitat: string;
  mean_catch: number;
  mean_revenue: number;
}

export interface SummaryData {
  n_surveys: SurveyCountByArea[];
  estimated_tons: EstimatedTonsByGroup[];
  estimated_revenue: EstimatedRevenueByArea[];
  catch_habitat: HabitatSeries[];
  revenue_habitat: HabitatSeries[];
  regional_revenue_donut: RegionalDonut[];
  regional_catch_donut: RegionalDonut[];
  regional_landings_donut: RegionalDonut[];
  habitat_radar: HabitatRadar[];
  conservation_methods: ConservationMethods[];
  conservation: ConservationRecord[];
  portfolio_data: PortfolioData[];
  map_center?: [number, number][];
}

// ============ indicators_grid.json ============
export interface IndicatorsGridRecord {
  cell: string;
  month_date: string;
  gear_type: string;
  region: string;
  Lat: number;
  Lng: number;
  region_cpe: number;
  region_rpe: number;
  length: number;
  CPE: number;
  RPE: number;
  CPE_log: number;
  RPE_log: number;
  catch_taxon: string;
  fish_group: string;
}

// ============ predicted_tracks.json ============
export interface PredictedTrackRecord {
  year: number;
  lat: number;
  lon: number;
  Gear: string;
}

// ============ taxa_names.json ============
export interface TaxaName {
  grouped_taxa: string;
  grouped_taxa_names: string;
}

// ============ label_groups_list.json ============
export interface LabelGroupsList {
  [group: string]: string[];
}

// ============ var_dictionary.json ============
export interface VarDefinition {
  short_name: string;
  long_name?: string;
  description?: string;
  format: string;
  methods?: string;
  problems?: string;
  quality?: 'low' | 'medium' | 'high';
  multiplier?: number;
  suffix?: string;
}

export interface VarDictionary {
  [varName: string]: VarDefinition;
}

// ============ pars.json ============
export interface ParsVars {
  [key: string]: {
    short_name: string;
    long_name?: string;
    description?: string;
    format?: string;
    methods?: string;
    problems?: string;
    quality?: string;
    multiplier?: number;
    suffix?: string;
  };
}

export interface TaxaDefinition {
  short_name: string;
}

export interface ParsTaxa {
  to_display: string[];
  taxa: {
    [code: string]: TaxaDefinition;
  };
}

export interface NutrientDefinition {
  short_name: string;
  conversion_fact: number;
}

export interface ParsNutrients {
  to_display: string[];
  nutrients: {
    [key: string]: NutrientDefinition;
  };
}

export interface TextItem {
  text: string;
}

export interface NavItem {
  text: string;
}

export interface ParsHeader {
  subtitle: TextItem;
  nav: {
    [key: string]: NavItem;
  };
}

export interface ParsFooter {
  nav: {
    [key: string]: NavItem;
  };
  copyright: TextItem;
  update_time: TextItem;
}

export interface ParsHome {
  title: TextItem;
  subtitle: TextItem;
  report: TextItem;
  intro: {
    title: string;
    content: string;
  };
  table: {
    title: string;
    caption: string;
  };
  map: {
    title: string;
    caption: string;
  };
}

export interface ParsRevenue {
  warning_1: {
    heading: TextItem;
    content: TextItem;
    more: TextItem;
  };
  area_dropdown: TextItem;
  treemap: {
    title: string;
    description: string;
  };
  table: {
    heading: TextItem;
    period_col: TextItem;
  };
  description: {
    heading: TextItem;
    subheading: TextItem;
    content: TextItem;
  };
}

export interface ParsCatch {
  subtitle: TextItem;
  treemap: {
    title: string;
    description: string;
  };
}

export interface ParsComposition {
  title: TextItem;
  highlight: {
    heading: TextItem;
  };
  percent: {
    heading: TextItem;
  };
  table: {
    heading: TextItem;
    footer: TextItem;
  };
}

export interface ParsMarket {
  title: TextItem;
  description: {
    footer: TextItem;
  };
  conservation: {
    region_barplot: {
      title: string;
      description: string;
    };
  };
}

export interface ParsPdsTracks {
  description: {
    content: TextItem;
    map: {
      caption: string;
      note: string;
    };
  };
}

export interface ParsNutrientsSection {
  to_display: string[];
  nutrients: {
    [key: string]: NutrientDefinition;
  };
  title: TextItem;
  treemap_average: {
    title: string;
    description: string;
  };
  treemap_kg?: {
    title: string;
  };
}

export interface ParsIndicators {
  processing: TextItem;
  limitations: TextItem;
  quality: TextItem;
}

export interface ParsSettings {
  title: TextItem;
  language_select: {
    label: TextItem;
  };
  buttons: {
    close: {
      label: string;
    };
  };
}

export interface ParsAbout {
  text: string;
}

export interface ParsData {
  vars: ParsVars;
  taxa: ParsTaxa;
  conservation: {
    names: string[];
  };
  header: ParsHeader;
  footer: ParsFooter;
  home: ParsHome;
  revenue: ParsRevenue;
  catch: ParsCatch;
  composition: ParsComposition;
  market: ParsMarket;
  pds_tracks: ParsPdsTracks;
  nutrients: ParsNutrientsSection;
  indicators: ParsIndicators;
  settings: ParsSettings;
  about: ParsAbout;
}

// ============ data_last_updated.json ============
export type DataLastUpdated = string;

// ============ All data types union for loading ============
export type DataFileName =
  | 'aggregated'
  | 'municipal_aggregated'
  | 'taxa_aggregated'
  | 'municipal_taxa'
  | 'nutrients_aggregated'
  | 'summary_data'
  | 'indicators_grid'
  | 'predicted_tracks'
  | 'taxa_names'
  | 'label_groups_list'
  | 'var_dictionary'
  | 'pars'
  | 'data_last_updated';

export interface DataTypeMap {
  aggregated: AggregatedData;
  municipal_aggregated: MunicipalAggregatedRecord[];
  taxa_aggregated: TaxaAggregatedData;
  municipal_taxa: MunicipalTaxaRecord[];
  nutrients_aggregated: NutrientsAggregatedData;
  summary_data: SummaryData;
  indicators_grid: IndicatorsGridRecord[];
  predicted_tracks: PredictedTrackRecord[];
  taxa_names: TaxaName[];
  label_groups_list: LabelGroupsList;
  var_dictionary: VarDictionary;
  pars: ParsData;
  data_last_updated: DataLastUpdated;
}
