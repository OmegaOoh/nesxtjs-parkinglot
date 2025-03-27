import { useState, useEffect } from "react";
import Head from "next/head";
import { ParkingLot } from "@/models/ParkingLot";
import { Motorcycle, Car, Bus, Vehicle } from "@/models/Vehicle";

// Initialize parking lots outside of component to maintain state between renders
let parkingLots: ParkingLot[] = [
  new ParkingLot(5, 20, 25, 5),
  new ParkingLot(5, 20, 25, 5),
  new ParkingLot(5, 20, 25, 5),
];

export default function Home() {
  const [licensePlate, setLicensePlate] = useState("");
  const [vehicleType, setVehicleType] = useState("Car");
  const [lotNumber, setLotNumber] = useState(1);
  const [message, setMessage] = useState("");
  const [searchLicensePlate, setSearchLicensePlate] = useState("");
  const [parkedVehicles, setParkedVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [parkingLotState, setParkingLotState] = useState(0); // To force re-render when parking state changes

  // Synchronize the parking lots with database vehicles
  const syncParkingLotsWithDatabase = (vehicles: any[]) => {
    // Reset parking lots to ensure clean state
    parkingLots = [
      new ParkingLot(5, 20, 25, 5),
      new ParkingLot(5, 20, 25, 5),
      new ParkingLot(5, 20, 25, 5),
    ];

    // For each vehicle in database, simulate parking in our in-memory parking lots
    vehicles.forEach((dbVehicle) => {
      const lot = parkingLots[dbVehicle.lotNumber - 1];
      if (!lot) return;

      let vehicle: Vehicle;
      switch (dbVehicle.vehicleType) {
        case "Motorcycle":
          vehicle = new Motorcycle();
          break;
        case "Car":
          vehicle = new Car();
          break;
        case "Bus":
          vehicle = new Bus();
          break;
        default:
          vehicle = new Car();
      }

      // Park the vehicle at the specific spot
      lot.parkAtSpot(vehicle, dbVehicle.level, dbVehicle.slotNumber);
    });

    // Update state to trigger re-render with the new parking lot state
    setParkingLotState((prev) => prev + 1);
  };

  // Load parked vehicles on component mount
  useEffect(() => {
    fetchParkedVehicles();
  }, []);

  const fetchParkedVehicles = async () => {
    try {
      const response = await fetch("/api/vehicles");
      const data = await response.json();
      if (data.success) {
        setParkedVehicles(data.data);
        // Sync the database state with our in-memory parking lots
        syncParkingLotsWithDatabase(data.data);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const handlePark = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!licensePlate.trim()) {
      setMessage("Please enter a license plate");
      setLoading(false);
      return;
    }

    try {
      // Check if vehicle already exists
      const existingVehicle = parkedVehicles.find(
        (v) => v.licensePlate === licensePlate,
      );
      if (existingVehicle) {
        setMessage(
          `Vehicle with license plate ${licensePlate} is already parked`,
        );
        setLoading(false);
        return;
      }

      // Create vehicle instance based on type
      let vehicle;
      switch (vehicleType) {
        case "Motorcycle":
          vehicle = new Motorcycle();
          break;
        case "Car":
          vehicle = new Car();
          break;
        case "Bus":
          vehicle = new Bus();
          break;
        default:
          vehicle = new Car();
      }

      // Try to park the vehicle
      const selectedLot = parkingLots[lotNumber - 1];
      const parked = vehicle.park(selectedLot);

      if (!parked) {
        setMessage(`No available spots for ${vehicleType} in Lot ${lotNumber}`);
        setLoading(false);
        return;
      }

      // Get the slot information
      const parkedSlot = vehicle.getParkedSlot();
      if (!parkedSlot) {
        setMessage("Error getting slot information");
        setLoading(false);
        return;
      }

      const slotLocation = selectedLot.findSlot(parkedSlot);
      const levelMatch = slotLocation.match(/Level (\d+)/);
      const level = levelMatch ? parseInt(levelMatch[1]) : 0;
      const slotNumber = parkedSlot.getLotNumber();

      // Save to database
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          licensePlate,
          vehicleType,
          lotNumber,
          level,
          slotNumber,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(
          `${vehicleType} parked successfully in Lot ${lotNumber}, ${slotLocation}, Slot #${slotNumber}`,
        );
        setLicensePlate("");
        fetchParkedVehicles(); // Refresh the vehicle list and sync parking lots
      } else {
        setMessage("Error parking vehicle");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred while parking");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchLicensePlate.trim()) {
      setMessage("Please enter a license plate to search");
      return;
    }

    try {
      const response = await fetch(`/api/vehicles/${searchLicensePlate}`);
      const data = await response.json();

      if (data.success && data.data) {
        const vehicle = data.data;
        setMessage(
          `Found: ${vehicle.vehicleType} with license ${vehicle.licensePlate} is parked in Lot ${vehicle.lotNumber}, Level ${vehicle.level}, Slot #${vehicle.slotNumber}`,
        );
      } else {
        setMessage(`No vehicle found with license plate ${searchLicensePlate}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred while searching");
    }
  };

  const handleLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchLicensePlate.trim()) {
      setMessage("Please enter a license plate to leave");
      return;
    }

    try {
      const response = await fetch(`/api/vehicles/${searchLicensePlate}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setMessage(
          `Vehicle with license plate ${searchLicensePlate} has left the parking lot`,
        );
        setSearchLicensePlate("");
        fetchParkedVehicles(); // Refresh the vehicle list and sync parking lots
      } else {
        setMessage(`No vehicle found with license plate ${searchLicensePlate}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("An error occurred while processing departure");
    }
  };

  return (
    <>
      <Head>
        <title>Parking Lot System</title>
        <meta name="description" content="Parking lot management system" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Parking Lot System
        </h1>

        {message && (
          <div
            className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6"
            role="alert"
          >
            <p>{message}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Park a vehicle section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Park a Vehicle</h2>
            <form onSubmit={handlePark}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  License Plate
                </label>
                <input
                  type="text"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Enter license plate"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Vehicle Type
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Car">Car</option>
                  <option value="Bus">Bus</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Parking Lot
                </label>
                <select
                  value={lotNumber}
                  onChange={(e) => setLotNumber(parseInt(e.target.value))}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value={1}>
                    Lot 1 - Available: {parkingLots[0]?.getFreeSpots() || 0}{" "}
                    spots
                  </option>
                  <option value={2}>
                    Lot 2 - Available: {parkingLots[1]?.getFreeSpots() || 0}{" "}
                    spots
                  </option>
                  <option value={3}>
                    Lot 3 - Available: {parkingLots[2]?.getFreeSpots() || 0}{" "}
                    spots
                  </option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Park Vehicle"}
              </button>
            </form>
          </div>

          {/* Leave section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              Find or Leave Parking
            </h2>
            <form>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  License Plate
                </label>
                <input
                  type="text"
                  value={searchLicensePlate}
                  onChange={(e) => setSearchLicensePlate(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Enter license plate to find/leave"
                  required
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleLeave}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                >
                  Leave Parking
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Parked vehicles list */}
        <div className="mt-12 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            Currently Parked Vehicles
          </h2>
          {parkedVehicles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      License Plate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {parkedVehicles.map((vehicle) => (
                    <tr key={vehicle.licensePlate}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {vehicle.licensePlate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {vehicle.vehicleType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        Lot {vehicle.lotNumber}, Level {vehicle.level}, Slot{" "}
                        {vehicle.slotNumber}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No vehicles currently parked</p>
          )}
        </div>
      </main>
    </>
  );
}
