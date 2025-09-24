const router = require('express').Router();
const { createRoute, getAllRoutes, getRouteById, updateRouteStatus, assignDriverToRoute, deleteRoute} = require('../controllers/routesController');
const { asyncWrapper } = require('../middlewares/asyncWrapper');
const { validator } = require('../middlewares/validation');
const { routesValidation, updateRouteStatusValidation } = require('../middlewares/validationArrays');

router.route('/')
    .post(routesValidation, validator , asyncWrapper(createRoute))
    .get(asyncWrapper(getAllRoutes));

router.route('/:id')
    .get(asyncWrapper(getRouteById))
    .delete(asyncWrapper(deleteRoute));

router.route('/:id/status')
    .patch(updateRouteStatusValidation, validator, asyncWrapper(updateRouteStatus));

router.route('/:id/assign-driver')
    .patch(asyncWrapper(assignDriverToRoute));

module.exports = router;