import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Attendance = sequelize.define(
  "Attendance",
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
          msg: "Employee ID is required",
        },
      },
    },

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Date is required",
        },
      },
    },

    checkInTime: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Check-in time is required",
        },
      },
    },

    checkOutTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("present", "late", "half-day"),
      allowNull: false,
      defaultValue: "present",
    },

    workingHours: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  },
  {
    tableName: "attendance",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["employeeId", "date"],
      },
    ],
  },
);

// Association
Attendance.associate = (models) => {
  Attendance.belongsTo(models.Employee, {
    foreignKey: "employeeId",
    as: "employee",
  });
};

export default Attendance;
