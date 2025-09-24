const { getSchedule } = require('../controllers/scheduleController');
const { asyncWrapper } = require('../middlewares/asyncWrapper');

const router = require('express').Router();

router.get('/', asyncWrapper(getSchedule));

module.exports = router;