import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Employee from "../models/employee.models.js";

const JWT_SECRET = process.env.JWT_SECRET || "hr_backend_secret_key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export const loginService = async (email, password) => {
  try {
    const employee = await Employee.findOne({ where: { email } });

    if (!employee) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    if (!employee.isActive) {
      const error = new Error("Your account is inactive. Contact HR");
      error.statusCode = 403;
      throw error;
    }

    const isPasswordHashed = employee.password.startsWith("$2");
    const isPasswordValid = isPasswordHashed
      ? await bcrypt.compare(password, employee.password)
      : password === employee.password;

    if (!isPasswordValid) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    if (!isPasswordHashed) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await employee.update({ password: hashedPassword });
    }

    const token = jwt.sign(
      {
        id: employee.id,
        email: employee.email,
        roleName: employee.roleName,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    const employeeData = employee.toJSON();
    delete employeeData.password;

    return {
      token,
      employee: employeeData,
    };
  } catch (error) {
    throw error;
  }
};

export const getProfileService = async (employeeId) => {
  try {
    const employee = await Employee.findByPk(employeeId, {
      attributes: { exclude: ["password"] },
    });

    if (!employee) {
      const error = new Error("Employee not found");
      error.statusCode = 404;
      throw error;
    }

    return employee;
  } catch (error) {
    throw error;
  }
};
