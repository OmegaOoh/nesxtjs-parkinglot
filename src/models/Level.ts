import { ParkingSlot } from "./ParkingSlot";
import { Vehicle } from "./Vehicle";
import mongoose from "mongoose"

export class Level {
  private level: number;
  private availableSpace: number = 0;
  private nSpace: number = 0;
  private parkingSlot: Array<ParkingSlot> = new Array<ParkingSlot>();

  public constructor(level: number) 
  {
    this.level = level;
  }
  
  public addSpot(size: number, number: number) {
    this.availableSpace++;
    this.nSpace++;
    this.parkingSlot.push(new ParkingSlot(size, number));
  }

  public park(vehicle: Vehicle): ParkingSlot | undefined {
    const park = this.parkingSlot.find((slot) => slot.park(vehicle));
    if (park == undefined) return undefined; // Cannot park
    this.availableSpace--;
    return park;
  }

  public findSlot(slot: ParkingSlot) {
    return this.parkingSlot.includes(slot);
  }

  public getLevel() {
    return this.level;
  }
  
  public getSpace() {
    return this.nSpace;
  }

  public getFreeSpot() {
    return this.availableSpace;
  }

  public parkAtSpot(vehicle: Vehicle, spot: number) {
    for (const parkSlot of this.parkingSlot) {
      if (parkSlot.getLotNumber() == spot) {    
        const canPark = parkSlot.park(vehicle);
        if (canPark) {
          this.availableSpace--;
        }
        console.log(canPark)
        return canPark;
      }
    }
  }

  public leaveFromSpot(plate: string, spot: number) {
    for (const slot of this.parkingSlot) {
      if (slot.getVehicle()?.get_plate() == plate && slot.getLotNumber() == spot) {
        slot.leave();
        this.availableSpace++;
      }
    }
  }

  public findVehicle(plate: string): ParkingSlot | undefined {
    for (const s of this.parkingSlot) {
      const vehicle = s.getVehicle();
      if (vehicle?.get_plate() == plate) return s;
    }
    return undefined;
  }
}

const LevelSchema = new mongoose.Schema({
  levelNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  slots: [
    {type: mongoose.Schema.ObjectId, ref: "ParkingSlot"}
  ]
});

export const LevelDBO = mongoose.model.Level || mongoose.model("Level", LevelSchema)