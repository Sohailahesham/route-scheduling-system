const { validationResult } = require("express-validator");
const appError = require("../utils/appError");

const validator = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(appError.create(errors.array(), 400, "fail"));
  }
  next();
};

module.exports = { validator };
