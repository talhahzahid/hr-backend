import { ValidationError } from "sequelize";
import Employee from "../models/employee.models.js";
import LeaveRequest from "../models/leave-request.model.js";

const ensureEmployeeExists = async (employeeId) => {
  const employee = await Employee.findByPk(employeeId);
  if (!employee) {
    const error = new Error("Employee not found");
    error.statusCode = 404;
    throw error;
  }
};

const findLeaveRequestOrThrow = async (id) => {
  const leaveRequest = await LeaveRequest.findByPk(id);
  if (!leaveRequest) {
    const error = new Error("Leave request not found");
    error.statusCode = 404;
    throw error;
  }
  return leaveRequest;
};

const ensurePendingStatus = (leaveRequest) => {
  if (leaveRequest.status !== "Pending") {
    const error = new Error("Only pending leave requests can be updated");
    error.statusCode = 400;
    throw error;
  }
};

export const createLeaveRequestService = async (data) => {
  console.log(data , 'data')
  try {
    await ensureEmployeeExists(data?.employeeId);
// return
    const leaveRequest = await LeaveRequest.create({
      employeeId: data.employeeId,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      totalDays: data.totalDays,
      session: data.session || "Full Day",
      reason: data.reason,
      status: "Pending",
    });

    return leaveRequest;
  } catch (error) {
    if (error instanceof ValidationError) {
      const message = error.errors.map((item) => item.message).join(", ");
      const validationError = new Error(message);
      validationError.statusCode = 400;
      throw validationError;
    }
    throw error;
  }
};

export const getLeaveRequestService = async (id, page, limit, filters = {}) => {
  try {
    if (id) {
      return await findLeaveRequestOrThrow(id);
    }

    const pageNumber = Number(page);
    const pageSize = Number(limit);
    const offset = (pageNumber - 1) * pageSize;
    const where = {};

    if (filters.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const { count, rows } = await LeaveRequest.findAndCountAll({
      where,
      limit: pageSize,
      offset,
      order: [["id", "DESC"]],
    });

    return {
      leaveRequests: rows,
      totalRecords: count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: pageNumber,
      pageSize,
    };
  } catch (error) {
    throw error;
  }
};

export const approveLeaveRequestService = async (id, approvedBy) => {
  try {
    await ensureEmployeeExists(approvedBy);

    const leaveRequest = await findLeaveRequestOrThrow(id);
    ensurePendingStatus(leaveRequest);

    await leaveRequest.update({
      status: "Approved",
      approvedBy,
      rejectionReason: null,
    });

    return leaveRequest;
  } catch (error) {
    throw error;
  }
};

export const rejectLeaveRequestService = async (id, approvedBy, rejectionReason) => {
  try {
    await ensureEmployeeExists(approvedBy);

    const leaveRequest = await findLeaveRequestOrThrow(id);
    ensurePendingStatus(leaveRequest);

    await leaveRequest.update({
      status: "Rejected",
      approvedBy,
      rejectionReason,
    });

    return leaveRequest;
  } catch (error) {
    throw error;
  }
};

export const cancelLeaveRequestService = async (id) => {
  try {
    const leaveRequest = await findLeaveRequestOrThrow(id);
    ensurePendingStatus(leaveRequest);

    await leaveRequest.update({
      status: "Cancelled",
    });

    return leaveRequest;
  } catch (error) {
    throw error;
  }
};
