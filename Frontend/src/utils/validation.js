// Check empty fields
export function isEmpty(value) {
  return !value || value.trim() === "";
}

// Luhn algorithm for card number validation
export function isValidCardNumber(number) {
  const cleaned = number.replace(/\s+/g, "");
  if (!/^\d{13,19}$/.test(cleaned)) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

// Check expiry date is not in the past
export function isValidExpiry(month, year) {
  const m = parseInt(month);
  const y = parseInt(year);

  if (isNaN(m) || isNaN(y)) return false;
  if (m < 1 || m > 12) return false;

  const now = new Date();
  const expiry = new Date(y, m - 1);

  return expiry >= new Date(now.getFullYear(), now.getMonth());
}

// Check CVV
export function isValidCvv(cvv) {
  return /^[0-9]{3,4}$/.test(cvv);
}

export function detectCardBrand(number) {
  if (!number) return "Unknown";

  if (/^4/.test(number)) return "Visa";
  if (/^5[1-5]/.test(number)) return "MasterCard";
  if (/^3[47]/.test(number)) return "American Express";
  if (/^6(?:011|5)/.test(number)) return "Discover";

  return "Unknown";
}