import { ParkingLot } from "./ParkingLot";
import { Slot } from "./ParkingSlot";

export abstract class Vehicle {
  readonly sizeClass: number = Infinity;
  private licensePlate: string;
  
  public constructor(plate: string) {
    this.licensePlate = plate;
  }
  
  public canFit(slot: Slot): boolean {
    return slot.getSize() >= this.sizeClass
  }
  
  public park(lot: ParkingLot): Slot | undefined{
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
