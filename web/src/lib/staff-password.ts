const MIN_PASSWORD_LENGTH = 10;

const getConfiguredPassword = () => {
  const password = process.env.STAFF_LOGIN_PASSWORD ?? process.env.STAFF_PASSCODE;
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return null;
  }
  return password;
};

export const isStaffPasswordConfigured = () => Boolean(getConfiguredPassword());

export const verifyStaffPassword = (password: string) => {
  const configuredPassword = getConfiguredPassword();
  if (!configuredPassword) return false;
  return password === configuredPassword;
};

export const getStaffPasswordConfigError = () =>
  "STAFF_LOGIN_PASSWORD must be at least 10 characters long.";
