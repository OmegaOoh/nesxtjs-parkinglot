import { spotSize } from "./enum";
import { Slot } from "./ParkingSlot"
import { Vehicle } from "./Vehicle";

export class Level {
  private level: number;
  private availableSpace : number;
  private parkingSlot: Array<Slot> = new Array<Slot>()
  
  public constructor(level: number,
                     motorcycle_spot:number,
                     compact_spot:number,
                     large_spot:number,) {
    this.level = level;
    this.availableSpace = motorcycle_spot + compact_spot  + large_spot
    // Spot Creation
    for (let i = 0; i < motorcycle_spot; i++) {
      this.parkingSlot.push(new Slot(spotSize.bike, i));
    }
    for (let i = 0; i < compact_spot; i++) {
      this.parkingSlot.push(new Slot(spotSize.compact, i + motorcycle_spot));
    }
    for (let i = 0; i < large_spot; i++) {
      this.parkingSlot.push(new Slot(spotSize.large, i + motorcycle_spot + compact_spot));
    }
  }
  
  public park(vehicle: Vehicle) : Slot | undefined {
    const park = this.parkingSlot.find(slot => slot.park(vehicle));
    if (park == undefined) return undefined // Cannot park
    this.availableSpace--;
    return park;
  }
  
  public findSlot(slot: Slot) {
    return this.parkingSlot.includes(slot)
  }
  
  public getLevel() {
    return this.level
  }
  
  public getFreeSpot() {
    return this.availableSpace
  }
}