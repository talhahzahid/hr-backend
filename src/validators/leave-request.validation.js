const LEAVE_TYPES = [
  "Annual",
  "Sick",
  "Casual",
  "Maternity",
  "Paternity",
  "Bereavement",
  "Unpaid",
  "Compensatory",
  "Other",
];

const SESSIONS = ["Full Day", "First Half", "Second Half"];

const isValidDate = (value) => !Number.isNaN(new Date(value).getTime());

const sendValidationError = (res, errors) =>
  res.status(400).json({
    success: false,
    message: errors.join(", "),
  });

export const validateCreateLeaveRequest = (req, res, next) => {
  const errors = [];
  const { employeeId, leaveType, startDate, endDate, totalDays, session, reason } =
    req.body;

  if (employeeId === undefined || employeeId === null || employeeId === "") {
    errors.push("Employee is required");
  } else if (Number.isNaN(Number(employeeId))) {
    errors.push("Employee ID must be a valid number");
  }

  if (!leaveType) {
    errors.push("Leave type is required");
  } else if (!LEAVE_TYPES.includes(leaveType)) {
    errors.push(`Leave type must be one of: ${LEAVE_TYPES.join(", ")}`);
  }

  if (!startDate) {
    errors.push("Start date is required");
  } else if (!isValidDate(startDate)) {
    errors.push("Start date must be a valid date");
  }

  if (!endDate) {
    errors.push("End date is required");
  } else if (!isValidDate(endDate)) {
    errors.push("End date must be a valid date");
  } else if (startDate && isValidDate(startDate)) {
    if (new Date(endDate) < new Date(startDate)) {
      errors.push("End date must be on or after start date");
    }
  }

  if (totalDays === undefined || totalDays === null || totalDays === "") {
    errors.push("Total days is required");
  } else if (Number(totalDays) < 0.5) {
    errors.push("Total days must be at least 0.5");
  }

  if (session && !SESSIONS.includes(session)) {
    errors.push(`Session must be one of: ${SESSIONS.join(", ")}`);
  }

  if (!reason || !String(reason).trim()) {
    errors.push("Reason is required");
  }

  if (errors.length) {
    return sendValidationError(res, errors);
  }

  next();
};

export const validateApproveLeaveRequest = (req, res, next) => {
  const errors = [];
  const { approvedBy } = req.body;

  if (approvedBy === undefined || approvedBy === null || approvedBy === "") {
    errors.push("Approved by is required");
  } else if (Number.isNaN(Number(approvedBy))) {
    errors.push("Approved by must be a valid number");
  }

  if (errors.length) {
    return sendValidationError(res, errors);
  }

  next();
};

export const validateRejectLeaveRequest = (req, res, next) => {
  const errors = [];
  const { approvedBy, rejectionReason } = req.body;

  if (approvedBy === undefined || approvedBy === null || approvedBy === "") {
    errors.push("Approved by is required");
  } else if (Number.isNaN(Number(approvedBy))) {
    errors.push("Approved by must be a valid number");
  }

  if (!rejectionReason || !String(rejectionReason).trim()) {
    errors.push("Rejection reason is required");
  }

  if (errors.length) {
    return sendValidationError(res, errors);
  }

  next();
};
