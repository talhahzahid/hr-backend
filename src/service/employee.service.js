import bcrypt from "bcryptjs";
import Employee from "../models/employee.models.js";
import { allocateLeaveBalancesOnJoin } from "./leave-balance.service.js";

export const createEmployeeService = async (data) => {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const employee = await Employee.create({
      ...data,
      password: hashedPassword,
    });

    const leaveBalances = await allocateLeaveBalancesOnJoin(
      employee.id,
      employee.dateOfJoining,
    );

    const employeeData = employee.toJSON();
    delete employeeData.password;
    employeeData.leaveBalances = leaveBalances;

    return employeeData;
  } catch (error) {
    throw error;
  }
};

export const getEmployeeService = async (id, page, limit) => {
  try {
    if (id) {
      return await Employee.findByPk(id, {
        attributes: { exclude: ["password"] },
      });
    }

    const pageNumber = Number(page);
    const pageSize = Number(limit);
    const offset = (pageNumber - 1) * pageSize;
    const { count, rows } = await Employee.findAndCountAll({
      attributes: { exclude: ["password"] },
      limit: pageSize,
      offset,
      order: [["id", "DESC"]],
    });

    return {
      employees: rows,
      totalRecords: count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: pageNumber,
      pageSize,
    };
  } catch (error) {
    throw error;
  }
};
