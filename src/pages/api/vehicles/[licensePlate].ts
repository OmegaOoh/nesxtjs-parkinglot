import { ParkingLotManager } from "@/lib/ParkingLotManager";

export default async function handler(req, res) {
  const {
    query: { licensePlate },
    method,
  } = req;

  const manager: ParkingLotManager = ParkingLotManager.getInstance();
  
  switch (method) {

    case "DELETE":
      try {
        const deletedVehicle = await manager.vehicleLeave(licensePlate);
        if (!deletedVehicle) {
          return res
            .status(404)
            .json({ success: false, message: "Vehicle not found" });
        }
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}
