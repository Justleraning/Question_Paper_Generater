import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, Edit, Trash2, Eye, Send, Plus, ChevronDown, ChevronRight, Filter, X, Save, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  getMyPapers, 
  deletePaper, 
  sendPaperForApproval,
  updatePaper,
  updatePaperQuestions
} from '../../services/paperService.js';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, ImageRun, VerticalAlign } from 'docx';
import { saveAs } from 'file-saver';
import universityLogo from '../../assets/image.png';
import fetch from 'cross-fetch';

const EntranceExamSide = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPaper, setExpandedPaper] = useState(null);
  const [notification, setNotification] = useState(null);
  const [downloadFormat, setDownloadFormat] = useState('pdf');
  const [showDownloadOptions, setShowDownloadOptions] = useState({});
  
  // Auto-refresh setup (hidden from UI)
  const autoRefreshIntervalRef = useRef(null);
  const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds refresh interval
  
  // Modal states for viewing paper
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  
  // Filters state - only keeping status
  const [filters, setFilters] = useState({
    status: ''
  });
  
  // Show filters UI
  const [showFilters, setShowFilters] = useState(false);

  // State for inline editing paper details
  const [editingPaper, setEditingPaper] = useState(null);
  const [editFormData, setEditFormData] = useState({
    courseName: '',
    customSubjectName: '',
    totalMarks: 0,
    examTime: 1
  });

  // State for editing questions
  const [showQuestionEditModal, setShowQuestionEditModal] = useState(false);
  const [editingPaperQuestions, setEditingPaperQuestions] = useState(null);
  const [editedQuestions, setEditedQuestions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Setup auto-refresh on component mount and cleanup on unmount
  useEffect(() => {
    // Initial data fetch
    fetchPapers();
    
    // Setup auto-refresh interval
    startAutoRefresh();
    
    // Cleanup function to clear interval when component unmounts
    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, [filters]); // Re-run when filters change

  // Function to start auto-refresh
  const startAutoRefresh = () => {
    // Clear any existing interval first
    if (autoRefreshIntervalRef.current) {
      clearInterval(autoRefreshIntervalRef.current);
    }
    
    // Set up new interval
    autoRefreshIntervalRef.current = setInterval(() => {
      if (!showViewModal && !showQuestionEditModal) { // Don't refresh if modals are open
        fetchPapers(true); // true flag indicates it's an auto-refresh
      }
    }, AUTO_REFRESH_INTERVAL);
  };

  // Function to fetch papers from the backend with filters
  const fetchPapers = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setLoading(true);
      }
      
      const response = await getMyPapers(filters);
      
      if (response && response.success && response.papers) {
        // Check if there's a change in paper status (like approval/rejection) to show notifications
        if (isAutoRefresh && papers.length > 0) {
          // Find papers with changed status
          const statusChanges = response.papers.filter(newPaper => {
            const oldPaper = papers.find(p => p._id === newPaper._id);
            return oldPaper && oldPaper.status !== newPaper.status;
          });

          if (statusChanges.length > 0) {
            // Notify about status changes
            const changedPaper = statusChanges[0]; // Just show notification for the first one if multiple changed
            setNotification(`Paper "${changedPaper.courseName}" ${changedPaper.status === 'Approved' ? 'approved' : changedPaper.status === 'Rejected' ? 'rejected' : 'status updated'}`);
            
            // Play a notification sound if browser supports it
            try {
              const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...');
              audio.volume = 0.5;
              audio.play();
            } catch (soundError) {
              console.log('Notification sound not supported');
            }
          }
        }
        
        setPapers(response.papers);
      } else {
        setPapers([]);
      }
    } catch (err) {
      console.error('Error fetching papers:', err);
      if (!isAutoRefresh) {
        setError('Failed to load papers. Please try again.');
      }
      setPapers([]);
    } finally {
      if (!isAutoRefresh) {
        setLoading(false);
      }
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: ''
    });
  };

  // Manual refresh button handler
  const handleManualRefresh = () => {
    fetchPapers();
  };

  // Toggle expanded view for a paper
  const toggleExpandPaper = (paperId) => {
    setExpandedPaper(expandedPaper === paperId ? null : paperId);
  };

  // View paper details in a modal
  const handleViewPaper = (paper, event) => {
    if (event) event.stopPropagation();
    setSelectedPaper(paper);
    setShowViewModal(true);
  };

  // Close the view modal
  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedPaper(null);
  };

  // Open the question edit modal
  const handleEditQuestions = (paper, event) => {
    if (event) event.stopPropagation();
    
    // Deep clone the questions to avoid direct state mutation
    const clonedQuestions = paper.questions ? JSON.parse(JSON.stringify(paper.questions)) : [];
    
    setEditingPaperQuestions(paper);
    setEditedQuestions(clonedQuestions);
    
    // Set initial selected subject if questions exist
    if (clonedQuestions.length > 0) {
      const subjects = [...new Set(clonedQuestions.map(q => q.subject))];
      setSelectedSubject(subjects[0]);
    } else {
      setSelectedSubject(null);
    }
    
    setShowQuestionEditModal(true);
  };

  // Close the question edit modal
  const closeQuestionEditModal = () => {
    setShowQuestionEditModal(false);
    setEditingPaperQuestions(null);
    setEditedQuestions([]);
    setSelectedSubject(null);
    setEditingQuestion(null);
  };

  // Handle question field change
  const handleQuestionChange = (questionId, field, value) => {
    setEditedQuestions(prev => 
      prev.map(q => 
        q._id === questionId ? { ...q, [field]: value } : q
      )
    );
  };

  // Handle option change
  const handleOptionChange = (questionId, optionIndex, value) => {
    setEditedQuestions(prev => 
      prev.map(q => {
        if (q._id === questionId) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = { ...newOptions[optionIndex], value };
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  // Start editing a specific question
  const startEditingQuestion = (questionId) => {
    setEditingQuestion(questionId);
  };

  // Cancel editing a specific question
  const cancelEditingQuestion = () => {
    setEditingQuestion(null);
  };

  // Save edited questions to backend
  const saveEditedQuestions = async () => {
    try {
      setLoading(true);
      
      // Validate questions
      if (editedQuestions.length === 0) {
        setError('No questions to save.');
        setLoading(false);
        return;
      }
      
      // Check for empty question text
      const hasEmptyQuestions = editedQuestions.some(q => !q.question || q.question.trim() === '');
      if (hasEmptyQuestions) {
        setError('All questions must have text.');
        setLoading(false);
        return;
      }
      
      // Send update request
      const response = await updatePaperQuestions(editingPaperQuestions._id, editedQuestions);
      
      if (response && response.success) {
        // Update papers list with edited questions
        setPapers(papers.map(paper => 
          paper._id === editingPaperQuestions._id 
            ? { ...paper, questions: editedQuestions } 
            : paper
        ));
        
        setNotification('Questions updated successfully!');
        closeQuestionEditModal();
      } else {
        setError(response?.message || 'Failed to update questions.');
      }
    } catch (err) {
      console.error('Error updating questions:', err);
      setError('Failed to update questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click for paper details
  const handleEditPaper = (paper, event) => {
    if (event) event.stopPropagation();
    
    // Set editing paper and form data
    setEditingPaper(paper._id);
    setEditFormData({
      courseName: paper.courseName || '',
      customSubjectName: paper.customSubjectName || '',
      totalMarks: paper.totalMarks || 0,
      examTime: paper.examTime || 1
    });
    
    // Expand the paper if it's not already expanded
    if (expandedPaper !== paper._id) {
      setExpandedPaper(paper._id);
    }
  };

  // Handle form field changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  // Cancel editing paper details
  const cancelEditing = () => {
    setEditingPaper(null);
    setEditFormData({
      courseName: '',
      customSubjectName: '',
      totalMarks: 0,
      examTime: 1
    });
  };

  // Save edited paper metadata
  const saveEditedPaper = async (paperId) => {
    try {
      setLoading(true);
      
      // Validate form data
      if (!editFormData.courseName.trim()) {
        setError('Course name is required.');
        setLoading(false);
        return;
      }
      
      if (isNaN(editFormData.totalMarks) || editFormData.totalMarks <= 0) {
        setError('Total marks must be a positive number.');
        setLoading(false);
        return;
      }
      
      if (isNaN(editFormData.examTime) || editFormData.examTime <= 0) {
        setError('Exam time must be a positive number.');
        setLoading(false);
        return;
      }
      
      // Send update request
      const response = await updatePaper(paperId, editFormData);
      
      if (response && response.success) {
        // Update papers list with edited data
        setPapers(papers.map(paper => 
          paper._id === paperId 
            ? { ...paper, ...editFormData } 
            : paper
        ));
        
        setNotification('Paper updated successfully!');
        cancelEditing(); // Exit edit mode
      } else {
        setError(response?.message || 'Failed to update paper.');
      }
    } catch (err) {
      console.error('Error updating paper:', err);
      setError('Failed to update paper. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Download paper
  const handleDownloadPaper = async (paper, format) => {
    try {
      // Hide download options
      setShowDownloadOptions(prev => ({...prev, [paper._id]: false}));
      
      // Set notification
      setNotification(`Downloading ${paper.courseName} paper in ${format.toUpperCase()} format...`);
      
      // Generate file name
      const fileName = `${paper.courseName}${paper.customSubjectName ? '_' + paper.customSubjectName : ''}_${paper.totalMarks}marks`;
      
      // Generate and download the document based on format
      if (format === 'pdf') {
        generatePDF(paper, fileName);
      } else if (format === 'docx') {
        await generateDOCX(paper, fileName);
      }
      
      // Clear notification after a delay
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error downloading paper:', error);
      setError(`Failed to download paper in ${format.toUpperCase()} format.`);
      setTimeout(() => setError(null), 3000);
    }
  };

  // Generate PDF document
  const generatePDF = (paper, fileName) => {
    try {
      const doc = new jsPDF();
      
      // Add university logo - adjust size and position to avoid overlap
      try {
        // Position the logo to the left side to avoid text overlap
        doc.addImage(universityLogo, 'PNG', 15, 10, 15, 15);
      } catch (logoErr) {
        console.warn("Could not add logo:", logoErr);
      }
      
      // Move the text to the right to avoid logo overlap
      doc.setFontSize(16);
      doc.text("ST. JOSEPH'S UNIVERSITY, BENGALURU - 27", 110, 15, { align: 'center' });
      doc.setFontSize(14);
      
      // Show both courseName and customSubjectName
      const courseDisplay = paper.customSubjectName 
        ? `${paper.courseName} - ${paper.customSubjectName}` 
        : paper.courseName;
      
      doc.text(`Course: ${courseDisplay}`, 110, 25, { align: 'center' });
      doc.text("SEMESTER EXAMINATION", 110, 35, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Date: ${formatDate(paper.date || paper.createdAt)}`, 20, 45);
      doc.text(`Time: ${paper.examTime || 1} Hours`, 20, 52);
      
      // Use the configured mark type
      doc.text(`Max Marks: ${paper.totalMarks}`, 180, 52, { align: 'right' });
      
      doc.text("Answer all questions", 110, 60, { align: 'center' });
      
      // Process questions
      let y = 75;
      let questionNumber = 1;
      let currentSubject = null;
      
      // Generate PDF content
      if (paper.questions && paper.questions.length > 0) {
        paper.questions.forEach((q) => {
          // Add new subject header
          if (q.subject !== currentSubject) {
            if (currentSubject !== null) {
              doc.addPage();
              y = 20;
            }
            
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(q.subject, 105, y, { align: 'center' });
            y += 10;
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            currentSubject = q.subject;
          }
          
          // Add page if needed
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          
          // Add question text
          doc.text(`${questionNumber}. ${stripHTMLTags(q.question)}`, 20, y);
          y += 10;
          questionNumber++;
          
          // Add options
          if (q.options && Array.isArray(q.options)) {
            q.options.forEach((opt, optIndex) => {
              if (opt && opt.value) {
                if (y > 270) {
                  doc.addPage();
                  y = 20;
                }
                
                doc.text(`   ${['A', 'B', 'C', 'D'][optIndex]}. ${stripHTMLTags(opt.value)}`, 30, y);
                y += 10;
              }
            });
          }
          
          y += 5;
        });
      }
      
      doc.save(`${fileName}.pdf`);
      setNotification("PDF downloaded successfully!");
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Failed to generate PDF. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Generate DOCX document
  const generateDOCX = async (paper, fileName) => {
    try {
      // Logo import and base64 conversion
      let logoBase64;
      try {
        // Use fetch to load the image as a blob
        const response = await fetch(universityLogo);
        const blob = await response.blob();
        
        // Convert blob to base64
        logoBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (logoError) {
        console.warn("Could not convert logo to base64:", logoError);
      }

      const children = [];
      
      // Add university logo and name
      if (logoBase64) {
        children.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: Uint8Array.from(atob(logoBase64), c => c.charCodeAt(0)),
                transformation: {
                  width: 120,
                  height: 120
                },
                alignment: AlignmentType.CENTER
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          })
        );
      }

      
      // University Name
      children.push(
        new Paragraph({
          text: "ST. JOSEPH'S UNIVERSITY, BENGALURU - 27",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          bold: true,
          spacing: { after: 200 }
        })
      );
      
      // Course Name
      children.push(
        new Paragraph({
          text: paper.customSubjectName 
            ? `${paper.courseName} - ${paper.customSubjectName}`
            : paper.courseName,
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.CENTER,
          bold: true,
          spacing: { before: 200, after: 200 }
        })
      );
      
      // SEMESTER EXAMINATION
      children.push(
        new Paragraph({
          text: "SEMESTER EXAMINATION",
          heading: HeadingLevel.HEADING_3,
          alignment: AlignmentType.CENTER,
          bold: true,
          spacing: { after: 300 }
        })
      );
      
      // Date, Time and Marks
      children.push(
        new Paragraph({
          text: `Date: ${formatDate(paper.date || paper.createdAt)}`,
          alignment: AlignmentType.LEFT,
          spacing: { after: 100 }
        })
      );
      
      children.push(
        new Paragraph({
          text: `Time: ${paper.examTime || 1} Hours`,
          alignment: AlignmentType.LEFT,
          spacing: { after: 100 }
        })
      );
      
      children.push(
        new Paragraph({
          text: `Max Marks: ${paper.totalMarks}`,
          alignment: AlignmentType.LEFT,
          spacing: { after: 200 }
        })
      );
      
      // Answer all questions
      children.push(
        new Paragraph({
          text: "Answer all questions",
          alignment: AlignmentType.CENTER,
          bold: true,
          spacing: { before: 200, after: 400 }
        })
      );
      
      // Process questions by subject
      if (paper.questions && paper.questions.length > 0) {
        let currentSubject = null;
        let questionNumber = 1;
        
        // Group questions by subject
        const subjectGroups = {};
        paper.questions.forEach(q => {
          const subjectName = q.subject || 'Unknown';
          if (!subjectGroups[subjectName]) {
            subjectGroups[subjectName] = [];
          }
          subjectGroups[subjectName].push(q);
        });
        
        // Process each subject group
        Object.entries(subjectGroups).forEach(([subjectName, subjectQuestions]) => {
          // Add subject header
          children.push(
            new Paragraph({
              text: subjectName,
              heading: HeadingLevel.HEADING_2,
              alignment: AlignmentType.LEFT,
              bold: true,
              spacing: { before: 400, after: 200 }
            })
          );
          
          // Process questions
          subjectQuestions.forEach((q) => {
            // Question text
            children.push(
              new Paragraph({
                text: `${questionNumber}. ${stripHTMLTags(q.question)}`,
                spacing: { before: 200, after: 100 }
              })
            );
            
            // Options
            if (q.options && Array.isArray(q.options)) {
              q.options.forEach((opt, optIdx) => {
                if (opt && opt.value) {
                  children.push(
                    new Paragraph({
                      text: `   ${['A', 'B', 'C', 'D'][optIdx]}. ${stripHTMLTags(opt.value)}`,
                      indent: { left: 500 },
                      spacing: { after: 100 }
                    })
                  );
                }
              });
            }
            
            questionNumber++;
          });
        });
      }
      
      const doc = new Document({
        sections: [{ children }]
      });

      // Generate the document
      Packer.toBlob(doc).then(blob => {
        saveAs(blob, `${fileName}.docx`);
        setNotification("DOCX downloaded successfully!");
        setTimeout(() => setNotification(null), 3000);
      });
    } catch (error) {
      console.error("Error generating DOCX:", error);
      setError("Failed to generate DOCX. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  };

  // Toggle download options
  const toggleDownloadOptions = (paperId, event) => {
    if (event) event.stopPropagation();
    setShowDownloadOptions(prev => ({
      ...prev,
      [paperId]: !prev[paperId]
    }));
  };

  // Delete paper
  const handleDeletePaper = async (paperId, event) => {
    // Stop event propagation to prevent expanding/collapsing when clicking delete
    if (event) event.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this paper?')) return;
    
    try {
      setLoading(true);
      const response = await deletePaper(paperId);
      
      if (response && response.success) {
        // First update the local state to reflect changes immediately
        setPapers(prevPapers => prevPapers.filter(paper => paper._id !== paperId));

        // Then refresh papers list from server
        await fetchPapers();
        setNotification('Paper deleted successfully!');
      } else {
        setError(response?.message || 'Failed to delete paper. Please try again.');
      }
      
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Error deleting paper:', err);
      setError('Failed to delete paper. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Send for approval
  const handleSendForApproval = async (paper, event) => {
    if (event) event.stopPropagation();
    // Show confirmation dialog
    const confirmSend = window.confirm('Are you sure you want to send this paper for approval?');
    if (!confirmSend) return;
    
    try {
      setLoading(true);
      const result = await sendPaperForApproval(paper._id);
      
      if (result && result.success) {
        // First update the local state to reflect changes immediately
        setPapers(prevPapers => 
          prevPapers.map(p => 
            p._id === paper._id 
              ? { ...p, status: 'Pending Approval' } 
              : p
          )
        );

        setNotification('Paper sent for approval successfully!');
        
        // Then refresh papers list from server
        await fetchPapers();
      } else {
        setError(result?.message || 'Failed to send paper for approval.');
      }
    } catch (err) {
      console.error('Error sending paper for approval:', err);
      setError('An error occurred while sending paper for approval.');
    } finally {
      setLoading(false);
    }
    
    setTimeout(() => setNotification(null), 3000);
  };

  // Get status badge based on paper status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Not Sent':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Not Sent</span>;
      case 'Pending Approval':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending Approval</span>;
      case 'Approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Approved</span>;
      case 'Rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Unknown</span>;
    }
  };

  // Count questions by subject
  const countSubjectQuestions = (questions) => {
    const counts = {};
    if (!questions || !Array.isArray(questions)) return counts;
    
    questions.forEach(question => {
      const subject = question.subject || 'Unknown';
      counts[subject] = (counts[subject] || 0) + 1;
    });
    
    return counts;
  };

  // Format date string
  const formatDate = (dateString) => {
    try {
      // Check if date is valid before formatting
      if (!dateString) return 'N/A';
      
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString();
    } catch (e) {
      return dateString || 'N/A';
    }
  };

  // Helper function to strip HTML tags
  const stripHTMLTags = (html) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Entrance Exam Papers</h1>
        
        <div className="flex items-center space-x-2">
          {/* Manual refresh button */}
          <button
            onClick={handleManualRefresh}
            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
            title="Refresh"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition flex items-center gap-1"
          >
            <Filter size={18} />
            <span>Filter by Status</span>
            {filters.status && (
              <span className="ml-1 bg-blue-700 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                1
              </span>
            )}
          </button>
          
          <button
            onClick={() => navigate('/papers/create')}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-1"
          >
            <Plus size={18} />
            <span>New Paper</span>
          </button>
        </div>
      </div>

      {/* Status Filter Only */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Filter by Status</h2>
            {filters.status && (
              <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear Filter
            </button>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">All Statuses</option>
            <option value="Not Sent">Not Sent</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>
    )}

    {/* Notification */}
    {notification && (
      <div className="w-full mb-4 p-3 bg-blue-100 border border-blue-300 text-blue-800 rounded flex justify-between items-center">
        <span>{notification}</span>
        <button 
          onClick={() => setNotification(null)}
          className="text-blue-800 font-bold"
        >
          ×
        </button>
      </div>
    )}

    {/* Error message */}
    {error && (
      <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex justify-between items-center">
        <span>{error}</span>
        <button 
          onClick={() => setError(null)}
          className="text-red-700 font-bold"
        >
          ×
        </button>
      </div>
    )}

    {/* Loading indicator */}
    {loading ? (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    ) : (
      <>
        {/* Papers List */}
        {papers.length > 0 ? (
          <div className="grid gap-4">
            {papers.map((paper) => {
              const questionCounts = countSubjectQuestions(paper.questions);
              const hasSubjects = Object.keys(questionCounts).length > 0;
              const totalQuestions = paper.questions?.length || 0;
              const isEditing = editingPaper === paper._id;
              
              return (
              <div 
                key={paper._id} 
                className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Paper Header - Always visible */}
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer border-b"
                  onClick={() => !isEditing && toggleExpandPaper(paper._id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <FileText className="text-blue-500 w-7 h-7" />
                    </div>
                    <div>
                    <h2 className="text-xl font-semibold text-gray-800">
{paper.courseName}
{paper.customSubjectName && ` - ${paper.customSubjectName}`}
</h2>
<p className="text-sm text-gray-600 mt-1">
<span className="inline-flex items-center bg-purple-100 text-purple-800 px-2 py-1 rounded mr-2">
  {paper.totalMarks} Marks
</span>
<span className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded">
  {totalQuestions} Questions
</span>
<span className="ml-2">
  {getStatusBadge(paper.status || 'Not Sent')}
</span>
</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-4 text-right">
                      <p className="text-sm text-gray-500">
                        Created: {formatDate(paper.date || paper.createdAt)}
                      </p>
                    </div>
                    <div className="text-gray-400">
                      {expandedPaper === paper._id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                  </div>
                </div>
                
                {/* Expanded View */}
                {expandedPaper === paper._id && (
                  <div className="p-4 bg-gray-50 border-b">
                    {/* Paper Details - Normal View vs Editing View */}
                    {isEditing ? (
                      // Editing Form
                      <div className="mb-4 bg-white p-4 rounded border">
                        <h3 className="text-lg font-semibold mb-4">Edit Paper Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Course Name*
                            </label>
                            <input
                              type="text"
                              name="courseName"
                              value={editFormData.courseName}
                              onChange={handleEditFormChange}
                              className="w-full p-2 border border-gray-300 rounded-md"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Subject Name (Optional)
                            </label>
                            <input
                              type="text"
                              name="customSubjectName"
                              value={editFormData.customSubjectName}
                              onChange={handleEditFormChange}
                              className="w-full p-2 border border-gray-300 rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Total Marks*
                            </label>
                            <input
                              type="number"
                              name="totalMarks"
                              value={editFormData.totalMarks}
                              onChange={handleEditFormChange}
                              min="1"
                              className="w-full p-2 border border-gray-300 rounded-md"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Exam Time (Hours)*
                            </label>
                            <input
                              type="number"
                              name="examTime"
                              value={editFormData.examTime}
                              onChange={handleEditFormChange}
                              min="0.5"
                              step="0.5"
                              className="w-full p-2 border border-gray-300 rounded-md"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end mt-4 space-x-2">
                          <button
                            onClick={cancelEditing}
                            className="px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition flex items-center gap-1"
                          >
                            <XCircle size={16} />
                            <span>Cancel</span>
                          </button>
                          <button
                            onClick={() => saveEditedPaper(paper._id)}
                            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-1"
                          >
                            <Save size={16} />
                            <span>Save Changes</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Normal View
                      <div className="mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white p-3 rounded border">
                            <h3 className="text-sm font-medium text-gray-500">Course</h3>
                            <p className="font-semibold">{paper.courseName}</p>
                          </div>
                          {paper.customSubjectName && (
                            <div className="bg-white p-3 rounded border">
                              <h3 className="text-sm font-medium text-gray-500">Subject</h3>
                              <p className="font-semibold">{paper.customSubjectName}</p>
                            </div>
                          )}
                          <div className="bg-white p-3 rounded border">
                            <h3 className="text-sm font-medium text-gray-500">Total Marks</h3>
                            <p className="font-semibold">{paper.totalMarks}</p>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <h3 className="text-sm font-medium text-gray-500">Exam Time</h3>
                            <p className="font-semibold">{paper.examTime || 1} Hours</p>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <h3 className="text-sm font-medium text-gray-500">Created On</h3>
                            <p className="font-semibold">{formatDate(paper.date || paper.createdAt)}</p>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <h3 className="text-sm font-medium text-gray-500">Status</h3>
                            <p className="font-semibold">{getStatusBadge(paper.status || 'Not Sent')}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Don't show these sections during editing */}
                    {!isEditing && (
                      <>
                        {/* Rejection comments if applicable */}
                        {paper.status === 'Rejected' && paper.reviewComments && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <h3 className="text-md font-semibold mb-1 text-red-700">Rejection Reason:</h3>
                            <p className="text-red-800">{paper.reviewComments}</p>
                          </div>
                        )}
                        
                        {/* Subject breakdown */}
                        {hasSubjects && (
                          <div className="mb-4">
                            <h3 className="text-md font-semibold mb-2">Question Distribution</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                              {Object.entries(questionCounts).map(([subject, count]) => (
                                <div key={subject} className="bg-white px-3 py-2 rounded border flex justify-between">
                                  <span className="text-gray-700">{subject}</span>
                                  <span className="font-semibold">{count} questions</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Only Edit Questions Button - removed View all questions button */}
                        <div className="mb-4 flex flex-wrap justify-center gap-3">
                          <button 
                            onClick={(e) => handleEditQuestions(paper, e)}
                            className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition flex items-center gap-1"
                          >
                            <Edit size={16} />
                            <span>Edit Questions</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-1 p-3 bg-gray-50 border-t">
                  {/* Only show edit controls if currently editing */}
                  {isEditing ? (
                    <>
                      <button 
                        onClick={cancelEditing}
                        className="text-gray-500 hover:bg-gray-50 p-2 rounded-full transition-colors flex items-center"
                        title="Cancel"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => saveEditedPaper(paper._id)}
                        className="text-green-500 hover:bg-green-50 p-2 rounded-full transition-colors flex items-center"
                        title="Save Changes"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="relative mr-1">
                        <button 
                          onClick={(e) => toggleDownloadOptions(paper._id, e)}
                          className="text-green-500 hover:bg-green-50 p-2 rounded-full transition-colors flex items-center"
                          title="Download"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        
                        {showDownloadOptions[paper._id] && (
                          <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-10">
                            <div className="p-2">
                              <div className="mb-2">
                                <label className="flex items-center text-sm">
                                  <input 
                                    type="radio" 
                                    name={`downloadFormat-${paper._id}`} 
                                    checked={downloadFormat === 'pdf'} 
                                    onChange={() => setDownloadFormat('pdf')} 
                                    className="mr-2" 
                                  />
                                  PDF Format
                                </label>
                              </div>
                              <div className="mb-2">
                                <label className="flex items-center text-sm">
                                  <input 
                                    type="radio" 
                                    name={`downloadFormat-${paper._id}`} 
                                    checked={downloadFormat === 'docx'} 
                                    onChange={() => setDownloadFormat('docx')} 
                                    className="mr-2" 
                                  />
                                  DOCX Format
                                </label>
                              </div>
                              <div className="flex justify-end mt-2">
                                <button 
                                  onClick={() => handleDownloadPaper(paper, downloadFormat)} 
                                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded"
                                >
                                  Download
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <button 
                        onClick={(e) => handleViewPaper(paper, e)}
                        className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors"
                        title="View"
                      >
                       <Eye className="w-5 h-5" />
                      </button>
                      
                      <button 
                        onClick={(e) => handleEditPaper(paper, e)}
                        className="text-yellow-500 hover:bg-yellow-50 p-2 rounded-full transition-colors"
                        title="Edit Details"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      
                      <button 
                        onClick={(e) => handleDeletePaper(paper._id, e)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      
                      {(paper.status === 'Not Sent' || paper.status === 'Rejected') && (
                        <button 
                          onClick={(e) => handleSendForApproval(paper, e)}
                          className="text-purple-500 hover:bg-purple-50 p-2 rounded-full transition-colors"
                          title="Send for Approval"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )})}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
            <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-xl text-gray-600 mb-4">No entrance exam papers found.</p>
            {filters.status ? (
              <button 
                onClick={clearFilters}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition mx-auto"
              >
                Clear Filter
              </button>
            ) : (
              <button 
                onClick={() => navigate('/papers/create')}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2 mx-auto"
              >
                <Plus size={18} />
                <span>Create New Paper</span>
              </button>
            )}
          </div>
        )}
      </>
    )}
     {/* Paper View Modal */}
     {showViewModal && selectedPaper && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">
              {selectedPaper.courseName}
              {selectedPaper.customSubjectName && ` - ${selectedPaper.customSubjectName}`}
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => handleEditQuestions(selectedPaper, e)}
                className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition flex items-center gap-1"
              >
                <Edit size={16} />
                <span>Edit Questions</span>
              </button>
              <button 
                onClick={closeViewModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {/* Paper Header */}
            <div className="text-center mb-8 pb-8 border-b">
              <div className="flex justify-center mb-4">
                <img src={universityLogo} alt="University Logo" className="h-16" />
              </div>
              <h1 className="text-2xl font-bold mb-2">ST. JOSEPH'S UNIVERSITY, BENGALURU - 27</h1>
              <h2 className="text-xl mb-4">
                {selectedPaper.customSubjectName 
                  ? `${selectedPaper.courseName} - ${selectedPaper.customSubjectName}`
                  : selectedPaper.courseName}
              </h2>
              <p className="text-lg font-medium mb-4">SEMESTER EXAMINATION</p>
              
              <div className="flex justify-between max-w-md mx-auto mt-6">
                <p><span className="font-medium">Date:</span> {formatDate(selectedPaper.date || selectedPaper.createdAt)}</p>
                <p><span className="font-medium">Time:</span> {selectedPaper.examTime || 1} Hours</p>
                <p><span className="font-medium">Marks:</span> {selectedPaper.totalMarks}</p>
              </div>
              
              <p className="mt-4 font-medium">Answer all questions</p>
            </div>
            
            {/* Questions Section */}
            {selectedPaper.questions && selectedPaper.questions.length > 0 ? (
              <div>
                {/* Group questions by subject */}
                {(() => {
                  // Group questions by subject
                  const subjectGroups = {};
                  selectedPaper.questions.forEach(q => {
                    const subjectName = q.subject || 'Unknown';
                    if (!subjectGroups[subjectName]) {
                      subjectGroups[subjectName] = [];
                    }
                    subjectGroups[subjectName].push(q);
                  });
                  
                  // Render each subject group
                  let questionNumber = 1;
                  return Object.entries(subjectGroups).map(([subjectName, questions]) => (
                    <div key={subjectName} className="mb-8">
                      <h3 className="text-lg font-bold mb-4 text-center bg-gray-100 py-2 rounded">
                        {subjectName}
                      </h3>
                      
                      <div className="space-y-6">
                        {questions.map((question, idx) => {
                          const qNum = questionNumber++;
                          return (
                            <div key={question._id || idx} className="border-b pb-4">
                              <p className="mb-2 font-medium">
                                {qNum}. {stripHTMLTags(question.question)}
                              </p>
                              
                              {question.options && Array.isArray(question.options) && (
                                <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                  {question.options.map((option, optionIdx) => (
                                    <div key={optionIdx} className="flex items-start">
                                      <span className="font-medium mr-2">{['A', 'B', 'C', 'D'][optionIdx]}.</span>
                                      <span>{stripHTMLTags(option.value || '')}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No questions found for this paper.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    
    {/* Question Edit Modal */}
    {showQuestionEditModal && editingPaperQuestions && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center z-10">
            <h2 className="text-xl font-bold">
              Edit Questions - {editingPaperQuestions.courseName}
              {editingPaperQuestions.customSubjectName && ` - ${editingPaperQuestions.customSubjectName}`}
            </h2>
            <div className="flex gap-2">
              <button 
                onClick={saveEditedQuestions}
                className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center gap-1"
              >
                <Save size={18} />
                <span>Save All</span>
              </button>
              <button 
                onClick={closeQuestionEditModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {/* No questions message */}
            {(!editedQuestions || editedQuestions.length === 0) ? (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
                <p className="text-xl text-gray-600 mb-4">No questions found in this paper.</p>
              </div>
            ) : (
              <>
                {/* Subject tabs */}
                <div className="mb-6 border-b">
                  <div className="flex flex-wrap gap-2">
                    {[...new Set(editedQuestions.map(q => q.subject))].map(subject => (
                      <button
                        key={subject}
                        onClick={() => setSelectedSubject(subject)}
                        className={`px-4 py-2 rounded-t-lg ${
                          selectedSubject === subject 
                            ? 'bg-blue-100 text-blue-800 border-b-2 border-blue-500' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Questions for selected subject */}
                <div className="space-y-8">
                  {editedQuestions
                    .filter(q => q.subject === selectedSubject)
                    .map((question, index) => (
                      <div 
                        key={question._id} 
                        className="border rounded-lg overflow-hidden bg-white"
                      >
                        <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                          <h3 className="font-medium">Question {index + 1}</h3>
                          <button
                            onClick={() => editingQuestion === question._id ? cancelEditingQuestion() : startEditingQuestion(question._id)}
                            className={`px-3 py-1 rounded flex items-center gap-1 ${
                              editingQuestion === question._id 
                                ? 'bg-gray-200 text-gray-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {editingQuestion === question._id ? (
                              <>
                                <XCircle size={16} />
                                <span>Cancel</span>
                              </>
                            ) : (
                              <>
                                <Edit size={16} />
                                <span>Edit</span>
                              </>
                            )}
                          </button>
                        </div>
                        
                        <div className="p-4">
                          {editingQuestion === question._id ? (
                            // Edit mode
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Question Text*
                                </label>
                                <textarea
                                  value={question.question}
                                  onChange={(e) => handleQuestionChange(question._id, 'question', e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-md min-h-[100px]"
                                  required
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Options
                                </label>
                                <div className="space-y-2">
                                  {question.options && question.options.map((option, optIdx) => (
                                    <div key={optIdx} className="flex items-start gap-2">
                                      <span className="font-medium mt-2">{['A', 'B', 'C', 'D'][optIdx]}.</span>
                                      <textarea
                                        value={option.value || ''}
                                        onChange={(e) => handleOptionChange(question._id, optIdx, e.target.value)}
                                        className="flex-grow p-2 border border-gray-300 rounded-md"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="flex justify-end">
                                <button
                                  onClick={() => cancelEditingQuestion()}
                                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded mr-2"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => cancelEditingQuestion()}
                                  className="px-3 py-1 bg-blue-500 text-white rounded"
                                >
                                  Done
                                </button>
                              </div>
                            </div>
                          ) : (
                            // View mode
                            <>
                              <p className="mb-4">{stripHTMLTags(question.question)}</p>
                              
                              {question.options && Array.isArray(question.options) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-4">
                                  {question.options.map((option, optIdx) => (
                                    <div key={optIdx} className="flex items-start">
                                      <span className="font-medium mr-2">{['A', 'B', 'C', 'D'][optIdx]}.</span>
                                      <span>{stripHTMLTags(option.value || '')}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                  ))}
                </div>
              </>
            )}
          </div>
          
          <div className="sticky bottom-0 bg-white px-6 py-4 border-t flex justify-between items-center">
            <button 
             onClick={closeQuestionEditModal}
             className="px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
           >
             Cancel
           </button>
           <button 
             onClick={saveEditedQuestions}
             className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-1"
           >
             <Save size={18} />
             <span>Save All Changes</span>
           </button>
         </div>
       </div>
     </div>
   )}
 </div>
);
};

export default EntranceExamSide;