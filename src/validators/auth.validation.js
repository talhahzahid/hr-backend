const sendValidationError = (res, errors) =>
  res.status(400).json({
    success: false,
    message: errors.join(", "),
  });

export const validateLogin = (req, res, next) => {
  const errors = [];
  const { email, password } = req.body;

  if (!email || !String(email).trim()) {
    errors.push("Email is required");
  }

  if (!password || !String(password).trim()) {
    errors.push("Password is required");
  }

  if (errors.length) {
    return sendValidationError(res, errors);
  }

  next();
};
