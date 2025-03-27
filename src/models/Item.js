// Database object
import mongoose from 'mongoose';

const VehicleSchema = new mongoose.Schema({
  licensePlate: { 
    type: String, 
    required: true,
    unique: true
  },
  vehicleType: { 
    type: String, 
    required: true,
    enum: ['Motorcycle', 'Car', 'Bus']
  },
  level: {
    type: Number,
    required: true
  },
  slotNumber: {
    type: Number,
    required: true
  }
});

export default mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);