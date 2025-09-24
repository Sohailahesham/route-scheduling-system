const asyncWrapper = (assyncFn) => {
  return (req, res, next) => {
    assyncFn(req, res, next).catch((err) => {
      console.log(err);
      next(err);
    });
  };
};

module.exports = { asyncWrapper };
