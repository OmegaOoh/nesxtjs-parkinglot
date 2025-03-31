import DBConnector from '@/lib/mongodb';
import { ParkingLotManager } from '@/lib/parkingManager';

export default async function handler(req, res) {
  await DBConnector.getInstance().connect();
  const { method } = req;
  const manager = ParkingLotManager.getInstance();
  
  switch(method) {
    case ("GET"):
      res.status(200).json({ success: true, data: {
          "free_spot": manager.getFreeSpace(),
          "n_spot": manager.getLotSpace()
        }
      })
      break
    default:
      res.status(400).json({ success: false });
  }
}