const { userModel, gigModel } = require("../../models");

const complaintModel = require("../../models/complaint.model");
const { catchAsync } = require("../../utils");

const getDashboardStats = catchAsync(async (req, res) => {
  const [totalUsers, totalGigs, totalComplaints] = await Promise.all([
    userModel.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    gigModel.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    complaintModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const usersByMonth = await userModel.aggregate([
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const gigsByMonth = await gigModel.aggregate([
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const complaintsByMonth = await complaintModel.aggregate([
    {
      $group: {
        _id: { $month: "$createdAt" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    error: false,
    message: "Dashboard statistics",
    data: {
      users: totalUsers,
      gigs: totalGigs,
      complaints: totalComplaints,
      usersByMonth,
      gigsByMonth,
      complaintsByMonth,
    },
  });
});

module.exports = {
  getDashboardStats,
};
