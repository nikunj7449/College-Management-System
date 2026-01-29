export const validateEmail = (email) => {
  // Standard email regex
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  // Min 6 chars, at least one number and one letter
  const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  return re.test(password);
};

export const validateID = (id) => {
  // Ensure ID is alphanumeric and at least 3 characters
  const re = /^[a-zA-Z0-9]{3,}$/;
  return re.test(id);
};

export const validateMatch = (str1, str2) => {
  return str1 === str2;
};