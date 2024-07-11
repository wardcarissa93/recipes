import DOMPurify from 'dompurify';

export function sanitizeString(input: string): string {
  return DOMPurify.sanitize(input);
}