import "../App.css"; // ✅ Corrected import path
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext.js"; 
import MainLayout from "../components/MainLayout.js"; 
import { QPProvider } from "../Contexts/QPContext.js"
import PaperApprovals from "../pages/Papers/PaperApprovals_OpenElectiveSide.js";
import PaperApprovals_EndSem from "../pages/Papers/PaperApprovals_EndSem.js";
import PaperApprovals_Midsem from "../pages/Papers/PaperApprovals_MidSem.js"

// ✅ Dino Routes
import SelectMarks from "../components/Dino/EndFront/SelectedMarks.js";
import SelectParts from "../components/Dino/EndFront/CreateQuestion/SelectParts.js";
import ExamDetails from "../components/Dino/EndFront/CreatePaper/ExamDetails.js";
import QuestionPool from "../components/Dino/EndFront/CreateQuestion/QuestionPool/QuestionPool.js";
import CreateQuestion from "../components/Dino/EndFront/CreateQuestion/QuestionPool/CreateQuestion.js";
import EditQuestion from "../components/Dino/EndFront/CreateQuestion/QuestionPool/EditQuestion.js";
import ExamPattern from  "../components/Dino/EndFront/CreatePaper/ExamPattern.js";
import CreatePapers from "../components/Dino/EndFront/CreatePaper/CreatePapers.js";
import EndSemSide from "../pages/Papers/EndSemSide.js";

// ✅ Roshan Routes
import MainPage from "../components/Roshan/MainPage.js";
import CreatePapermidsem from "../components/Roshan/CreatePapermidsem.js";
import ViewPaper from "../components/Roshan/ViewPaper.js";
import SubjectSelection from "../components/Roshan/SubjectSelection.js";
import UnitChoose from "../components/Roshan/UnitChoose.js";
import QuestionEntrymidsem from "../components/Roshan/QuestionEntrymidsem.js";
import PreviewPagemidsem from "../components/Roshan/PreviewPagemidsem.js";
import ModalRosh from "../components/Roshan/ModalRosh.js";
import MidSemSide from "../pages/Papers/MidSemSide.js";

// ✅ Isaac Routes
import IndexPage from "../pages_Isaac/IndexPage.js";
import QuestionEntryPage from "../pages_Isaac/QuestionEntryPage.js";
import PreviewPage from "../pages_Isaac/PreviewPage.js";
import FinalPaperPage from "../pages_Isaac/FinalPaperPage.js";
import AnswerKeyPage from "../pages_Isaac/AnswerKeyPage.js";
import OpenElectiveSide from "../pages/Papers/OpenElectiveSide.js";

