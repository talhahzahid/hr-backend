import { Op } from "sequelize";
import Attendance from "../models/attendance.model.js";
import Employee from "../models/employee.models.js";
import { getMonthRange } from "../utils/date-range.js";

const getTodayDate = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const checkInService = async (employeeId) => {
  try {
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      const error = new Error("Employee not found");
      error.statusCode = 404;
      throw error;
    }

    const today = getTodayDate();
    const now = new Date();

    const existing = await Attendance.findOne({
      where: { employeeId, date: today },
    });

    if (existing) {
      const error = new Error("Employee has already checked in today");
      error.statusCode = 400;
      throw error;
    }

    const officeStart = new Date(`${today}T09:00:00`);
    const graceLimit = new Date(officeStart.getTime() + 15 * 60 * 1000);
    const status = now > graceLimit ? "late" : "present";

    const attendance = await Attendance.create({
      employeeId,
      date: today,
      checkInTime: now,
      checkOutTime: null,
      status,
      workingHours: null,
    });

    return attendance;
  } catch (error) {
    throw error;
  }
};

export const checkOutService = async (employeeId) => {
  try {
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      const error = new Error("Employee not found");
      error.statusCode = 404;
      throw error;
    }

    const today = getTodayDate();

    const attendance = await Attendance.findOne({
      where: { employeeId, date: today },
    });

    if (!attendance) {
      const error = new Error(
        "No check-in found for today. Please check in first",
      );
      error.statusCode = 400;
      throw error;
    }

    if (attendance.checkOutTime) {
      const error = new Error("Employee has already checked out today");
      error.statusCode = 400;
      throw error;
    }

    const outTime = new Date();

    if (outTime <= new Date(attendance.checkInTime)) {
      const error = new Error("Check-out time must be after check-in time");
      error.statusCode = 400;
      throw error;
    }

    const diffMs = outTime - new Date(attendance.checkInTime);
    const workingHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));

    await attendance.update({
      checkOutTime: outTime,
      workingHours,
    });

    await attendance.reload();

    return attendance;
  } catch (error) {
    throw error;
  }
};

export const getAttendanceService = async (id, page, limit, filters = {}) => {
  try {
    if (id) {
      const attendance = await Attendance.findByPk(id);
      if (!attendance) {
        const error = new Error("Attendance not found");
        error.statusCode = 404;
        throw error;
      }
      return attendance;
    }

    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 10;
    const offset = (pageNumber - 1) * pageSize;
    const where = {};

    if (filters.employeeId) where.employeeId = Number(filters.employeeId);
    if (filters.status) where.status = filters.status;

    const hasMonth =
      filters.month !== undefined &&
      filters.month !== null &&
      filters.month !== "";
    const hasYear =
      filters.year !== undefined &&
      filters.year !== null &&
      filters.year !== "";

    let resolvedMonth = null;
    let resolvedYear = null;
    let range = null;

    if (hasMonth || hasYear) {
      const now = new Date();
      const month = hasMonth ? Number(filters.month) : now.getMonth() + 1;
      const year = hasYear ? Number(filters.year) : now.getFullYear();
      const monthRange = getMonthRange(month, year);

      where.date = {
        [Op.gte]: monthRange.startDate,
        [Op.lt]: monthRange.nextMonthStart,
      };

      resolvedMonth = monthRange.month;
      resolvedYear = monthRange.year;
      range = {
        startDate: monthRange.startDate,
        endDate: monthRange.endDate,
      };
    } else if (filters.date) {
      where.date = filters.date;
    }

    const { count, rows } = await Attendance.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [
        ["date", "DESC"],
        ["id", "DESC"],
      ],
    });

    return {
      attendances: rows,
      totalRecords: count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: pageNumber,
      pageSize,
      filters: {
        employeeId: filters.employeeId || null,
        status: filters.status || null,
        month: resolvedMonth,
        year: resolvedYear,
        date: filters.date || null,
        range,
      },
    };
  } catch (error) {
    throw error;
  }
};
