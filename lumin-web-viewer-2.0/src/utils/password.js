export const PASSWORD_STRENGTH = {
  NOT_DEFINE: 'Not Define',
  WEAK: 'Weak',
  MEDIUM: 'Medium',
  STRONG: 'Strong',
};

export const MAX_PASSWORD_LENGTH = 100;

export const MIN_OLD_PASSWORD_LENGTH = 6;

export const MIN_PASSWORD_LENGTH = 8;

export const MIN_PDF_PASSWORD_LENGTH = 4;

export const MAX_PDF_PASSWORD_LENGTH = 32;

export const PASSWORD_STRENGTH_TO_ARRAY = Object.values(PASSWORD_STRENGTH);

export const convertLevelToStrengthIndex = (level) =>
  PASSWORD_STRENGTH_TO_ARRAY.findIndex((strength) => strength === level);

export const PASSWORD_COLOR = [
  'var(--color-neutral-20)',
  'var(--color-secondary-50)',
  'var(--color-warning-50)',
  'var(--color-success-50)',
];

export const letterValidator = (input) => input.length >= 8;
export const numberValidator = (input) => /[0-9]+/.test(input);
export const lowerCaseValidator = (input) => /[a-z]+/.test(input);
export const upperCaseValidator = (input) => /[A-Z]+/.test(input);

export const getPasswordStrength = (password) => {
  if (!password) {
    return 0;
  }
  if (!letterValidator(password)) {
    return 1;
  }
  let strength = 0;
  const validators = [numberValidator, lowerCaseValidator, upperCaseValidator];
  validators.forEach((fn) => {
    if (fn(password)) {
      strength += 1;
    }
  });
  return strength;
};

export const getPwdStrengthColors = (strength) => {
  const color = PASSWORD_COLOR[strength];
  const bar = [];
  for (let i = 1; i <= 3; i++) {
    if (i <= strength) {
      bar.push(color);
    } else {
      bar.push(PASSWORD_COLOR[0]);
    }
  }
  return bar;
};

export const validatePassword = (password, level) =>
  getPasswordStrength(password) >= convertLevelToStrengthIndex(level);
