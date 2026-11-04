/**
 * List of Ghana regions for delivery options
 */
export const GHANA_REGIONS = [
  { value: '', label: 'Select region below' },
  { value: 'greater_accra', label: 'Greater Accra' },
  { value: 'ashanti', label: 'Ashanti' },
  { value: 'central', label: 'Central' },
  { value: 'eastern', label: 'Eastern' },
  { value: 'western', label: 'Western' },
  { value: 'volta', label: 'Volta' },
  { value: 'northern', label: 'Northern' },
  { value: 'upper_east', label: 'Upper East' },
  { value: 'upper_west', label: 'Upper West' },
  { value: 'brong_ahafo', label: 'Brong Ahafo' },
  { value: 'bono', label: 'Bono' },
  { value: 'bono_east', label: 'Bono East' },
  { value: 'ahafo', label: 'Ahafo' },
  { value: 'savannah', label: 'Savannah' },
  { value: 'north_east', label: 'North East' },
  { value: 'oti', label: 'Oti' },
] as const;

export type GhanaRegionValue = typeof GHANA_REGIONS[number]['value'];
