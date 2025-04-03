import DBConnector from "@/lib/DBConnector";
import { ParkingLotManager } from "@/lib/ParkingLotManager";
import { LevelDBO } from "@/models/Level";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await DBConnector.getInstance().connect();
  const manager = ParkingLotManager.getInstance();
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const levels = await LevelDBO.find().sort({ levelNumber: 1 });
        res.status(200).json({ success: true, data: levels });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case "POST":
      try {
        // Auto-increment level number
        let maxLevelNumber = 0;

        // Find the highest level number
        const highestLevel = await LevelDBO.findOne().sort({ levelNumber: -1 });
        if (highestLevel) {
          maxLevelNumber = highestLevel.levelNumber;
        }

        // Create new level with incremented number
        const newLevelNumber = maxLevelNumber + 1;

        const level = await LevelDBO.create({
          levelNumber: newLevelNumber,
          slots: [],
        });

        res.status(201).json({ success: true, data: level });
      } catch (error) {
        console.error("Error creating level:", error);
        res.status(400).json({ success: false, error: error.message });
      }
      manager.reloadInstance();
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}
