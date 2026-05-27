const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_LETTER_PATTERN = /[A-Za-z]/;
const PASSWORD_NUMBER_PATTERN = /\d/;

export function validateEmail(email: string) {
  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    return "Email is required.";
  }

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return "Enter a valid email address.";
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

  if (!/[A-Za-z]/.test(normalizedName)) {
    return "Full name cannot be only numbers.";
  }

  return null;
}
