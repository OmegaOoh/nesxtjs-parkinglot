import { ParkingLotManager } from '@/lib/ParkingLotManager';

export default async function handler(req, res) {
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