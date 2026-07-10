import {
  allocateMissingBalancesService,
  getLeaveBalancesService,
} from "../service/leave-balance.service.js";

const handleError = (res, error) => {
  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: error.message,
  });
};

export const getLeaveBalances = async (req, res) => {
  const { employeeId } = req.params;
  const { year } = req.query;

  try {
    const data = await getLeaveBalancesService(employeeId, year);

    return res.status(200).json({
      success: true,
      message: "Leave balances fetched successfully",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const allocateLeaveBalances = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const balances = await allocateMissingBalancesService(employeeId);

    return res.status(201).json({
      success: true,
      message: "Leave balances allocated successfully",
      data: balances,
    });
  } catch (error) {
    return handleError(res, error);
  }
};
