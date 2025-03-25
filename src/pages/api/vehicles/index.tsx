import dbConnect from '@/lib/mongodb';
import Vehicle from '@/models/Item';

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;
  
  switch (method) {
    case 'GET':
      try {
        const vehicles = await Vehicle.find({}).sort({ parkedAt: -1 });
        res.status(200).json({ success: true, data: vehicles });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
      
    case 'POST':
      try {
        const vehicle = await Vehicle.create(req.body);
        res.status(201).json({ success: true, data: vehicle });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
      
    default:
      res.status(400).json({ success: false });
      break;
  }
}