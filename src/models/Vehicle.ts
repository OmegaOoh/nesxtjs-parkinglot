import { ParkingLot } from "./ParkingLot";
import { ParkingSlot } from "./ParkingSlot";
import mongoose from 'mongoose';

export abstract class Vehicle {
  readonly sizeClass: number = Infinity;
  private licensePlate: string;
  
  public constructor(plate: string) {
    this.licensePlate = plate;
  }
  
  public canFit(slot: ParkingSlot): boolean {
    return slot.getSize() >= this.sizeClass
  }
  
  public park(lot: ParkingLot): ParkingSlot | undefined{
    /* 
    Find and spot and park in ParkingLot,
    Return true if there is a spot to park else return false
    */
    const slot = lot.park(this);
    if (slot == undefined) return undefined;
    return slot
  }
  
  public repr(): string {
    throw new Error("Method not implemented")
  }
  
  public get_plate() {return this.licensePlate}
}

export class Motorcycle extends Vehicle {
  readonly sizeClass = 0;

  public repr(): string {
    return "Motorcycle"
  }  
}

export class Car extends Vehicle {
  readonly sizeClass = 1;
  
  repr(): string {
    return "Car"
  }  
}

export class Bus extends Vehicle {
  readonly sizeClass = 2;
  
  repr(): string {
    return "Bus"
  }  
}

const VehicleSchema = new mongoose.Schema({
  licensePlate: { 
    type: String, 
    required: true,
    unique: true,
    
  },
  vehicleType: { 
    type: String, 
    required: true,
    enum: ['Motorcycle', 'Car', 'Bus']
  }
});

export const VehicleDBO = mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);
