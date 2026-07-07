import Employee from "../models/employee.models.js";

export const createEmployeeService = async (data) => {
  try {
    const employee = await Employee.create(data);
    return employee;
  } catch (error) {
    throw error;
  }
};

export const getEmployeeService = async (id, page, limit) => {
  try {
    if (id) {
      return await Employee.findByPk(id);
    }
    const pageNumber = Number(page);
    const pageSize = Number(limit);
    const offset = (pageNumber - 1) * pageSize;
    const { count, rows } = await Employee.findAndCountAll({
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
