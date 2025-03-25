import dbConnect from "../../../lib/mongodb";
import Vehicle from "../../../models/Item";

export default async function handler(req, res) {
  const {
    query: { licensePlate },
    method,
  } = req;

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const vehicle = await Vehicle.findOne({ licensePlate });
        if (!vehicle) {
          return res
            .status(404)
            .json({ success: false, message: "Vehicle not found" });
        }
        res.status(200).json({ success: true, data: vehicle });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case "DELETE":
      try {
        const deletedVehicle = await Vehicle.findOneAndDelete({ licensePlate });
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
