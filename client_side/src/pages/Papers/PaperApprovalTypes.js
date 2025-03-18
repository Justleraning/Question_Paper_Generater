import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronLeft, BookOpen, PenTool, GraduationCap, ClipboardList } from 'lucide-react';
import Sidebar from "../../components/Sidebar.js";
import Navbar from "../../components/Navbar.js";
import { useAuth } from "../../Contexts/AuthContext.js";

const PaperApprovalTypes = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  
  // Add state for sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Approval type cards with icons, titles, and descriptions
  const approvalTypes = [
    {
      id: 'entrance',
      icon: <BookOpen className="w-10 h-10 text-blue-500" />,
      title: 'Entrance Exam',
      description: 'Approve entrance examination papers for upcoming admissions',
      color: 'bg-blue-100 hover:bg-blue-200',
      textColor: 'text-blue-800'
    },
    {
      id: 'midsem',
      icon: <PenTool className="w-10 h-10 text-purple-500" />,
      title: 'Mid Semester',
      description: 'Review and approve mid-semester examination papers',
      color: 'bg-purple-100 hover:bg-purple-200',
      textColor: 'text-purple-800'
    },
    {
      id: 'endsem',
      icon: <GraduationCap className="w-10 h-10 text-green-500" />,
      title: 'End Semester',
      description: 'Approve end semester examination papers before final release',
      color: 'bg-green-100 hover:bg-green-200',
      textColor: 'text-green-800'
    },
    {
      id: 'openelective',
      icon: <ClipboardList className="w-10 h-10 text-amber-500" />,
      title: 'Open Elective',
      description: 'Review and approve papers for open elective courses',
      color: 'bg-amber-100 hover:bg-amber-200',
      textColor: 'text-amber-800'
    }
  ];

  // Navigate to the specific approval page with the paper type
  const navigateToApprovalPage = (type) => {
    navigate(`/paper-approvals?type=${type}`);
  };

  // Go back to admin dashboard
  const goBackToDashboard = () => {
    navigate('/admin-dashboard');
  };

  return (
    <div className="flex h-screen">
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}
        isHovered={isHovered}
        setIsHovered={setIsHovered}
      />
      <div className="flex-1 flex flex-col bg-gray-100">
        <Navbar />
        <div className="p-6">
          <button 
            onClick={goBackToDashboard}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Paper Approvals</h1>
            <div className="text-sm bg-blue-100 text-blue-800 p-2 rounded-md">
              <p className="flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                Select paper type to review
              </p>
            </div>
          </div>
          
          <div className="mb-8">
            <p className="text-gray-600">
              Welcome, {authState?.user?.fullName || 'Admin'}. Please select the type of paper you would like to review and approve:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {approvalTypes.map(type => (
              <div
                key={type.id}
                className={`${type.color} p-6 rounded-lg shadow-md cursor-pointer transition-transform transform hover:scale-105`}
                onClick={() => navigateToApprovalPage(type.id)}
              >
                <div className="flex flex-col items-center text-center">
                  {type.icon}
                  <h2 className={`text-xl font-semibold mt-4 ${type.textColor}`}>{type.title}</h2>
                  <p className="text-gray-600 mt-2">{type.description}</p>
                  <button
                    className={`mt-4 px-4 py-2 rounded-md bg-white ${type.textColor} font-medium`}
                  >
                    View Papers
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Approval Status Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                <p className="text-sm text-gray-600">Papers Pending Approval</p>
                <p className="text-2xl font-bold text-blue-600">7</p>
              </div>
              <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                <p className="text-sm text-gray-600">Papers Approved</p>
                <p className="text-2xl font-bold text-green-600">23</p>
              </div>
              <div className="border rounded-lg p-4 bg-red-50 border-red-200">
                <p className="text-sm text-gray-600">Papers Rejected</p>
                <p className="text-2xl font-bold text-red-600">3</p>
              </div>
              <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                <p className="text-sm text-gray-600">Draft Papers</p>
                <p className="text-2xl font-bold text-yellow-600">12</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperApprovalTypes;