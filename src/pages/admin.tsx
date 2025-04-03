import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function AdminPage() {
  // States for levels and slots
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [slots, setSlots] = useState([]);
  const [highestLevel, setHighestLevel] = useState(null);
  const [highestSlot, setHighestSlot] = useState(null);
  
  // State for form inputs - we only need slot size now
  const [newSlotSize, setNewSlotSize] = useState('1'); // Default to Car size
  
  // Feedback messages
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch levels on component mount
  useEffect(() => {
    fetchLevels();
  }, []);
  
  // Fetch slots when a level is selected
  useEffect(() => {
    if (selectedLevel) {
      fetchLevelDetails(selectedLevel._id);
    } else {
      setSlots([]);
      setHighestSlot(null);
    }
  }, [selectedLevel]);
  
  // Fetch all levels
  const fetchLevels = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/levels');
      const data = await response.json();
      
      if (data.success) {
        setLevels(data.data);
        
        // Find highest level
        if (data.data.length > 0) {
          const sortedLevels = [...data.data].sort((a, b) => b.levelNumber - a.levelNumber);
          setHighestLevel(sortedLevels[0]);
          
          // If levels exist and none is selected, select the first one
          if (!selectedLevel) {
            setSelectedLevel(data.data[0]);
          }
        } else {
          setSelectedLevel(null);
          setHighestLevel(null);
        }
      } else {
        setError('Failed to fetch levels');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch level details including slots
  const fetchLevelDetails = async (levelId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/levels/${levelId}`);
      const data = await response.json();
      
      if (data.success) {
        setSlots(data.data.slots || []);
        
        // Find highest slot for this level
        if (data.data.slots && data.data.slots.length > 0) {
          const sortedSlots = [...data.data.slots].sort((a, b) => b.SlotNumber - a.SlotNumber);
          setHighestSlot(sortedSlots[0]);
        } else {
          setHighestSlot(null);
        }
      } else {
        setError('Failed to fetch level details');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a new level - auto-incremented
  const handleCreateLevel = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/admin/levels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Empty body, level number is auto-generated
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(`Level ${data.data.levelNumber} created successfully`);
        await fetchLevels();
        setSelectedLevel(data.data);
      } else {
        setError(data.error || 'Failed to create level');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete a level (only the highest-numbered level can be deleted)
  const handleDeleteLevel = async (levelId) => {
    if (!confirm('Are you sure you want to delete this level? All slots in this level will be deleted too.')) {
      return;
    }
    
    setMessage('');
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/admin/levels/${levelId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(data.message || 'Level deleted successfully');
        setSelectedLevel(null);
        await fetchLevels();
      } else {
        setError(data.error || 'Failed to delete level');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a new slot - auto-incremented
  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    if (!selectedLevel) {
      setError('Please select a level first');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/admin/levels/${selectedLevel._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Size: parseInt(newSlotSize),
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(`New slot created successfully in Level ${selectedLevel.levelNumber}`);
        fetchLevelDetails(selectedLevel._id);
      } else {
        setError(data.error || 'Failed to create slot');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete a slot (only the highest-numbered slot can be deleted)
  const handleDeleteSlot = async (levelId, slotId) => {
    if (!confirm('Are you sure you want to delete this slot?')) {
      return;
    }
    
    setMessage('');
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/admin/levels/${levelId}/slots/${slotId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(data.message || 'Slot deleted successfully');
        fetchLevelDetails(levelId);
      } else {
        setError(data.error || 'Failed to delete slot');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get size name based on numeric value
  const getSizeName = (size) => {
    switch (parseInt(size)) {
      case 0: return 'Motorcycle';
      case 1: return 'Car';
      case 2: return 'Bus';
      default: return 'Unknown';
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>Parking Lot Admin</title>
      </Head>
      
      <h1 className="text-3xl font-bold text-center mb-8">Parking Lot Administration</h1>
      
      {/* Feedback messages */}
      {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{message}</div>}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-white mt-4">Loading...</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Level Management Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Create Level</h2>
            <p className="text-sm text-gray-400">
              Level numbers are automatically assigned. Levels can only be deleted in reverse order (last created, first deleted).
            </p>
          </div>
          
          <form onSubmit={handleCreateLevel} className="mb-6 space-y-4">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              disabled={isLoading}
            >
              Create New Level
            </button>
          </form>
          
          <h2 className="text-xl font-semibold mb-4">Existing Levels</h2>
          
          {levels.length === 0 ? (
            <p className="text-gray-400">No levels created yet.</p>
          ) : (
            <div className="bg-gray-700 rounded-md overflow-hidden">
              <ul className="divide-y divide-gray-600">
                {levels.map((level) => (
                  <li
                    key={level._id}
                    className={`flex justify-between items-center px-4 py-3 hover:bg-gray-600 ${
                      selectedLevel && selectedLevel._id === level._id ? 'bg-gray-600' : ''
                    }`}
                  >
                    <span 
                      className="cursor-pointer flex-grow"
                      onClick={() => setSelectedLevel(level)}
                    >
                      Level {level.levelNumber}
                    </span>
                    {highestLevel && level._id === highestLevel._id && (
                      <button
                        onClick={() => handleDeleteLevel(level._id)}
                        className="text-red-400 hover:text-red-300 ml-2"
                        disabled={isLoading}
                      >
                        Delete
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Slot Management Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">
              {selectedLevel 
                ? `Add Slot to Level ${selectedLevel.levelNumber}`
                : 'Select a Level to Add Slots'}
            </h2>
            <p className="text-sm text-gray-400">
              Slot numbers are automatically assigned. Slots can only be deleted in reverse order (last created, first deleted).
            </p>
          </div>
          
          {selectedLevel && (
            <form onSubmit={handleCreateSlot} className="mb-6 space-y-4">
              <div>
                <label htmlFor="slotSize" className="block text-sm font-medium text-gray-300 mb-1">
                  Slot Size
                </label>
                <select
                  id="slotSize"
                  value={newSlotSize}
                  onChange={(e) => setNewSlotSize(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  <option value="0">Motorcycle (Small)</option>
                  <option value="1">Car (Medium)</option>
                  <option value="2">Bus (Large)</option>
                </select>
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                disabled={isLoading}
              >
                Add Slot
              </button>
            </form>
          )}
          
          <h2 className="text-xl font-semibold mb-4">
            {selectedLevel 
              ? `Slots in Level ${selectedLevel.levelNumber}`
              : 'Slots'}
          </h2>
          
          {!selectedLevel ? (
            <p className="text-gray-400">Select a level to view its slots.</p>
          ) : slots.length === 0 ? (
            <p className="text-gray-400">No slots created for this level yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-700 border border-gray-600">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Slot #
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {slots.map((slot) => (
                    <tr key={slot._id} className="hover:bg-gray-600">
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                        {slot.SlotNumber}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                        {getSizeName(slot.Size)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                        {slot.ParkedVehicle ? 'Occupied' : 'Available'}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                        {highestSlot && slot._id === highestSlot._id && !slot.ParkedVehicle && (
                          <button
                            onClick={() => handleDeleteSlot(selectedLevel._id, slot._id)}
                            className="text-red-400 hover:text-red-300"
                            disabled={isLoading}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}