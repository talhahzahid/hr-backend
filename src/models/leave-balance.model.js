import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import Employee from "./employee.models.js";

const LeaveBalance = sequelize.define(
  "LeaveBalance",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "employee",
        key: "id",
      },
      validate: {
        notNull: {
          msg: "Employee is required",
        },
      },
    },

    leaveType: {
      type: DataTypes.ENUM("Annual", "Sick", "Casual"),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Leave type is required",
        },
      },
    },

    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Year is required",
        },
        min: 2000,
      },
    },

    allocated: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },

    used: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },

    remaining: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
  },
  {
    tableName: "leave_balances",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["employee_id", "leave_type", "year"],
      },
    ],
  },
);

LeaveBalance.belongsTo(Employee, {
  foreignKey: "employeeId",
  as: "employee",
});

export default LeaveBalance;
