import { Vehicle } from "./Vehicle";
import mongoose from 'mongoose';

export class ParkingSlot {
  private lot_number: number;
  private size: number;
  private parkedVechicle: Vehicle | undefined;
  
  public constructor(size: number, lot_number: number) {
    this.size = size;
    this.lot_number = lot_number
  }
  
  public canPark(vehicle: Vehicle) {
    return vehicle.canFit(this) && !this.parkedVechicle
  }
  
  public park(vehicle: Vehicle) {
    if (this.canPark(vehicle)){
      this.parkedVechicle = vehicle
      return true;
    }
    return false;
  }
  
  public getSize(): number {
    return this.size;
  }
  
  public leave() {
    this.parkedVechicle = undefined;
  }
  
  public getLotNumber(): number {
    return this.lot_number
  }
  
  public getVehicle() {
    return this.parkedVechicle;
  }
}

const ParkingSlotSchema = new mongoose.Schema({
  SlotNumber: {type: Number, required: true},
  Size: {type: Number, required: true},
  ParkedVehicle: {type: mongoose.Schema.ObjectId, ref: "Vehicle"}
});

export const ParkingSlotDBO = mongoose.model.ParkingSlot || mongoose.model("ParkingSlot", ParkingSlotSchema)