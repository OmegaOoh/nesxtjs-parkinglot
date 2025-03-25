import { Vehicle } from "./Vehicle";

export class Slot {
  private isOccupied: boolean = false;
  private lot_number: number;
  private size: number;
  
  public constructor(size: number, lot_number: number) {
    this.size = size;
    this.lot_number = lot_number
  }
  
  public canPark(vehicle: Vehicle) {
    return vehicle.canFit(this) && !this.isOccupied
  }
  
  public park(vehicle: Vehicle) {
    if (this.canPark(vehicle)){
      this.isOccupied = true;
      return true;
    }
    return false;
  }
  
  public getSize(): number {
    return this.size;
  }
  
  public leave() {
    this.isOccupied = false
  }
}