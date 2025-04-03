import DBConnector from '@/lib/DBConnector';
import { LevelDBO } from '@/models/Level';
import { ParkingSlotDBO } from '@/models/ParkingSlot';
import { ParkingLotManager } from '@/lib/ParkingLotManager';
import { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await DBConnector.getInstance().connect();
  const manager = ParkingLotManager.getInstance();
  const { method } = req;
  const { levelId } = req.query;
  
  if (!mongoose.Types.ObjectId.isValid(levelId as string)) {
    return res.status(400).json({ success: false, error: 'Invalid level ID' });
  }
  
  switch (method) {
    case 'GET':
      try {
        const level = await LevelDBO.findById(levelId).populate('slots');
        if (!level) {
          return res.status(404).json({ success: false, error: 'Level not found' });
        }
        
        const response = {
          _id: level._id,
          levelNumber: level.levelNumber,
          slots: level.slots
        };
        
        res.status(200).json({ success: true, data: response });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
      
      case 'POST':
        try {
          const { Size } = req.body;
          
          const level = await LevelDBO.findById(levelId).populate('slots');
          if (!level) {
            return res.status(404).json({ success: false, error: 'Level not found' });
          }
          
          // Find the highest slot number for this level
          const newSlotNumber = level.slots ? level.slots.length + 1 : 1;
          
          // Create the slot
          const slot = await ParkingSlotDBO.create({
            SlotNumber: newSlotNumber,
            Size: parseInt(Size),
            level: levelId,
            ParkedVehicle: null
          });
          
          // Updated: Make sure to update level with the new slot reference
          await LevelDBO.findByIdAndUpdate(levelId, {
            $push: { slots: slot._id }
          });
          
          // Make sure to update the ParkingLotManager
          manager.reloadInstance();
          res.status(201).json({ success: true, data: slot });
        } catch (error) {
          console.error("Error creating slot:", error);
          res.status(400).json({ success: false, error: error.message });
        }
        break;
    case 'DELETE':
      try {
        const level = await LevelDBO.findById(levelId);
        if (!level) {
          return res.status(404).json({ success: false, error: 'Level not found' });
        }
        
        const occupiedSlots = await ParkingSlotDBO.findOne({
          level: levelId,
          ParkedVehicle: { $exists: true, $ne: null }
        });
        
        if (occupiedSlots) {
          return res.status(400).json({
            success: false,
            error: 'Cannot delete level with parked vehicles'
          });
        }
        
        await ParkingSlotDBO.deleteMany({ level: levelId });
        
        await LevelDBO.findByIdAndDelete(levelId);
        
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      manager.reloadInstance();
      break;
      
    default:
      res.status(400).json({ success: false });
      break;
  }
}