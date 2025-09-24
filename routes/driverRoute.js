const router = require('express').Router();
const { createDriver, getAllDrivers, getDriverById, updateDriverAvailability, deleteDriver, getDriverHistory, searchDrivers } = require('../controllers/driverController');
const { asyncWrapper } = require('../middlewares/asyncWrapper');
const { validator } = require('../middlewares/validation');
const { driverValidation, updateAvailabilityValidation, searchDriversValidation } = require('../middlewares/validationArrays');


router.route('/')
    .post(driverValidation, validator, asyncWrapper(createDriver))
    .get(asyncWrapper(getAllDrivers));

    router.get('/search', searchDriversValidation, validator, asyncWrapper(searchDrivers));

router.route('/:id')
    .get(asyncWrapper(getDriverById))
    .delete(asyncWrapper(deleteDriver));

router.get('/:id/history', asyncWrapper(getDriverHistory));

    router.route('/:id/availability')
    .patch(updateAvailabilityValidation, validator, asyncWrapper(updateDriverAvailability));
    
module.exports = router;