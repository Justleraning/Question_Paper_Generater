import { useState, useEffect } from "react";
import { getSystemSettings, updateSystemSettings } from "../../services/adminService.js";
import Sidebar from "../../components/Sidebar.js";
import Navbar from "../../components/Navbar.js";

const SystemSettings = () => {
  const [settings, setSettings] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getSystemSettings();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching system settings:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateSystemSettings(settings);
      alert("Settings updated successfully!");
    } catch (error) {
      console.error("Error updating settings:", error);
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen">
      <Sidebar setIsSidebarOpen={setIsSidebarOpen} />
      <div className={`flex-1 flex flex-col bg-gray-100 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
        <Navbar isSidebarOpen={isSidebarOpen} />
        <div className="p-6">
          <h1 className="text-3xl font-bold">System Settings</h1>

          <div className="mt-6 space-y-4">
            <label className="block text-lg font-medium">Max Question Pool Size</label>
            <input
              type="number"
              value={settings.maxPoolSize || ""}
              onChange={(e) => setSettings({ ...settings, maxPoolSize: e.target.value })}
              className="border p-2 rounded w-full"
            />

            <label className="block text-lg font-medium">Approval Required for Papers</label>
            <select
              value={settings.approvalRequired || ""}
              onChange={(e) => setSettings({ ...settings, approvalRequired: e.target.value })}
              className="border p-2 rounded w-full"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>

            <button
              onClick={handleSave}
              className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
