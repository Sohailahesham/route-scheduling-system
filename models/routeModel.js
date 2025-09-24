const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema({
  startLocation: { type: String, required: true },
  endLocation: { type: String, required: true },
  distance: { type: Number, required: true },
  estimatedTime: { type: String, required: true },
  assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver", default: null },
  status: { 
    type: String, 
    enum: ["active", "unassigned", "completed"], 
    default: "active" 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Route", routeSchema);
