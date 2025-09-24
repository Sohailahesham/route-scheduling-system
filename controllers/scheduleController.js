const Route = require('../models/routeModel');
const Driver = require('../models/driverModel');
const appError = require('../utils/appError');

// get schedule
const getSchedule = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalRoutes = await Route.countDocuments();

  const routes = await Route.find()
      .sort({ createdAt: -1 })
      .populate("assignedDriver", "id name licenseType availability")
      .skip(skip)
      .limit(limit);

    if (routes.length === 0) {
      return next(appError.create("No routes found", 404, "fail"));
    }

    const schedule = routes.map(route => {
      let status = "unassigned";
      if (route.assignedDriver) {
        status = route.status === "completed" ? "completed" : "active";
      }

      return {
        routeId: route._id,
        startLocation: route.startLocation,
        endLocation: route.endLocation,
        estimatedTime: route.estimatedTime,
        status,
        driver: route.assignedDriver
          ? {
              id: route.assignedDriver.id,
              name: route.assignedDriver.name,
              licenseType: route.assignedDriver.licenseType,
            }
          : null
      };
    });

    const statusOrder = { unassigned: 1, active: 2, completed: 3 };
    schedule.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    res.status(200).json({
      status: "success",
      message: "Schedule fetched successfully",
      results: schedule.length,
      data: {
        page,
        totalPages: Math.ceil(totalRoutes / limit),
        schedule
      }
    });
}

module.exports = {
    getSchedule
};