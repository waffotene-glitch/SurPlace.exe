const EMAIL_PATTERN = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;
const PASSWORD_LETTER_PATTERN = /[A-Za-z]/;
const PASSWORD_NUMBER_PATTERN = /\d/;

export function validateEmail(email: string) {
  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    return "Email is required.";
  }

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return "Please enter a valid email address.";
  }

  return null;
}

export function validatePassword(password: string) {
  if (!password) {
    return "Password is required.";
  }

  if (password.length < 4) {
    return "Password must be at least 4 characters.";
  }

  if (!PASSWORD_LETTER_PATTERN.test(password) || !PASSWORD_NUMBER_PATTERN.test(password)) {
    return "Password must include at least one letter and one number.";
  }

  return null;
}

export function validateFullName(fullName: string) {
  const normalizedName = fullName.trim();

  if (!normalizedName) {
    return "Full name is required.";
  }

  if (normalizedName.length < 2) {
    return "Full name must be at least 2 characters.";
  }

  if (!/[\p{L}]/u.test(normalizedName)) {
    return "Full name cannot be only numbers or symbols.";
  }

  if (/^-/u.test(normalizedName) || /(^|\s)-/u.test(normalizedName) || /--/u.test(normalizedName)) {
    return "Full name cannot contain negative-looking values.";
  }

  if (!/^[\p{L}][\p{L}' -]*$/u.test(normalizedName)) {
    return "Full name can only include letters, spaces, hyphens, and apostrophes.";
  }

  return null;
}
