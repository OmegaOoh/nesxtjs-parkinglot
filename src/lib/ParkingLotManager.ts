import { ParkingLot } from "@/models/ParkingLot";
import DBConnector from "./DBConnector";
import { Motorcycle, Car, Bus } from "@/models/Vehicle";
import { LevelDBO } from "@/models/Level";
import { ParkingSlotDBO } from "@/models/ParkingSlot";
import { VehicleDBO } from "@/models/Vehicle";

export class ParkingLotManager {
  private static instance: ParkingLotManager | undefined;
  private parkingLot: ParkingLot = new ParkingLot();

  private constructor() {
    this.initFromDB();
  }

  public reloadInstance() {
    this.parkingLot = new ParkingLot();
    this.initFromDB();
  }

  private async initFromDB() {
    await DBConnector.getInstance().connect();

    const levels = await LevelDBO.find()
      .populate("slots")
      .sort({ levelNumber: 1 });
    for (const lvl of levels) {
      this.parkingLot.addLevel(lvl.levelNumber);
      for (const s of lvl.slots)
        this.parkingLot.addSpot(lvl.levelNumber, s.Size, s.SlotNumber);
    }

    this.loadVehiclesFromDB();
  }

  private async loadVehiclesFromDB() {
    const occupiedSlots = await ParkingSlotDBO.find({
      ParkedVehicle: {$ne: null},
    }).populate("ParkedVehicle");
    for (const slot of occupiedSlots) {
      if (!slot.ParkedVehicle) continue;

      const vehicleData = slot.ParkedVehicle;
      const licensePlate = vehicleData.licensePlate;
      const vehicleType = vehicleData.vehicleType;

      let vehicleObj;
      switch (vehicleType) {
        case "Motorcycle":
          vehicleObj = new Motorcycle(licensePlate);
          break;
        case "Car":
          vehicleObj = new Car(licensePlate);
          break;
        case "Bus":
          vehicleObj = new Bus(licensePlate);
          break;
        default:
          vehicleObj = new Car(licensePlate);
      }
      const levelRecord = await LevelDBO.findOne({
        slots: { $elemMatch: { $eq: slot._id } },
      });
      if (levelRecord) {
        this.parkingLot.parkAtSpot(
          vehicleObj,
          levelRecord.levelNumber,
          slot.SlotNumber,
        );
      }
    }
  }

  public static getInstance() {
    if (!ParkingLotManager.instance) {
      ParkingLotManager.instance = new ParkingLotManager();
    }
    return ParkingLotManager.instance;
  }

  public async parkVehicle(vehicleType: string, licensePlate: string) {
    await DBConnector.getInstance().connect();

    const vec = await VehicleDBO.find({ licensePlate });
    if (vec.length > 0) throw Error("Vehicle Already Exists");

    let vehicleObj;
    switch (vehicleType) {
      case "Motorcycle":
        vehicleObj = new Motorcycle(licensePlate);
        break;
      case "Car":
        vehicleObj = new Car(licensePlate);
        break;
      case "Bus":
        vehicleObj = new Bus(licensePlate);
        break;
      default:
        vehicleObj = new Car(licensePlate);
    }

    if (!vehicleObj.park(this.parkingLot)) throw Error("No Available spot");

    const slot = this.parkingLot.findVehicle(licensePlate);
    if (!slot) throw Error("No Available spot");

    const level = this.parkingLot.findSlot(slot);
    if (level === -1) throw Error("Vehicle Parked in unavailable spot");

    try {
      const vehicle = await VehicleDBO.create({
        licensePlate: vehicleObj.get_plate(),
        vehicleType: vehicleType,
      });

      const levelDbo = await LevelDBO.findOne({ levelNumber: level }).populate(
        "slots",
      );

      // find slot _id
      let slot_id;
      for (const slotDbo of levelDbo.slots) {
        if (slotDbo.SlotNumber == slot.getLotNumber()) {
          slot_id = slotDbo._id;
          break;
        }
      }
       await ParkingSlotDBO.findByIdAndUpdate(
        { _id: slot_id },
        { ParkedVehicle: vehicle._id },
      );
      return vehicle;
    } catch (error) {
      throw Error(error.message);
    }
  }

  public async vehicleLeave(licensePlate: string) {
    await DBConnector.getInstance().connect();

    const vehicle = await VehicleDBO.findOne({ licensePlate });
    if (!vehicle) throw Error("Vehicle not found.");

    const slot = this.parkingLot.findVehicle(licensePlate);

    if (!slot) {
      await VehicleDBO.findByIdAndDelete(vehicle._id);
      throw Error("Vehicle doesn't parked, Vehicle Removed from Database.");
    }

    const level = this.parkingLot.findSlot(slot);

    await ParkingSlotDBO.findOneAndUpdate(
      { level: level, SlotNumber: slot.getLotNumber() },
      { $unset: { ParkedVehicle: "" } },
    );

    await VehicleDBO.findByIdAndDelete(vehicle._id);

    this.parkingLot.LeaveFromSpot(licensePlate, level, slot.getLotNumber());
  }

  public async getAllParkedVehicle() {
    await DBConnector.getInstance().connect();
    const occupiedSlots = await ParkingSlotDBO.find({
      ParkedVehicle: { $ne: null }
    }).populate("ParkedVehicle");
    
    const vehicles = [];
    
    for (const slot of occupiedSlots) {
      if (!slot.ParkedVehicle) continue;
      
      // Find the level for this slot
      const levelRecord = await LevelDBO.findOne({
        slots: { $elemMatch: { $eq: slot._id } }
      });
      
      if (levelRecord) {
        // Create a formatted vehicle object
        const vehicleData = {
          _id: slot.ParkedVehicle._id,
          licensePlate: slot.ParkedVehicle.licensePlate,
          vehicleType: slot.ParkedVehicle.vehicleType,
          level: levelRecord.levelNumber,
          slotNumber: slot.SlotNumber
        };
        
        vehicles.push(vehicleData);
      }
    }
    return vehicles;
  }

  public getFreeSpace() {
    return this.parkingLot.getFreeSpots();
  }

  public getLotSpace() {
    return this.parkingLot.getNSpots();
  }
}
