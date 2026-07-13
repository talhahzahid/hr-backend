import { Op } from "sequelize";
import Employee from "../models/employee.models.js";
import Attendance from "../models/attendance.model.js";
import LeaveRequest from "../models/leave-request.model.js";
import { resolveMonthYear } from "../utils/date-range.js";

const getTodayDate = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const getDashboardService = async (filters = {}) => {
  const today = getTodayDate();
  const { month, year, startDate, endDate, nextMonthStart } = resolveMonthYear(
    filters.month,
    filters.year,
  );

  const monthDateFilter = {
    [Op.gte]: startDate,
    [Op.lt]: nextMonthStart,
  };

  const leaveMonthFilter = {
    [Op.gte]: startDate,
    [Op.lt]: nextMonthStart,
  };

  const [
    totalEmployees,
    activeEmployees,
    inactiveEmployees,
    todayAttendance,
    monthAttendance,
    pendingLeaves,
    approvedLeavesThisMonth,
    rejectedLeavesThisMonth,
    leavesThisMonth,
    recentPendingLeaves,
  ] = await Promise.all([
    Employee.count(),
    Employee.count({ where: { isActive: true } }),
    Employee.count({ where: { isActive: false } }),
    Attendance.findAll({ where: { date: today } }),
    Attendance.findAll({
      where: { date: monthDateFilter },
    }),
    LeaveRequest.count({ where: { status: "Pending" } }),
    LeaveRequest.count({
      where: {
        status: "Approved",
        startDate: leaveMonthFilter,
      },
    }),
    LeaveRequest.count({
      where: {
        status: "Rejected",
        startDate: leaveMonthFilter,
      },
    }),
    LeaveRequest.findAll({
      where: {
        startDate: leaveMonthFilter,
      },
      attributes: ["leaveType", "status", "totalDays"],
    }),
    LeaveRequest.findAll({
      where: { status: "Pending" },
      order: [["id", "DESC"]],
      limit: 5,
    }),
  ]);

  const presentToday = todayAttendance.filter((a) => a.status === "present").length;
  const lateToday = todayAttendance.filter((a) => a.status === "late").length;
  const halfDayToday = todayAttendance.filter((a) => a.status === "half-day").length;
  const checkedInToday = todayAttendance.length;
  const checkedOutToday = todayAttendance.filter((a) => a.checkOutTime).length;
  const stillWorking = todayAttendance.filter((a) => !a.checkOutTime).length;
  const absentToday = Math.max(activeEmployees - checkedInToday, 0);

  const presentMonth = monthAttendance.filter((a) => a.status === "present").length;
  const lateMonth = monthAttendance.filter((a) => a.status === "late").length;
  const halfDayMonth = monthAttendance.filter((a) => a.status === "half-day").length;
  const checkedOutMonth = monthAttendance.filter((a) => a.checkOutTime).length;

  const leaveByType = {};
  for (const leave of leavesThisMonth) {
    const type = leave.leaveType;
    if (!leaveByType[type]) {
      leaveByType[type] = { count: 0, days: 0 };
    }
    leaveByType[type].count += 1;
    leaveByType[type].days += Number(leave.totalDays) || 0;
  }

  const pendingEmployeeIds = [
    ...new Set(recentPendingLeaves.map((leave) => leave.employeeId)),
  ];

  const pendingEmployees = pendingEmployeeIds.length
    ? await Employee.findAll({
        where: { id: { [Op.in]: pendingEmployeeIds } },
        attributes: [
          "id",
          "firstName",
          "lastName",
          "departmentName",
          "designation",
        ],
      })
    : [];

  const employeeMap = Object.fromEntries(
    pendingEmployees.map((emp) => [emp.id, emp.toJSON()]),
  );

  const recentPending = recentPendingLeaves.map((leave) => {
    const item = leave.toJSON();
    item.employee = employeeMap[leave.employeeId] || null;
    return item;
  });

  return {
    today,
    month,
    year,
    range: { startDate, endDate },
    employees: {
      total: totalEmployees,
      active: activeEmployees,
      inactive: inactiveEmployees,
    },
    attendanceToday: {
      present: presentToday,
      late: lateToday,
      halfDay: halfDayToday,
      checkedIn: checkedInToday,
      checkedOut: checkedOutToday,
      stillWorking,
      absent: absentToday,
    },
    attendanceThisMonth: {
      totalRecords: monthAttendance.length,
      present: presentMonth,
      late: lateMonth,
      halfDay: halfDayMonth,
      checkedOut: checkedOutMonth,
    },
    leaves: {
      pendingApproval: pendingLeaves,
      approvedThisMonth: approvedLeavesThisMonth,
      rejectedThisMonth: rejectedLeavesThisMonth,
      totalThisMonth: leavesThisMonth.length,
      byTypeThisMonth: leaveByType,
    },
    recentPendingLeaves: recentPending,
  };
};