// ✅ Manav Routes and Dashboard routes 
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
import MyPapers from "../pages/Papers/MyPapers.js";
import AdminDashboard from "../pages/AdminDashboard.js";
import ResetRequests from "../pages/Users/ResetRequests.js";
import ManageUsers from "../pages/Users/ManageUsers.js";
import SuperAdminPanel from "../pages/SuperAdmin/SuperAdminPanel.js";
import ViewAllUsers from "../pages/SuperAdmin/ViewAllUsers.js";
import SystemSettings from "../pages/SuperAdmin/SystemSettings.js";
import QuestionPreview from "../pages/Modules/QuestionPreview.js";
import AnswerKey from "../pages/Modules/AnswerKey.js";
import EntranceExamSide from "../pages/Papers/EntranceExamSide.js";
import EntranceAdminApprovalPage from "../pages/Papers/PaperApprovals_Entrance.js";

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
        <Route path="/enter-questions/:courseName/:subjectName" element={<PrivateRoute allowedRoles={["Teacher"]}><QuestionEntry /></PrivateRoute>} />
        <Route path="/all" element={<PrivateRoute allowedRoles={["Teacher"]}><FinalPreview /></PrivateRoute>} />
        <Route path="/question-preview" element={<PrivateRoute allowedRoles={["Teacher"]}><QuestionPreview /></PrivateRoute>} />
        <Route path="/paper-status" element={<PrivateRoute allowedRoles={["Teacher"]}><PaperStatus /></PrivateRoute>} />
        <Route path="/preview/:subjectKey" element={<PrivateRoute allowedRoles={["Teacher"]}><QuestionPreview /></PrivateRoute>} />
        <Route path="/mypapers" element={<PrivateRoute allowedRoles={["Teacher"]}><MyPapers /></PrivateRoute>} />
        <Route path="/answer-keys" element={<PrivateRoute allowedRoles={["Teacher"]}><AnswerKey /></PrivateRoute>} />
        <Route path="/entrance-exam" element={<PrivateRoute allowedRoles={["Teacher"]}><EntranceExamSide/></PrivateRoute>} />
        <Route path="/admin/papers/approval" element={<PrivateRoute allowedRoles={["Admin","SuperAdmin"]}><EntranceAdminApprovalPage/></PrivateRoute>} />
       

        {/* ✅ Admin & SuperAdmin Routes */}
        <Route path="/admin-dashboard" element={<PrivateRoute allowedRoles={["Admin"]}><AdminDashboard /></PrivateRoute>} />
        <Route path="/view-reset-requests" element={<PrivateRoute allowedRoles={["Admin", "SuperAdmin"]}><ResetRequests /></PrivateRoute>} />
        <Route path="/manage-users" element={<PrivateRoute allowedRoles={["Admin", "SuperAdmin"]}><ManageUsers /></PrivateRoute>} />
        <Route path="/paper-approvals" element={<PrivateRoute allowedRoles={["Admin", "SuperAdmin"]}><PaperApprovals /></PrivateRoute>} />

        {/* ✅ SuperAdmin Routes */}
        <Route path="/super-admin-panel" element={<PrivateRoute allowedRoles={["SuperAdmin"]}><SuperAdminPanel /></PrivateRoute>} />
        <Route path="/view-all-users" element={<PrivateRoute allowedRoles={["SuperAdmin"]}><ViewAllUsers /></PrivateRoute>} />
        <Route path="/system-settings" element={<PrivateRoute allowedRoles={["SuperAdmin"]}><SystemSettings /></PrivateRoute>} />

        {/* ✅ Isaac File Routes */}
        <Route path="/index" element={<PrivateRoute allowedRoles={["Teacher"]}><IndexPage /></PrivateRoute>} />
        <Route path="/questions" element={<PrivateRoute allowedRoles={["Teacher"]}><QuestionEntryPage /></PrivateRoute>} />
        <Route path="/preview" element={<PrivateRoute allowedRoles={["Teacher"]}><PreviewPage /></PrivateRoute>} />
        <Route path="/final-paper" element={<PrivateRoute allowedRoles={["Teacher"]}><FinalPaperPage /></PrivateRoute>} />
        <Route path="/answer-key" element={<PrivateRoute allowedRoles={["Teacher"]}><AnswerKeyPage /></PrivateRoute>} />
        <Route path="/open-electives" element={<PrivateRoute allowedRoles={["Teacher"]}><OpenElectiveSide/></PrivateRoute>} />
        <Route path="/approvalelectives" element={<PrivateRoute allowedRoles={["Admin", "SuperAdmin"]}><PaperApprovals /></PrivateRoute>} />

        {/* ✅ Roshan Existing Routes */}
        <Route path="/mainp" element={<PrivateRoute allowedRoles={["Teacher"]}><MainPage /></PrivateRoute>} />
        <Route path="/subjectselection" element={<PrivateRoute allowedRoles={["Teacher"]}><SubjectSelection /></PrivateRoute>} />
        <Route path="/unitchoose" element={<PrivateRoute allowedRoles={["Teacher"]}><UnitChoose /></PrivateRoute>} />
        <Route path="/questionentrymidsem" element={<PrivateRoute allowedRoles={["Teacher"]}><QuestionEntrymidsem /></PrivateRoute>} />
        <Route path="/previewpagemidsem" element={<PrivateRoute allowedRoles={["Teacher"]}><PreviewPagemidsem /></PrivateRoute>} />
        <Route path="/createpapermidsem" element={<PrivateRoute allowedRoles={["Teacher"]}><CreatePapermidsem /></PrivateRoute>} />
        <Route path="/viewpaper/:id" element={<PrivateRoute allowedRoles={["Teacher"]}><ViewPaper /></PrivateRoute>} />
        <Route path="/modalrosh" element={<PrivateRoute allowedRoles={["Teacher"]}><ModalRosh/></PrivateRoute>} />
        <Route path="/midsemester" element={<PrivateRoute allowedRoles={["Teacher"]}><MidSemSide/></PrivateRoute>} />
        <Route path="/approvalmid" element={<PrivateRoute allowedRoles={["Admin", "SuperAdmin"]}><PaperApprovals_Midsem /></PrivateRoute>} />

        {/* ✅ Dino Existing Routes */}
        <Route path="/selected-marks" element={<PrivateRoute allowedRoles={["Teacher"]}><SelectMarks /></PrivateRoute>} />
        <Route path="/input-questions" element={<PrivateRoute allowedRoles={["Teacher"]}><SelectParts /></PrivateRoute>} />
        <Route path="/create-question" element={<PrivateRoute allowedRoles={["Teacher"]}><CreateQuestion /></PrivateRoute>} />
        <Route path="/edit-question" element={<PrivateRoute allowedRoles={["Teacher"]}><EditQuestion /></PrivateRoute>} />
        <Route path="/create-papers" element={<PrivateRoute allowedRoles={["Teacher"]}><CreatePapers /></PrivateRoute>} />
        <Route path="/exam-details" element={<PrivateRoute allowedRoles={["Teacher"]}><ExamDetails /></PrivateRoute>} />
        <Route path="/exam-pattern" element={<PrivateRoute allowedRoles={["Teacher"]}><ExamPattern /></PrivateRoute>} />
        <Route path="/question-pool" element={<PrivateRoute allowedRoles={["Teacher"]}><QuestionPool /></PrivateRoute>} />
        <Route path="/end-semester" element={<PrivateRoute allowedRoles={["Teacher"]}><EndSemSide/></PrivateRoute>} />
        <Route path="/approvalend" element={<PrivateRoute allowedRoles={["Admin", "SuperAdmin"]}><PaperApprovals_EndSem /></PrivateRoute>} />

        {/* ✅ Redirect Unknown Routes */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
