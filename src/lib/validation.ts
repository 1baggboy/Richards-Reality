export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_CHARS_REGEX = /^[+\d\s().-]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  const trimmed = phone.trim();
  if (!trimmed || !PHONE_CHARS_REGEX.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

export function isDateTodayOrFuture(dateStr: string): boolean {
  if (!dateStr) return false;
  const parsed = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsed >= today;
}

export function isAdultDateOfBirth(dateStr: string): boolean {
  if (!dateStr) return false;
  const dob = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(dob.getTime())) return false;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 18 && age <= 120;
}

export function isPositiveNumeric(value: string): boolean {
  const num = Number(value);
  return value.trim() !== '' && !Number.isNaN(num) && num > 0;
}
