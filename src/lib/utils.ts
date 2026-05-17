import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | number | any): string {
  if (!date) return 'N/A';
  const d = new Date(date?.seconds ? date.seconds * 1000 : date);
  return d.toLocaleDateString();
}
