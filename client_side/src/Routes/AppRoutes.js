import "../App.css"; // ✅ Corrected import path
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext.js"; // ✅ Fixed path
import MainLayout from "../components/MainLayout.js"; // ✅ Fixed path

// ✅ Corrected Paths for Your Components
import SelectMarks from "../components/Dino/EndFront/SelectedMarks.js";
import SelectParts from "../components/Dino/EndFront/CreateQuestion/SelectParts.js";
import ExamDetails from "../components/Dino/EndFront/CreatePaper/ExamDetails.js";
import QuestionPool from "../components/Dino/EndFront/CreateQuestion/QuestionPool/QuestionPool.js";
import CreateQuestion from "../components/Dino/EndFront/CreateQuestion/QuestionPool/CreateQuestion.js";
import EditQuestion from "../components/Dino/EndFront/CreateQuestion/QuestionPool/EditQuestion.js";

// ✅ Pages from the Second Codebase
import LandingPage from "../pages/LandingPage.js";
import Login from "../pages/Login.js";
import Dashboard from "../pages/Dashboard.js";
import Module5 from "../pages/Modules/Module5.js";
import GeneratePaper from "../pages/Modules/GeneratePaper.js";
import QuestionEntry from "../pages/Modules/QuestionEntry.js";
import FinalPreview from "../pages/Modules/FinalPreview.js";
import GeneralQuestions from "../pages/Modules/GeneralQuestions.js";
import CreatePaper from "../pages/Papers/CreatePaper.js";
import PaperStatus from "../pages/Papers/PaperStatus.js";
import RejectedPapers from "../pages/Papers/RejectedPapers.js";
import MyPapers from "../pages/Papers/MyPapers.js";
import AdminDashboard from "../pages/AdminDashboard.js";
import PaperApproval from "../pages/Papers/PaperApproval.js";
import ResetRequests from "../pages/Users/ResetRequests.js";
import ManageUsers from "../pages/Users/ManageUsers.js";
import SuperAdminPanel from "../pages/SuperAdmin/SuperAdminPanel.js";
import ViewAllUsers from "../pages/SuperAdmin/ViewAllUsers.js";
import SystemSettings from "../pages/SuperAdmin/SystemSettings.js";
import QuestionPreview from "../pages/Modules/QuestionPreview.js";

// ✅ Authentication Wrapper
const PrivateRoute = ({ children, allowedRoles }) => {
  const { authState } = useAuth();
  const location = useLocation();

  if (!authState.token) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(authState.user?.role)) {
    return <Navigate to="/" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

const AppRoutes = () => {
  return (
    <>
      <Routes>
        {/* ✅ Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* ✅ Protected Routes */}
        <Route path="/dashboard" element={<PrivateRoute allowedRoles={["Teacher", "Admin", "SuperAdmin"]}><Dashboard /></PrivateRoute>} />
        <Route path="/module5" element={<PrivateRoute allowedRoles={["Teacher"]}><Module5 /></PrivateRoute>} />
        <Route path="/question-pool" element={<PrivateRoute allowedRoles={["Teacher"]}><QuestionPool /></PrivateRoute>} />
        <Route path="/generate-paper" element={<PrivateRoute allowedRoles={["Teacher"]}><GeneratePaper /></PrivateRoute>} />
        <Route path="/general-questions" element={<PrivateRoute allowedRoles={["Teacher"]}><GeneralQuestions /></PrivateRoute>} />
        <Route path="/create-paper" element={<PrivateRoute allowedRoles={["Teacher"]}><CreatePaper /></PrivateRoute>} />
        <Route path="/enter-questions/:course/:subject" element={<PrivateRoute allowedRoles={["Teacher"]}><QuestionEntry /></PrivateRoute>} />
        <Route path="/final-preview" element={<PrivateRoute allowedRoles={["Teacher"]}><FinalPreview /></PrivateRoute>} />
        <Route path="/question-preview" element={<PrivateRoute allowedRoles={["Teacher"]}><QuestionPreview /></PrivateRoute>} />
        <Route path="/paper-status" element={<PrivateRoute allowedRoles={["Teacher"]}><PaperStatus /></PrivateRoute>} />
        <Route path="/rejected-papers" element={<PrivateRoute allowedRoles={["Teacher"]}><RejectedPapers /></PrivateRoute>} />
        <Route path="/mypapers" element={<PrivateRoute allowedRoles={["Teacher"]}><MyPapers /></PrivateRoute>} />

        {/* ✅ Admin & SuperAdmin Routes */}
        <Route path="/admin-dashboard" element={<PrivateRoute allowedRoles={["Admin"]}><AdminDashboard /></PrivateRoute>} />
        <Route path="/view-reset-requests" element={<PrivateRoute allowedRoles={["Admin", "SuperAdmin"]}><ResetRequests /></PrivateRoute>} />
        <Route path="/manage-users" element={<PrivateRoute allowedRoles={["Admin", "SuperAdmin"]}><ManageUsers /></PrivateRoute>} />
        <Route path="/approve-papers" element={<PrivateRoute allowedRoles={["Admin", "SuperAdmin"]}><PaperApproval /></PrivateRoute>} />

        {/* ✅ SuperAdmin Routes */}
        <Route path="/super-admin-panel" element={<PrivateRoute allowedRoles={["SuperAdmin"]}><SuperAdminPanel /></PrivateRoute>} />
        <Route path="/view-all-users" element={<PrivateRoute allowedRoles={["SuperAdmin"]}><ViewAllUsers /></PrivateRoute>} />
        <Route path="/system-settings" element={<PrivateRoute allowedRoles={["SuperAdmin"]}><SystemSettings /></PrivateRoute>} />

        {/* ✅ Your Existing Routes */}
        <Route path="/selected-marks" element={<PrivateRoute allowedRoles={["Teacher"]}><SelectMarks /></PrivateRoute>} />
        <Route path="/input-questions" element={<PrivateRoute allowedRoles={["Teacher"]}><SelectParts /></PrivateRoute>} />
        <Route path="/create-question" element={<PrivateRoute allowedRoles={["Teacher"]}><CreateQuestion /></PrivateRoute>} />
        <Route path="/edit-question" element={<PrivateRoute allowedRoles={["Teacher"]}><EditQuestion /></PrivateRoute>} />

        {/* ✅ Redirect Unknown Routes */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
