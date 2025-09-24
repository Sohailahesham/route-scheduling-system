const { body, query } = require("express-validator");

const driverValidation = [
    body("id")
        .isString()
        .withMessage("ID must be a string")
        .notEmpty()
        .withMessage("ID is required"),
    body("name")
        .isString()
        .withMessage("Name must be a string")
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 3 })
        .withMessage("Name must be at least 3 characters long"),
    body("licenseType")
        .isString()
        .withMessage("License type must be a string")
        .notEmpty()
        .withMessage("License type is required")
        .isIn(["A", "B", "C"])
        .withMessage("Invalid license type"),
    body("availability")
        .optional()
        .isBoolean()
        .withMessage("Availability must be a boolean")
        .toBoolean()
];

const searchDriversValidation = [
    query("search")
        .isString()
        .withMessage("Search must be a string")
        .notEmpty()
        .withMessage("Search is required")
]

const updateAvailabilityValidation = [
    body("availability")
        .isBoolean()
        .withMessage("Availability must be a boolean")
        .toBoolean()
        .notEmpty()
        .withMessage("Availability is required")
];

const routesValidation = [
    body("startLocation")
        .isString()
        .withMessage("Start location must be a string")
        .notEmpty()
        .withMessage("Start location is required"),
    body("endLocation")
        .isString()
        .withMessage("End location must be a string")
        .notEmpty()
        .withMessage("End location is required"),
    body("distance")
        .isNumeric()
        .withMessage("Distance must be a number")
        .notEmpty()
        .withMessage("Distance is required")
        .custom((value) => value > 0)
        .withMessage("Distance must be greater than 0"),
    body("estimatedTime")
        .isString()
        .withMessage("Estimated time must be a string")
        .notEmpty()
        .withMessage("Estimated time is required")
];

const updateRouteStatusValidation = [
    body("status")
        .isString()
        .withMessage("Status must be a string")
        .isIn(["active", "unassigned", "completed"])
        .withMessage("Invalid status")
        .notEmpty()
        .withMessage("Status is required")
]

module.exports = { driverValidation, updateAvailabilityValidation, routesValidation, updateRouteStatusValidation, searchDriversValidation };