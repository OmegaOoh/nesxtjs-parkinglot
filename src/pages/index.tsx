import { useEffect, useState } from "react";

export default function LandingPage() {
  const [lot, setLot] = useState([]);
  const [freeSpace, setFreeSpace] = useState(0);
  const [lotSpace, setLotSpace] = useState(0);
  const [licensePlate, setLicensePlate] = useState("");
  const [vehicleType, setVehicleType] = useState("Car");
  const [remPlate, setRemPlate] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function fetchVehicles() {
    const res = await fetch("/api/vehicles");
    const data = await res.json();
    return data;
  }

  async function fetchLot() {
    const res = await fetch("/api/parkinglot");
    const data = await res.json();
    return data;
  }

  async function getData() {
    const data1 = await fetchVehicles();
    setLot(data1.data);
    const data2 = await fetchLot();
    console.log(data2.data);
    setFreeSpace(data2.data.free_spot);
    setLotSpace(data2.data.n_spot);
  }

  useEffect(() => {
    getData();
  }, []);

  const handleParkSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          licensePlate,
          vehicleType,
        }),
      });
      if (response.ok) {
        // Refresh the data
        const data = await fetchVehicles();
        setLot(data.data);
        setLicensePlate("");
        setErrorMessage("");
      } else {
        const responseJson = await response.json();
        setErrorMessage(responseJson.error || "Unexpected Error");
      }
    } catch (error) {
      setErrorMessage(error.message || "Unexpected Error");
    }
    getData();
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      const response: Response = await fetch("/api/vehicles/" + remPlate, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        // Refresh the data
        const data = await fetchVehicles();
        setLot(data.data);
        setLicensePlate("");
        setErrorMessage("");
      } else {
        const responseJson = await response.json();
        setErrorMessage(responseJson.error || "Unexpected Error");
      }
    } catch (error) {
      setErrorMessage(error.message || "Unexpected Error");
    }
    getData();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-4">Parking Lot</h1>
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{successMessage}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setSuccessMessage("")}
          >
            <span className="text-green-500">×</span>
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{errorMessage}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setErrorMessage("")}
          >
            <span className="text-red-500">×</span>
          </button>
        </div>
      )}
      {/* Parking */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <form onSubmit={handleParkSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="licensePlate"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              License Plate <span className="text-red-500">*</span>
            </label>
            <input
              id="licensePlate"
              type="text"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              placeholder="abc1234"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="vehicleType"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Vehicle Type
            </label>
            <select
              id="vehicleType"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Car">Car</option>
              <option value="Motorcycle">Motorcycle</option>
              <option value="Bus">Bus</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Park Vehicle
          </button>
        </form>
      </div>

      {/* Leave */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div>
          <label
            htmlFor="licensePlate"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            License Plate <span className="text-red-500">*</span>
          </label>
        </div>
        <form onSubmit={handleLeaveSubmit}>
          <input
            id="licensePlate"
            type="text"
            value={remPlate}
            onChange={(e) => setRemPlate(e.target.value)}
            placeholder="abc1234"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <button
            type="submit"
            className="w-full bg-red-800 hover:bg-red-900 text-white font-medium py-2 px-4 rounded-md transition-colors mt-3"
          >
            Leave
          </button>
        </form>
      </div>
      {/*Parking Table*/}
      <h2 className="text-2xl font-semibold text-left mb-4">
        Free Slot: {freeSpace} / {lotSpace}
      </h2>
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full bg-gray-700 border border-gray-900">
          <thead className="bg-gray-950">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b">
                Order
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b">
                License Plate
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b">
                Vehicle Type
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b">
                Level
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b">
                Lot Number
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-900">
            {lot.map((data, index) => (
              <tr
                key={index}
                className={
                  index % 2 === 0
                    ? "bg-gray-800 hover:bg-gray-600"
                    : "bg-gray-700 hover:bg-gray-600"
                }
              >
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300">
                  {index + 1}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300">
                  {data.licensePlate}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300">
                  {data.vehicleType}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300">
                  {data.level}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300">
                  {data.slotNumber}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
