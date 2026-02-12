// Helper function to recursively clean objects
const sanitize = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;

  // Loop through every key in the object
  Object.keys(obj).forEach(key => {
    const value = obj[key];

    if (typeof value === 'string') {
      // Trim string values
      obj[key] = value.trim();
    } else if (typeof value === 'object') {
      // If it's a nested object (like address), dive deeper (recursion)
      sanitize(value);
    }
  });
};

const cleanBody = (req, res, next) => {
  if (req.body) {
    sanitize(req.body);
  }
  next();
};

module.exports = cleanBody;