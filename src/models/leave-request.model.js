import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const LeaveRequest = sequelize.define(
  "LeaveRequest",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Employee is required",
        },
        notEmpty: {
          msg: "Employee is required",
        },
      },
    },

    leaveType: {
      type: DataTypes.ENUM(
        "Annual",
        "Sick",
        "Casual",
        "Maternity",
        "Paternity",
        "Bereavement",
        "Unpaid",
        "Compensatory",
        "Other",
      ),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Leave type is required",
        },
        notEmpty: {
          msg: "Leave type is required",
        },
      },
    },

    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Start date is required",
        },
        isDate: {
          msg: "Start date must be a valid date",
        },
      },
    },

    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: {
          msg: "End date is required",
        },
        isDate: {
          msg: "End date must be a valid date",
        },
      },
    },

    totalDays: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: false,
      validate: {
        notNull: {
          msg: "Total days is required",
        },
        min: 0.5,
      },
    },

    session: {
      type: DataTypes.ENUM("Full Day", "First Half", "Second Half"),
      allowNull: false,
      defaultValue: "Full Day",
    },

    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Reason is required",
        },
        notEmpty: {
          msg: "Reason is required",
        },
      },
    },

    status: {
      type: DataTypes.ENUM("Pending", "Approved", "Rejected", "Cancelled"),
      allowNull: false,
      defaultValue: "Pending",
    },

    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "leave_requests",
    timestamps: true,
    underscored: true,
  },
);

export default LeaveRequest;
