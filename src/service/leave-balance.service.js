import moment from "moment";
import {
  BALANCED_LEAVE_TYPES,
  LEAVE_QUOTAS,
} from "../config/leave-policy.js";
import Employee from "../models/employee.models.js";
import LeaveBalance from "../models/leave-balance.model.js";

const employeeInclude = {
  model: Employee,
  as: "employee",
  attributes: [
    "id",
    "firstName",
    "lastName",
    "email",
    "departmentName",
    "designation",
  ],
};

/**
 * Prorate full-year quota by remaining months in the joining year.
 * Joining month is included (Jan → 12 months, Jul → 1 month).
 * Rounded to nearest 0.5 day.
 */
export const calculateProratedLeaves = (fullYearQuota, dateOfJoining) => {
  const joinDate = moment(dateOfJoining);
  if (!joinDate.isValid()) {
    const error = new Error("Invalid date of joining");
    error.statusCode = 400;
    throw error;
  }

  const remainingMonths = 12 - joinDate.month(); // month() is 0-based
  const prorated = (fullYearQuota / 12) * remainingMonths;
  return Math.round(prorated * 2) / 2;
};

const ensureEmployeeExists = async (employeeId) => {
  const employee = await Employee.findByPk(employeeId);
  if (!employee) {
    const error = new Error("Employee not found");
    error.statusCode = 404;
    throw error;
  }
  return employee;
};

/**
 * Allocate Annual / Casual / Sick balances for an employee on join.
 * Uses calendar year of dateOfJoining and prorates by remaining months.
 */
export const allocateLeaveBalancesOnJoin = async (
  employeeId,
  dateOfJoining,
) => {
  const joinDate = moment(dateOfJoining);
  const year = joinDate.year();

  const balances = [];

  for (const leaveType of BALANCED_LEAVE_TYPES) {
    const allocated = calculateProratedLeaves(
      LEAVE_QUOTAS[leaveType],
      dateOfJoining,
    );

    const [balance] = await LeaveBalance.findOrCreate({
      where: { employeeId, leaveType, year },
      defaults: {
        employeeId,
        leaveType,
        year,
        allocated,
        used: 0,
        remaining: allocated,
      },
    });

    balances.push(balance);
  }

  return balances;
};

export const getAllLeaveBalancesService = async (
  page,
  limit,
  filters = {},
) => {
  const pageNumber = Number(page) || 1;
  const pageSize = Number(limit) || 10;
  const offset = (pageNumber - 1) * pageSize;
  const where = {};

  if (filters.employeeId) {
    where.employeeId = Number(filters.employeeId);
  }

  if (filters.leaveType) {
    where.leaveType = filters.leaveType;
  }

  const targetYear = filters.year ? Number(filters.year) : moment().year();
  where.year = targetYear;

  const { count, rows } = await LeaveBalance.findAndCountAll({
    where,
    limit: pageSize,
    offset,
    include: [employeeInclude],
    order: [
      ["employeeId", "ASC"],
      ["leaveType", "ASC"],
    ],
  });

  return {
    leaveBalances: rows,
    totalRecords: count,
    totalPages: Math.ceil(count / pageSize),
    currentPage: pageNumber,
    pageSize,
    filters: {
      employeeId: filters.employeeId ? Number(filters.employeeId) : null,
      leaveType: filters.leaveType || null,
      year: targetYear,
    },
    quotas: LEAVE_QUOTAS,
  };
};

export const getLeaveBalancesService = async (employeeId, year) => {
  await ensureEmployeeExists(employeeId);

  const targetYear = year ? Number(year) : moment().year();

  const balances = await LeaveBalance.findAll({
    where: {
      employeeId,
      year: targetYear,
    },
    order: [["leaveType", "ASC"]],
  });

  return {
    employeeId: Number(employeeId),
    year: targetYear,
    quotas: LEAVE_QUOTAS,
    balances,
  };
};

export const ensureSufficientBalance = async (
  employeeId,
  leaveType,
  totalDays,
  year,
) => {
  if (!BALANCED_LEAVE_TYPES.includes(leaveType)) {
    return null;
  }

  const targetYear = year || moment().year();
  const balance = await LeaveBalance.findOne({
    where: { employeeId, leaveType, year: targetYear },
  });

  if (!balance) {
    const error = new Error(
      `No ${leaveType} leave balance found for year ${targetYear}`,
    );
    error.statusCode = 400;
    throw error;
  }

  const remaining = Number(balance.remaining);
  const days = Number(totalDays);

  if (days > remaining) {
    const error = new Error(
      `Insufficient ${leaveType} leave balance. Remaining: ${remaining}, requested: ${days}`,
    );
    error.statusCode = 400;
    throw error;
  }

  return balance;
};

export const deductLeaveBalance = async (
  employeeId,
  leaveType,
  totalDays,
  year,
) => {
  if (!BALANCED_LEAVE_TYPES.includes(leaveType)) {
    return null;
  }

  const targetYear = year || moment().year();
  const balance = await ensureSufficientBalance(
    employeeId,
    leaveType,
    totalDays,
    targetYear,
  );

  const days = Number(totalDays);
  const used = Number(balance.used) + days;
  const remaining = Number(balance.allocated) - used;

  await balance.update({
    used,
    remaining: Math.max(0, remaining),
  });

  return balance;
};

/**
 * Backfill balances for employees who joined before this feature existed.
 */
export const allocateMissingBalancesService = async (employeeId) => {
  const employee = await ensureEmployeeExists(employeeId);
  return allocateLeaveBalancesOnJoin(employee.id, employee.dateOfJoining);
};
