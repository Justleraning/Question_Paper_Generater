import React from "react";
import { motion } from "framer-motion";
import { FaEye, FaEdit, FaTrash, FaFileAlt, FaCalendarAlt, FaQuestion, FaTrophy } from "react-icons/fa";

const MyPapersPage = ({ papers, onViewPaper, onEditPaper, onDeletePaper }) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  if (!papers || papers.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
            My Question Papers
          </h1>
          <div className="flex flex-col items-center justify-center py-12">
            <FaFileAlt className="text-gray-300 text-6xl mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No saved papers available yet
            </p>
            <p className="text-gray-400 mt-2">
              Create your first question paper to see it here
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-8">
          My Question Papers
        </h1>
        
        <motion.div 
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {papers.map((paper) => (
            <motion.div
              key={paper._id}
              className="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
              variants={itemVariants}
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                <h2 className="text-xl font-bold text-white truncate">
                  {paper.subjectName}
                </h2>
                <p className="text-blue-100 text-sm">
                  Code: {paper.subjectCode || "N/A"}
                </p>
              </div>
              
              <div className="p-5">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center">
                    <FaTrophy className="text-yellow-500 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Total Marks</p>
                      <p className="font-semibold">{paper.totalMarks}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <FaQuestion className="text-indigo-500 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Questions</p>
                      <p className="font-semibold">{paper.questions.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center mb-5">
                  <FaCalendarAlt className="text-gray-400 mr-2" />
                  <p className="text-gray-600 text-sm">
                    {new Date(paper.createdAt).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                
                <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-600">
                  <button
                    onClick={() => onViewPaper(paper)}
                    className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  >
                    <FaEye className="mr-1" />
                    <span>View</span>
                  </button>
                  
                  <button
                    onClick={() => onEditPaper(paper)}
                    className="flex items-center text-amber-600 hover:text-amber-800 transition-colors duration-200"
                  >
                    <FaEdit className="mr-1" />
                    <span>Edit</span>
                  </button>
                  
                  <button
                    onClick={() => onDeletePaper(paper._id)}
                    className="flex items-center text-red-600 hover:text-red-800 transition-colors duration-200"
                  >
                    <FaTrash className="mr-1" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default MyPapersPage;