import { Level } from "./Level";
import { Slot } from "./ParkingSlot";
import { Vehicle } from "./Vehicle";

export class ParkingLot {
  private levels: Array<Level> = new Array<Level>();
  private nSlot = 0;

  public constructor(
    n_level: number,
    level_motorcycle_spot: number,
    level_compact_spot: number,
    level_large_spot: number,
  ) {
    for (let i = 0; i < n_level; i++) {
      this.levels.push(
        new Level(
          i,
          level_motorcycle_spot,
          level_compact_spot,
          level_large_spot,
        ),
      );
    }
    this.nSlot =
      n_level * (level_motorcycle_spot + level_compact_spot + level_large_spot);
  }

  public park(vehicle: Vehicle): Slot | undefined {
    for (const level of this.levels) {
      const slot = level.park(vehicle);
      if (slot != undefined) return slot;
    }
    return undefined;
  }

  public findSlot(slot: Slot): number {
    const level = this.levels.find((l) => l.findSlot(slot));
    if (level == undefined) return -1;
    return level.getLevel();
  }

  public getFreeSpots(): number {
    let n = 0;
    for (const level of this.levels) {
      n += level.getFreeSpot();
    }
    return n;
  }

  public getNSpots(): number {
    return this.nSlot;
  }

  public parkAtSpot(vehicle: Vehicle, level: number, slot: number) {
    this.levels[level].parkAtSpot(vehicle, slot);
  }

  public findVehicle(plate: string): Slot | undefined {
    for (const l of this.levels) {
      const slot = l.findVehicle(plate);
      if (slot) return slot;
    }
    return undefined;
  }
  
  public LeaveFromSpot(plate: string, level: number, slot: number) {
    this.levels[level].leaveFromSpot(plate, slot)
  }
}
