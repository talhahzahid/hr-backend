import { Op } from "sequelize";
import Attendance from "../models/attendance.model.js";
import Employee from "../models/employee.models.js";

const getTodayDate = () => new Date().toISOString().split("T")[0];

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

    const pageNumber = Number(page);
    const pageSize = Number(limit);
    const offset = (pageNumber - 1) * pageSize;
    const where = {};

    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.status) where.status = filters.status;

    if (filters.month && filters.year) {
      const month = String(filters.month).padStart(2, "0");
      const year = filters.year;
      const startDate = `${year}-${month}-01`;
      const lastDay = new Date(year, filters.month, 0).getDate();
      const endDate = `${year}-${month}-${lastDay}`;

      where.date = {
        [Op.between]: [startDate, endDate],
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
        month: filters.month || null,
        year: filters.year || null,
        date: filters.date || null,
      },
    };
  } catch (error) {
    throw error;
  }
};
