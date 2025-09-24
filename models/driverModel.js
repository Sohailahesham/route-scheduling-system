const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  licenseType: { type: String, required: true },
  availability: { type: Boolean, default: true },
  history: [{ type: mongoose.Schema.Types.ObjectId, ref: "Route" }],
  currentRoute: { type: mongoose.Schema.Types.ObjectId, ref: "Route" },
  completedRoutesCount: { type: Number, default: 0 }
});

module.exports = mongoose.model("Driver", driverSchema);
