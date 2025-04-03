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
  const { levelId, slotId } = req.query;
  
  if (!mongoose.Types.ObjectId.isValid(levelId as string) || 
      !mongoose.Types.ObjectId.isValid(slotId as string)) {
    return res.status(400).json({ success: false, error: 'Invalid ID format' });
  }
  
  switch (method) {
    case 'DELETE':
      try {
        // Check if level exists
        const level = await LevelDBO.findById(levelId).populate('slots');
        if (!level) {
          return res.status(404).json({ success: false, error: 'Level not found' });
        }
        
        // Check if slot exists
        const slot = await ParkingSlotDBO.findById(slotId);
        if (!slot) {
          return res.status(404).json({ success: false, error: 'Slot not found' });
        }
        
        // Check if the slot has a parked vehicle
        if (slot.ParkedVehicle) {
          return res.status(400).json({
            success: false,
            error: 'Cannot delete slot with a parked vehicle'
          });
        }
        
        // Get the slot number we're deleting
        const slotNumber = slot.SlotNumber;
        
        // Only allow deletion of the last slot to maintain numbering integrity
        const maxSlotNumber = level.slots.length ? level.slots.length : 0;
        
        if (slotNumber !== maxSlotNumber) {
          return res.status(400).json({
            success: false,
            error: 'You can only delete the last slot to maintain slot numbering'
          });
        }
        
        // Remove slot reference from level
        await LevelDBO.findByIdAndUpdate(levelId, {
          $pull: { slots: slotId }
        });
        
        // Delete the slot
        await ParkingSlotDBO.findByIdAndDelete(slotId);
        
        // Reload the parking lot manager
        manager.reloadInstance();
        
        res.status(200).json({ 
          success: true, 
          message: 'Slot deleted successfully' 
        });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
      
    default:
      res.status(405).json({ success: false, error: 'Method not allowed' });
      break;
  }
}