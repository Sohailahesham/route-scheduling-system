const { default: mongoose } = require('mongoose');
const Driver = require('../models/driverModel');
const appError = require('../utils/appError');

// Create a new driver
const createDriver = async(req, res, next)=>{
    const { id, name, licenseType, availability } = req.body;
    const existingDriverId = await Driver.findOne({ id });
    if (existingDriverId) {
        return next(appError.create("Driver with this ID already exists", 400, "fail"));
    }
    const existingDriverName = await Driver.findOne({ name });
    if (existingDriverName) {
        return next(appError.create("Driver with this name already exists", 400, "fail"));
    }
  const newDriver = new Driver({ id, name, licenseType, availability });
    await newDriver.save();
    res.status(201).json({
        status: 'success',
        message: 'Driver created successfully',
        data: newDriver
    });
}

// Get all drivers
const getAllDrivers = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const {availability, licenseType} = req.query;
    let filter = {};

    if (availability) {
      filter.availability = availability === 'true';
    }

    if (licenseType) {
      filter.licenseType = licenseType;
    }

    const totalDrivers = await Driver.countDocuments(filter);
    const drivers = await Driver.find(filter).skip(skip).limit(limit).sort({ availability: -1, name: 1 }).select('-_id -__v');

    if (drivers.length === 0) {
      return next(appError.create("No drivers found", 404, "fail"));
    }

    res.status(200).json({
      status: 'success',
      message: 'Drivers fetched successfully',
      results: drivers.length,
      data: {
        drivers,
        totalPages: Math.ceil(totalDrivers / limit),
        currentPage: page
      }
    });

};

// Get driver by ID
const getDriverById = async (req, res, next) => {
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
      return next(appError.create("Invalid driver ID", 400, "fail"));
    }

    const driver = await Driver.findById(id).select('-_id -__v');
    
    if (!driver) {
      return next(appError.create("Driver not found", 404, "fail"));
    }

    res.status(200).json({
      status: 'success',
      message: 'Driver fetched successfully',
      data: driver
    });
};

// get driver's history
const getDriverHistory = async (req, res, next) => {
  const { id } = req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
      return next(appError.create("Invalid driver ID", 400, "fail"));
    }

  const driver = await Driver.findById(id).select('-_id -__v').populate("history", "startLocation endLocation distance estimatedTime status");

  if (!driver) {
    return next(appError.create("Driver not found", 404, "fail"));
  }

  if (driver.history.length === 0) {
    return next(appError.create("No history found for this driver", 404, "fail"));
  }

  res.status(200).json({
    status: 'success',
    message: 'Driver history fetched successfully',
    data: driver.history
  });
}

// search drivers by name or ID
const searchDrivers = async (req, res, next) => {
  const { search } = req.query;

  if (!search) {
    return next(appError.create("Search parameter is required", 400, "fail"));
  }

  const drivers = await Driver.find({
    $or: [
      { name: { $regex: search, $options: 'i' } },
      { id: search }
    ]
  }).select('-_id -__v');

  if (!drivers || drivers.length === 0) {
    return next(appError.create("No drivers found", 404, "fail"));
  }

  res.status(200).json({
    status: 'success',
    message: 'Drivers fetched successfully',
    results: drivers.length,
    data: drivers
  });
}

// Update driver availability
const updateDriverAvailability = async (req, res, next) => {
  const { id } = req.params;
  let { availability } = req.body;

  if(!mongoose.Types.ObjectId.isValid(id)){
      return next(appError.create("Invalid driver ID", 400, "fail"));
    }

  const driver = await Driver.findById(id).select('-_id -__v');
  if (!driver) {
    return next(appError.create("Driver not found", 404, "fail"));
  }

  if (driver.currentRoute && availability === true) {
    return next(appError.create("Driver is currently assigned to a route and cannot be marked as available", 400, "fail"));
  }
    driver.availability = availability;

  await driver.save();
  res.status(200).json({
    status: 'success',
    message: 'Driver availability updated successfully',
    data: driver
  });
}

// Delete driver
const deleteDriver = async (req, res, next) => {
  const { id } = req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
      return next(appError.create("Invalid driver ID", 400, "fail"));
    }

  const driver = await Driver.findById(id);

  if (!driver) {
    return next(appError.create("Driver not found", 404, "fail"));
  }
  if (driver.currentRoute) {
    return next(appError.create("Driver is currently assigned to a route and cannot be deleted", 400, "fail"));
  }
  await Driver.findByIdAndDelete(id);
  res.status(200).json({
    status: 'success',
    message: 'Driver deleted successfully',
  });
}

module.exports = {
    createDriver,
    getAllDrivers,
    getDriverById,
    getDriverHistory,
    searchDrivers,
    updateDriverAvailability,
    deleteDriver
};
