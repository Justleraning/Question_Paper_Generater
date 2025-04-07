import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [authState, setAuthState] = useState(() => {
    try {
      const user = sessionStorage.getItem("user");
      const token = sessionStorage.getItem("token");

      return {
        user: user ? JSON.parse(user) : null,
        token: token || null,
      };
    } catch (error) {
      console.error("❌ Error parsing auth state:", error);
      return { user: null, token: null };
    }
  });

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState(20);
  const logoutTimerRef = useRef(null);

  useEffect(() => {
    const publicRoutes = ["/", "/login"];

    if (!authState.token && !publicRoutes.includes(location.pathname)) {
      console.log("🚨 No token found. Redirecting to login...");
      resetLogoutState();
      navigate("/login", { replace: true });
    }
  }, [authState.token, location.pathname, navigate]);

  const verifyAuth = async () => {
    try {
      if (!authState.token) return;

      const token = sessionStorage.getItem("token");

      if (!token) {
        console.warn("🚨 No token found in storage! Logging out...");
        triggerLogoutPopup();
        return;
      }

      const response = await axios.get(`${API_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.data || !response.data.user) {
        console.warn("🚨 User no longer exists! Triggering logout pop-up...");
        triggerLogoutPopup();
      }
    } catch (error) {
      if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
        console.warn("⚠️ Network or server error - Ignoring forced logout.");
        return;
      }

      if (error.response) {
        if (error.response.status === 404) {
          console.warn("🚨 User not found in database. Logging out...");
          triggerLogoutPopup();
        } else if (error.response.status === 401) {
          console.warn("🚨 Unauthorized access detected. Forcing logout...");
          triggerLogoutPopup();
        } else {
          console.warn(`⚠️ API Error: ${error.response.status}. Not forcing logout.`);
        }
      } else {
        console.warn("⚠️ Network or server error - Ignoring forced logout.");
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (authState.token) {
        verifyAuth().catch(err => {
          console.warn("Auth verification failed:", err);
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [authState.token]);

  const triggerLogoutPopup = () => {
    if (showLogoutModal || logoutTimerRef.current) return;

    console.log("🚨 Logout countdown started...");
    setShowLogoutModal(true);
    setLogoutCountdown(20);

    logoutTimerRef.current = setInterval(() => {
      setLogoutCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(logoutTimerRef.current);
          logoutTimerRef.current = null;
          forceLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetLogoutState = () => {
    clearInterval(logoutTimerRef.current);
    logoutTimerRef.current = null;
    setShowLogoutModal(false);
    setLogoutCountdown(20);
  };

  const forceLogout = () => {
    console.warn("🚨 Forced logout triggered!");

    resetLogoutState();

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setAuthState({ user: null, token: null });

    navigate("/login", { replace: true });
  };

  const logout = () => {
    console.log("👋logout triggered!");

    resetLogoutState();

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setAuthState({ user: null, token: null });

    navigate("/login", { replace: true });
  };

  const login = (user, token) => {
    try {
      resetLogoutState();
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));
      setAuthState({ user, token });

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("❌ Error storing login data:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, forceLogout }}>
      {children}

      {/* Logout Pop-Up with higher z-index to appear above all content */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-md w-full">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-red-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-red-600 mb-2">⚠️ Session Expired</h2>
            <p className="mt-2 mb-4 text-gray-600">You will be logged out in <span className="font-bold">{logoutCountdown}</span> seconds...</p>
            <div className="flex justify-center">
              <button 
                onClick={forceLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Logout Now
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;