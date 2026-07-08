const sendValidationError = (res, errors) =>
  res.status(400).json({
    success: false,
    message: errors.join(", "),
  });

export const validateCheckIn = (req, res, next) => {
  const errors = [];
  const { employeeId } = req.body;

  if (employeeId === undefined || employeeId === null || employeeId === "") {
    errors.push("Employee ID is required");
  } else if (Number.isNaN(Number(employeeId))) {
    errors.push("Employee ID must be a valid number");
  }

  if (errors.length) {
    return sendValidationError(res, errors);
  }

  next();
};

export const validateCheckOut = (req, res, next) => {
  const errors = [];
  const { checkOutTime } = req.body;

  if (checkOutTime && Number.isNaN(new Date(checkOutTime).getTime())) {
    errors.push("Check-out time must be a valid date");
  }

  if (errors.length) {
    return sendValidationError(res, errors);
  }

  next();
};
