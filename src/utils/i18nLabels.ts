import type { Municipality } from '../constants';
import type { I18nContextValue } from '../i18n';

/** Label for filter callouts: national vs translated municipality name. */
export function getMunicipalityScopeLabel(
  t: I18nContextValue['t'],
  municipality: Municipality
): string {
  return municipality === 'all' ? t('common.national') : t(`common.municipalities.${municipality}`);
}
