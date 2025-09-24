const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const driverRouter = require('./routes/driverRoute');
const routeRouter = require('./routes/routeRoute');
const scheduleRouter = require('./routes/scheduleRoute');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const port = process.env.PORT || 3000;

app.use('/api/drivers', driverRouter);
app.use('/api/routes', routeRouter);
app.use('/api/schedule', scheduleRouter);

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    status: err.statusText || "error",
    message: err.message || "Internal Server Error",
    code: err.statusCode || 500,
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});