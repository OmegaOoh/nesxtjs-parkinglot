import { ParkingLot } from "@/models/ParkingLot";
import Vehicle from "@/models/Item";
import DBConnector from "./mongodb";
import { Motorcycle, Car, Bus } from "@/models/Vehicle";

export class ParkingLotManager {
  private static instance: ParkingLotManager | undefined;
  private parkingLot: ParkingLot = new ParkingLot(5, 20, 25, 5);

  private constructor() {
    this.loadFromDB();
  }

  private async loadFromDB() {
    await DBConnector.getInstance().connect();

    const vehicles = await Vehicle.find();
    for (const v of vehicles) {
      let vehicleObj;
      const licensePlate = v.licensePlate;
      switch (v.vehicleType) {
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
      this.parkingLot.parkAtSpot(vehicleObj, v.level, v.slotNumber);
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
    const vec = await Vehicle.find({ licensePlate });
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
    const slotNumber = slot.getLotNumber();
    const level = this.parkingLot.findSlot(slot);
    if (level === -1) throw Error("Vehicle Parked in unavailable spot");
    const v = new Vehicle({
      licensePlate: vehicleObj.get_plate(),
      vehicleType: vehicleType,
      level: level,
      slotNumber: slotNumber,
    });
    try {
      await Vehicle.create(v);
    } catch (error) {
      throw Error(error.message);
    }
  }

  public async vehicleLeave(licensePlate: string) {
    await DBConnector.getInstance().connect();
    const vehicle = await Vehicle.findOneAndDelete({ licensePlate });
    const plate = vehicle.licensePlate;
    const level = vehicle.level;
    const slot = vehicle.slotNumber;
    this.parkingLot.LeaveFromSpot(plate, level, slot)
  }

  public async getAllParkedVehicle() {
    await DBConnector.getInstance().connect();
    return await Vehicle.find({});
  }

  public getFreeSpace() {
    return this.parkingLot.getFreeSpots();
  }

  public getLotSpace() {
    return this.parkingLot.getNSpots();
  }
}
