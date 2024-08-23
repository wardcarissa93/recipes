import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import DOMPurify from 'dompurify';
import { StylesConfig } from 'react-select';
import { type IngredientOption } from './types.ts';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeString(input: string): string {
  return DOMPurify.sanitize(input);
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
      return `${hours} hr ${mins} min`;
  } else if (hours > 0) {
      return `${hours} hr`;
  } else if (mins > 0) {
      return `${mins} min`;
  } else {
      return 'N/A';
  }
}

export const multiSelectStyles: StylesConfig<IngredientOption, true> = {
  control: (provided) => ({
      ...provided,
      minHeight: '40px',
      height: '40px',
      boxShadow: 'none',
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
      backgroundColor: '#f1f5f9',
      '&:hover': {
        border: '2px solid #818cf8'
      }
  }),
  valueContainer: (provided) => ({
      ...provided,
      height: '40px',
      padding: '0 6px',
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
  }),
  input: (provided) => ({
      ...provided,
      margin: '0px',
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
  }),
  indicatorSeparator: () => ({
      display: 'none'
  }),
  indicatorsContainer: (provided) => ({
      ...provided,
      height: '40px',
      fontSize: '0.875rem',
      lineHeight: '1.25rem'
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#f1f5f9',
  }),
  menuList: (provided) => ({
    ...provided,
    backgroundColor: '#f1f5f9',
  })
};

export const singleSelectStyles: StylesConfig<IngredientOption, false> = {
  control: (provided, state) => ({
      ...provided,
      minHeight: '40px',
      height: '40px',
      boxShadow: 'none',
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
      backgroundColor: '#f1f5f9',
      borderColor: state.isFocused ? '#818cf8' : provided.borderColor,
      borderWidth: state.isFocused ? '2px' : provided.borderWidth,
  }),
  valueContainer: (provided) => ({
      ...provided,
      height: '40px',
      padding: '0 6px',
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
  }),
  input: (provided) => ({
      ...provided,
      margin: '0px',
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
  }),
  indicatorSeparator: () => ({
      display: 'none'
  }),
  indicatorsContainer: (provided) => ({
      ...provided,
      height: '40px',
      fontSize: '0.875rem',
      lineHeight: '1.25rem'
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#f1f5f9',
  }),
  menuList: (provided) => ({
    ...provided,
    backgroundColor: '#f1f5f9',
  })
};