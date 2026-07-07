import {
  createEmployeeService,
  getEmployeeService,
} from "../service/employee.service.js";

export const createEmployee = async (req, res) => {
  try {
    const employee = await createEmployeeService(req.body);

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getEmployee = async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  try {
    const employee = await getEmployeeService(id, page, limit);
    return res.status(200).json({
      success: true,
      message: "Employee fetched successfully",
      data: employee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
