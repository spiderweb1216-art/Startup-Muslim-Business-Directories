export const FOUNDER_OPEN_TO_OPTIONS = [
  { value: 'funding', label: 'Open to funding' },
  { value: 'partnerships', label: 'Open to partnerships' },
  { value: 'speaking', label: 'Open to speaking' },
  { value: 'co-founder', label: 'Open to co-founder' },
];

export const founderOpenToLabel = (value = '') =>
  FOUNDER_OPEN_TO_OPTIONS.find((option) => option.value === value)?.label
  || String(value).replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
