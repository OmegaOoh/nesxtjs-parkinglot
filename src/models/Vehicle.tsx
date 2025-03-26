import { ParkingLot } from "./ParkingLot";
import { Slot } from "./ParkingSlot";

export abstract class Vehicle {
  readonly sizeClass: number = Infinity;
  private parkedSlot: Slot | undefined;
  
  public canFit(slot: Slot): boolean {
    return slot.getSize() >= this.sizeClass
  }
  
  public park(lot: ParkingLot): boolean {
    /* 
    Find and spot and park in ParkingLot,
    Return true if there is a spot to park else return false
    */
    const slot = lot.park(this);
    if (slot == undefined) return false;
    this.parkedSlot = slot;
    return true
  }
  
  public leave(): void {
    this.parkedSlot?.leave()
  }
  
  public getParkedSlot() {
    return this.parkedSlot
  }
  
  public repr(): string {
    throw new Error("Method not implemented")
  }
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
