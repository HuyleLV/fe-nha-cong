/*
 * Locales code
 * https://gist.github.com/raushankrjha/d1c7e35cf87e69aa8b4208a8171a8416
 */

export type InputNumberValue = string | number | null | undefined;

type Options = Intl.NumberFormatOptions | undefined;

const DEFAULT_LOCALE = { code: 'en-US', currency: 'USD' };

function processInput(inputValue: InputNumberValue): number | null {
  if (inputValue == null || Number.isNaN(inputValue)) return null;
  return Number(inputValue);
}

// ----------------------------------------------------------------------

export function fNumber(inputValue: InputNumberValue, options?: Options) {
  const locale = DEFAULT_LOCALE;

  const number = processInput(inputValue);
  if (number === null) return '';

  const fm = new Intl.NumberFormat(locale.code, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(number);

  return normalizeNumberString(fm);
}

// ----------------------------------------------------------------------

export function fCurrency(inputValue: InputNumberValue, options?: Options) {
  const locale = DEFAULT_LOCALE;

  const number = processInput(inputValue);
  if (number === null) return '';

  const fm = new Intl.NumberFormat(locale.code, {
    style: 'currency',
    currency: locale.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(number);

  return normalizeNumberString(fm);
}

// ----------------------------------------------------------------------

export function fPercent(inputValue: InputNumberValue, options?: Options) {
  const locale = DEFAULT_LOCALE;

  const number = processInput(inputValue);
  if (number === null) return '';

  const fm = new Intl.NumberFormat(locale.code, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
    ...options,
  }).format(number / 100);

  return normalizeNumberString(fm);
}

// ----------------------------------------------------------------------

export function fShortenNumber(inputValue: InputNumberValue, options?: Options) {
  const locale = DEFAULT_LOCALE;

  const number = processInput(inputValue);
  if (number === null) return '';

  const fm = new Intl.NumberFormat(locale.code, {
    notation: 'compact',
    maximumFractionDigits: 2,
    ...options,
  }).format(number);

  return normalizeNumberString(fm).replace(/[A-Z]/g, (match) => match.toLowerCase());
}

// ----------------------------------------------------------------------

export function fData(inputValue: InputNumberValue) {
  const number = processInput(inputValue);
  if (number === null || number === 0) return '0 bytes';

  const units = ['bytes', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb'];
  const decimal = 2;
  const baseValue = 1024;

  const index = Math.floor(Math.log(number) / Math.log(baseValue));
  const fm = `${parseFloat((number / baseValue ** index).toFixed(decimal))} ${units[index]}`;

  return normalizeNumberString(fm);
}

// ----------------------------------------------------------------------

export function fPhoneNumber(phoneNumber: string) {
  if (!phoneNumber) return phoneNumber;

  return phoneNumber.slice(0, 1) !== "+" ? `+${phoneNumber}` : phoneNumber;
}

export function formatMoneyVND(amount: number | string, showSymbol: boolean = true): string {
  const value = typeof amount === "number" ? amount : Number(amount);
  if (isNaN(value)) return "0 ₫";

  const formatted = new Intl.NumberFormat("vi-VN", {
    style: showSymbol ? "currency" : "decimal",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

  return normalizeNumberString(formatted);
}

// ----------------------------------------------------------------------
// Normalize formatted number strings by removing unnecessary trailing zeros
// Examples:
//  - "12.00" -> "12"
//  - "12.50" -> "12.5"
//  - "1,234.00 ₫" -> "1,234 ₫"
function normalizeNumberString(s: string) {
  if (!s || typeof s !== 'string') return s;

  // Split off any non-number suffix (like currency symbol or %), operate on number part
  const match = s.match(/^([\d.,\s]+)(.*)$/);
  if (!match) return s;

  const numPart = match[1];
  const suffix = match[2] || '';

  // Find decimal separator: if both present, assume the last one is decimal separator
  const lastDot = numPart.lastIndexOf('.');
  const lastComma = numPart.lastIndexOf(',');

  let integerPart = numPart;
  let decimalPart = '';

  if (lastDot > lastComma) {
    integerPart = numPart.slice(0, lastDot);
    decimalPart = numPart.slice(lastDot + 1);
  } else if (lastComma > lastDot) {
    integerPart = numPart.slice(0, lastComma);
    decimalPart = numPart.slice(lastComma + 1);
  }

  if (decimalPart === '') return (integerPart + suffix).trim();

  // Remove trailing zeros from decimal part
  decimalPart = decimalPart.replace(/0+$/u, '');

  let result = integerPart;
  if (decimalPart.length > 0) {
    // Use '.' as decimal if original used '.' as decimal separator, else ','
    const sep = (lastDot > lastComma) ? '.' : ',';
    result = `${integerPart}${sep}${decimalPart}`;
  }

  return (result + suffix).trim();
}
