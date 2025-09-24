const Route = require('../models/routeModel');
const Driver = require('../models/driverModel');
const appError = require('../utils/appError');
const { default: mongoose } = require('mongoose');

// Create a new route
const createRoute = async(req,res,next)=>{
    const {startLocation, endLocation, distance, estimatedTime} = req.body;
    const {requiredType} = req.query;
    const newRoute = new Route({startLocation, endLocation, distance, estimatedTime});
    let availableDriver;

    if(requiredType){
        availableDriver = await Driver.findOne({ availability: true, licenseType: requiredType }).sort({completedRoutesCount: 1});
    }else{
        availableDriver = await Driver.findOne({ availability: true }).sort({completedRoutesCount: 1});
    }   
    
    if (availableDriver) {
        newRoute.assignedDriver = availableDriver._id;
        availableDriver.availability = false;
        availableDriver.currentRoute = newRoute._id;
        await availableDriver.save();
    }else{
        newRoute.status = "unassigned";
    }

    await newRoute.save();
    res.status(201).json({
        status: 'success',
        message: 'Route created successfully',
        data: newRoute
    });
}

// Get all routes
const getAllRoutes = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { startLocation, endLocation, distance, estimatedTime, status } = req.query;

    let filter = {};
    if (startLocation) {
        filter.startLocation = { $regex: startLocation, $options: 'i' };
    }
    if (endLocation) {
        filter.endLocation = { $regex: endLocation, $options: 'i' };
    }
    if (distance) {
        filter.distance = distance;
    }
    if (estimatedTime) {
        filter.estimatedTime = estimatedTime;
    }
    if (status) {
        filter.status = status;
    }

    const routes = (await Route.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-_id -__v'));

    if (routes.length === 0) {
        return next(appError.create("No routes found", 404, "fail"));
    }

    const totalRoutes = await Route.countDocuments(filter);

    const statusOrder = { unassigned: 1, active: 2, completed: 3 };
    routes.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    res.status(200).json({
        status: 'success',
        message: 'Routes fetched successfully',
        results: routes.length,
        data: {
            routes,
            totalPages: Math.ceil(totalRoutes / limit),
            currentPage: page
        }
    });
};

// get route by ID
const getRouteById = async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(appError.create("Invalid MongoDB ID", 400, "fail"));
  }
    const route = await Route.findById(id).select('-_id -__v').populate("assignedDriver", "id name licenseType availability");
    if (!route) {
        return next(appError.create("Route not found", 404, "fail"));
    }
    res.status(200).json({
        status: 'success',
        message: 'Route fetched successfully',
        data: route
    });
}

// update route status
const updateRouteStatus = async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(appError.create("Invalid MongoDB ID", 400, "fail"));
  }
    const route = await Route.findById(id).select('-__v');
    if (!route) {
        return next(appError.create("Route not found", 404, "fail"));
    }
    if(status === "completed" && route.assignedDriver){
        const driver = await Driver.findById(route.assignedDriver);
        if (driver) {
            driver.availability = true; 
            driver.completedRoutesCount += 1; 
            driver.currentRoute = null; 
            driver.history.push(route._id);
            await driver.save();
        }
    }else if(status === "active" && !route.assignedDriver){
        return next(appError.create("Cannot set status to active for unassigned route", 400, "fail"));
    }else if(status === "unassigned" && route.assignedDriver){
        return next(appError.create("Cannot set status to unassigned for assigned route", 400, "fail"));
    }else if(status === "completed" && !route.assignedDriver){
        return next(appError.create("Cannot set status to completed for unassigned route", 400, "fail"));
    }

    route.status = status;
    await route.save();
    res.status(200).json({
        status: 'success',
        message: 'Route status updated successfully',
        data: route
    });
}

// assign driver to unassigned route
const assignDriverToRoute = async (req, res, next) => {
  const { id } = req.params;
  const { requiredType } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(appError.create("Invalid MongoDB ID", 400, "fail"));
  }

  const route = await Route.findById(id).select('-__v');
  if (!route) {
    return next(appError.create("Route not found", 404, "fail"));
  }
  if (route.assignedDriver) {
    return next(appError.create("Route already has an assigned driver", 400, "fail"));
  }

  const driverFilter = { availability: true };
  if (requiredType) driverFilter.licenseType = requiredType;

  const availableDriver = await Driver.findOneAndUpdate(
    driverFilter,
    { $set: { availability: false, currentRoute: route._id } },
    { sort: { completedRoutesCount: 1 }, new: true }
  );

  if (!availableDriver) {
    return next(appError.create("No available drivers found", 404, "fail"));
  }

  route.assignedDriver = availableDriver._id;
  route.status = "active";
  await route.save();

  res.status(200).json({
    status: "success",
    message: "Driver assigned to route successfully",
    data: route
  });
};


// delete route
const deleteRoute = async (req, res, next) => { 
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(appError.create("Invalid MongoDB ID", 400, "fail"));
    }
    
    const route = await Route.findById(id);

    if (!route) {
        return next(appError.create("Route not found", 404, "fail"));
    }

    if (route.assignedDriver ) {
        const driver = await Driver.findById(route.assignedDriver);
        if (driver) {
            driver.availability = true;
            driver.currentRoute = null;
            driver.history = driver.history.filter(rId => rId.toString() !== route._id.toString());
            await driver.save();
        }
    }
    const driver = await Driver.findById(route.assignedDriver);
    if (driver) {
        
    }
    await Route.findByIdAndDelete(id);

    res.status(200).json({
        status: 'success',
        message: 'Route deleted successfully'
    });
}

// Export controller functions
module.exports = {
    createRoute,
    getAllRoutes,
    getRouteById,
    updateRouteStatus,
    assignDriverToRoute,
    deleteRoute
};