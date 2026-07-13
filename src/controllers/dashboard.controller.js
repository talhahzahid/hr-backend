import { getDashboardService } from "../service/dashboard.service.js";

export const getDashboard = async (req, res) => {
  try {
    const { month, year } = req.query;
    const data = await getDashboardService({ month, year });

    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};
