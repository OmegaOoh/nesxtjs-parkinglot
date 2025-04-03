import { Level } from "./Level";
import { ParkingSlot } from "./ParkingSlot";
import { Vehicle } from "./Vehicle";
import mongoose from "mongoose";

export class ParkingLot {
  private levels: Array<Level> = new Array<Level>();

  public constructor() {}

  public addLevel(levelNum: number) {
    this.levels.push(new Level(levelNum));
  }
  
  public addSpot(level: number, size: number, spotNum: number) {
    for (const lvl of this.levels) {
      if (lvl.getLevel() == level) {
        lvl.addSpot(size, spotNum);
        return;
      }
    }
  }

  public park(vehicle: Vehicle): ParkingSlot | undefined {
    for (const level of this.levels) {
      const slot = level.park(vehicle);
      if (slot != undefined) return slot;
    }
    return undefined;
  }

  public findSlot(slot: ParkingSlot): number {
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
    let nSlots = 0;
    for (const l of this.levels) {
      nSlots += l.getSpace();
    }
    return nSlots
  }

  public parkAtSpot(vehicle: Vehicle, level: number, slot: number) {
    this.levels[level].parkAtSpot(vehicle, slot);
  }

  public findVehicle(plate: string): ParkingSlot | undefined {
    for (const l of this.levels) {
      const slot = l.findVehicle(plate);
      if (slot) return slot;
    }
    return undefined;
  }
  
  public LeaveFromSpot(plate: string, level: number, slot: number) {
    for (const lvl of this.levels) {
      if (lvl.getLevel() == level) {
        lvl.leaveFromSpot(plate, slot)
        return;
      }
    }
  }
}