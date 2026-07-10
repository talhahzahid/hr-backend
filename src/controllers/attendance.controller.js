import {
  checkInService,
  checkOutService,
  getAttendanceService,
} from "../service/attendance.service.js";

export const checkIn = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const attendance = await checkInService(employeeId);

    return res.status(201).json({
      success: true,
      message: `Check-in successful (${attendance.status})`,
      data: attendance,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const checkOut = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkOutTime } = req.body;
    const attendance = await checkOutService(id, checkOutTime);
    console.log(attendance);
    return res.status(200).json({
      success: true,
      message: "Check-out recorded successfully",
      data: attendance,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAttendance = async (req, res) => {
  const { id } = req.params;
  const {
    page = 1,
    limit = 10,
    employeeId,
    status,
    date,
    month,
    year,
  } = req.query;

  try {
    const attendance = await getAttendanceService(id, page, limit, {
      employeeId,
      status,
      date,
      month,
      year,
    });
    console.log(attendance);
    // return
    return res.status(200).json({
      success: true,
      message: "Attendance fetched successfully",
      data: attendance,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};
