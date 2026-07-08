import {
  approveLeaveRequestService,
  cancelLeaveRequestService,
  createLeaveRequestService,
  getEmployeeLeavesService,
  getLeaveRequestService,
  rejectLeaveRequestService,
} from "../service/leave-request.service.js";

const handleError = (res, error) => {
  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: error.message,
  });
};

export const createLeaveRequest = async (req, res) => {
  console.log(req?.body);
  try {
    const leaveRequest = await createLeaveRequestService(req.body);

    return res.status(201).json({
      success: true,
      message: "Leave request created successfully",
      data: leaveRequest,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getEmployeeLeaves = async (req, res) => {
  const { employeeId } = req.params;
  const { page = 1, limit = 10, status } = req.query;

  try {
    const leaves = await getEmployeeLeavesService(
      employeeId,
      page,
      limit,
      status,
    );

    return res.status(200).json({
      success: true,
      message: "Employee leave requests fetched successfully",
      data: leaves,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getLeaveRequest = async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10, employeeId, status } = req.query;

  try {
    const leaveRequest = await getLeaveRequestService(id, page, limit, {
      employeeId,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "Leave request fetched successfully",
      data: leaveRequest,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const approveLeaveRequest = async (req, res) => {
  const { id } = req.params;
  const { approvedBy } = req.body;

  try {
    const leaveRequest = await approveLeaveRequestService(id, approvedBy);

    return res.status(200).json({
      success: true,
      message: "Leave request approved successfully",
      data: leaveRequest,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const rejectLeaveRequest = async (req, res) => {
  const { id } = req.params;
  const { approvedBy, rejectionReason } = req.body;

  try {
    const leaveRequest = await rejectLeaveRequestService(
      id,
      approvedBy,
      rejectionReason,
    );

    return res.status(200).json({
      success: true,
      message: "Leave request rejected successfully",
      data: leaveRequest,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const cancelLeaveRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const leaveRequest = await cancelLeaveRequestService(id);

    return res.status(200).json({
      success: true,
      message: "Leave request cancelled successfully",
      data: leaveRequest,
    });
  } catch (error) {
    return handleError(res, error);
  }
};
