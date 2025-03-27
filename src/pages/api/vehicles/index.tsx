import DBConnector from '@/lib/mongodb';
import { ParkingLotManager } from '@/lib/parkingManager';

export default async function handler(req, res) {
  await DBConnector.getInstance().connect();
  const { method } = req;
  const manager = ParkingLotManager.getInstance();
  
  switch (method) {
    case 'GET':
      try {
        const vehicles =  await manager.getAllParkedVehicle()
        res.status(200).json({ success: true, data: vehicles });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
      
    case 'POST':
      try {
        const { body } = req;
        await manager.parkVehicle(body.vehicleType, body.licensePlate)
        res.status(201).json({ success: true});
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
      
    default:
      res.status(400).json({ success: false });
      break;
  }
}