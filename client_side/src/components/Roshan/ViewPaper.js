import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ArrowRightLeft, Download, Trash2, Edit, Save, X, Upload } from 'lucide-react';

const stripHtmlTags = (input) => {
  if (!input) return "";
  
  // Create a temporary element to properly decode HTML entities
  const tempElement = document.createElement('div');
  tempElement.innerHTML = input;
  
  // Get the text content which automatically removes HTML tags and decodes entities
  return tempElement.textContent || tempElement.innerText || "";
};

const ViewPaper = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestions, setEditedQuestions] = useState([]);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {

    console.log("📌 Fetching paper with ID:", id);
  
    fetch(`http://localhost:5000/get-questions/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ API Response:", data);
        setPaper(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Error fetching paper:", error);
        setLoading(false);
      });
  }, [id]);

  const saveEdits = async () => {
    try {
      // Ensure we have the full paper data and ID
      if (!paper || !paper._id) {
        throw new Error("Cannot save: Paper ID is missing");
      }
  
      // Create a copy of the paper with updated questions
      const updatedPaperData = {
        ...paper,
        questions: isEditing ? editedQuestions : paper.questions
      };
  
      // Send the entire updated paper to the backend
      const response = await fetch(`http://localhost:5000/update-paper/${paper._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(updatedPaperData)
      });
  
      // Check if the response is successful
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save changes");
      }
  
      // Parse the response
      const updatedPaper = await response.json();
  
      // Update the local state with the returned paper
      setPaper(updatedPaper);
      
      // Exit edit mode
      setIsEditing(false);
  
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.style.position = 'fixed';
      successMessage.style.top = '20px';
      successMessage.style.left = '50%';
      successMessage.style.transform = 'translateX(-50%)';
      successMessage.style.padding = '15px 20px';
      successMessage.style.backgroundColor = '#4CAF50';
      successMessage.style.color = 'white';
      successMessage.style.borderRadius = '5px';
      successMessage.style.zIndex = '9999';
      successMessage.textContent = 'Paper updated successfully!';
      document.body.appendChild(successMessage);
      
      // Remove success message after 3 seconds
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
  
    } catch (error) {
      console.error("Detailed error saving changes:", error);
      
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.style.position = 'fixed';
      errorMessage.style.top = '20px';
      errorMessage.style.left = '50%';
      errorMessage.style.transform = 'translateX(-50%)';
      errorMessage.style.padding = '15px 20px';
      errorMessage.style.backgroundColor = '#dc3545';
      errorMessage.style.color = 'white';
      errorMessage.style.borderRadius = '5px';
      errorMessage.style.zIndex = '9999';
      errorMessage.textContent = `Failed to save changes: ${error.message}`;
      document.body.appendChild(errorMessage);
      
      // Remove error message after 3 seconds
      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 3000);
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    // Reset any active editing
    setEditingQuestionIndex(null);
    setEditText("");
  };

  // Start editing a specific question
  const startEditQuestion = (question, index) => {
    setEditingQuestionIndex(index);
    setEditText(question.text);
  };

  // Cancel edit for a specific question
  const cancelEdit = () => {
    setEditingQuestionIndex(null);
    setEditText("");
  };

  // Save edited question
  const saveQuestionEdit = async () => {
    if (editingQuestionIndex === null || !editText.trim()) {
      return;
    }

    try {
      // Get the specific question being edited
      const questionToUpdate = paper.questions[editingQuestionIndex];
      
      // Send the updated question to the server
      const response = await fetch(`http://localhost:5000/update-question/${questionToUpdate._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editText.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to update question");
      }

      // Create a copy of the paper with the updated question
      const updatedPaper = { ...paper };
      updatedPaper.questions = updatedPaper.questions.map((q, index) => 
        index === editingQuestionIndex ? { ...q, text: editText.trim() } : q
      );
      
      // Update the state
      setPaper(updatedPaper);
      setEditingQuestionIndex(null);
      setEditText("");
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.style.position = 'fixed';
      successMessage.style.top = '20px';
      successMessage.style.left = '50%';
      successMessage.style.transform = 'translateX(-50%)';
      successMessage.style.padding = '15px 20px';
      successMessage.style.backgroundColor = '#4CAF50';
      successMessage.style.color = 'white';
      successMessage.style.borderRadius = '5px';
      successMessage.style.zIndex = '9999';
      successMessage.textContent = 'Question updated successfully!';
      document.body.appendChild(successMessage);
      
      // Remove success message after 3 seconds
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
    } catch (error) {
      console.error("❌ Error updating question:", error);
      alert(`Error: ${error.message}`);
    }
  };

  // Render a question with edit functionality
  const renderQuestion = (q, index, questionNumber) => {
    const isIndividualEditing = editingQuestionIndex === index;
    
    return (
      <div key={index} style={{ 
        textAlign: "left", 
        position: "relative",
        marginBottom: "15px",
        paddingRight: isIndividualEditing ? "40px" : "0"
      }}>
        {isIndividualEditing ? (
          <div className="edit-controls" style={{ marginBottom: "10px" }}>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                minHeight: "100px",
                fontFamily: "Arial, sans-serif",
                fontSize: "14px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                resize: "vertical"
              }}
            />
            <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
              <button onClick={saveQuestionEdit} style={{
                padding: "6px 12px",
                background: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}>
                <Save size={16} /> Save
              </button>
              <button onClick={cancelEdit} style={{
                padding: "6px 12px",
                background: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}>
                <X size={16} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <p style={{ marginBottom: "10px" }}>
            <strong>{questionNumber}.</strong> {stripHtmlTags(q.text)}
            {isEditing && (
              <button
                onClick={() => startEditQuestion(q, index)}
                style={{
                  position: "absolute",
                  right: "0",
                  top: "0",
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer"
                }}
              >
                <Edit size={16} />
              </button>
            )}
          </p>
        )}
      </div>
    );
  };
  
  const handleRandomize = async () => {
    if (!paper || !paper.questions || paper.questions.length <= 18) {
      alert("Not enough questions to randomize. A minimum of 19 is required.");
      return;
    }
  
    try {
      const res = await fetch("http://localhost:5000/api/questions/randomize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: paper.subject }),
      });
  
      if (!res.ok) {
        throw new Error("Failed to randomize questions");
      }
  
      const data = await res.json();
      setPaper(data);
    } catch (error) {
      console.error("❌ Error randomizing questions:", error);
    }
  };
  
  const handleDownload = () => {
    // Show loading indicator
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = '<div class="loading-spinner"></div><div style="margin-top: 20px;">Generating PDF...</div>';
    loadingOverlay.style.position = 'fixed';
    loadingOverlay.style.top = '0';
    loadingOverlay.style.left = '0';
    loadingOverlay.style.width = '100%';
    loadingOverlay.style.height = '100%';
    loadingOverlay.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    loadingOverlay.style.display = 'flex';
    loadingOverlay.style.flexDirection = 'column';
    loadingOverlay.style.alignItems = 'center';
    loadingOverlay.style.justifyContent = 'center';
    loadingOverlay.style.zIndex = '9999';
    document.body.appendChild(loadingOverlay);
    
    // Create spinner style
    const spinnerStyle = document.createElement('style');
    spinnerStyle.textContent = `
      .loading-spinner {
        border: 5px solid #f3f3f3;
        border-top: 5px solid #3498db;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(spinnerStyle);
    
    // Get the paper content element
    const paperElement = document.getElementById("paper-content");
    
    // Create a clone to avoid modifying the original
    const paperClone = paperElement.cloneNode(true);
    
    // Create a container for the clone with specific styling
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '210mm'; // A4 width
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.padding = '0';
    tempContainer.style.margin = '0';
    tempContainer.appendChild(paperClone);
    
    // Append the container to the body
    document.body.appendChild(tempContainer);
    
    // Apply styling to the clone for PDF export
    paperClone.style.width = '100%';
    paperClone.style.padding = '0mm 20mm 20mm 20mm';
    paperClone.style.fontFamily = 'Times New Roman, serif';
    paperClone.style.fontSize = '12pt';
    paperClone.style.lineHeight = '1.5';
    paperClone.style.boxSizing = 'border-box'
    paperClone.style.marginTop = '0'
    paperClone.style.border = 'none';
    paperClone.style.boxShadow = 'none';;
    
    // Remove any UI elements that shouldn't be in the PDF
    const elementsToRemove = tempContainer.querySelectorAll('.edit-btn, .delete-btn, .action-btn, .controls');
    elementsToRemove.forEach(element => {
      element.remove();
    });
    
    // Center headers and titles
    const headerElements = tempContainer.querySelectorAll('h1, h2, h3, .title, .header, .subject-title');
    headerElements.forEach(element => {
      element.style.textAlign = 'center';
      element.style.width = '100%';
      element.style.marginBottom = '40px';
    });
    
    // Format question sections
    const questionElements = tempContainer.querySelectorAll('.question, .question-item');
    questionElements.forEach(element => {
      element.style.marginBottom = '15px';
      element.style.pageBreakInside = 'avoid';
      element.style.clear = 'both';
    });
    
    // Format any images
    const images = tempContainer.querySelectorAll('img');
    images.forEach(img => {
      // Check if this is a logo/university image
      const isLogo = img.src.includes('logo') || 
                    img.className.includes('logo') || 
                    img.closest('.header') || 
                    img.closest('.university-logo') ||
                    img.closest('.logo-container');
                    
      if (isLogo) {
        // Set smaller size for logo
        img.style.maxWidth = '80px';
        img.style.width = '80px';
        img.style.height = 'auto';
        img.style.margin = '0 auto';
        img.style.display = 'block';
      } else {
        // Regular images
        img.style.maxWidth = '45%';
        img.style.height = '45%';
      }
      
      img.crossOrigin = 'Anonymous';
      
      // Force image to be fully loaded
      if (!img.complete) {
        const currentSrc = img.src;
        img.src = '';
        img.src = currentSrc;
      }
    });
    
    // Wait for the DOM updates and images to load
    setTimeout(() => {
      // Use html2canvas to convert to image
      html2canvas(paperClone, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // Additional adjustments to cloned document if needed
          const clonedImages = clonedDoc.querySelectorAll('img');
          clonedImages.forEach(img => {
            img.crossOrigin = 'Anonymous';
          });
        }
      }).then(canvas => {
        // Create PDF
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true
        });
        
        // Get dimensions
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;
        let pageCount = 1;
        
        // Add the image to the PDF (first page)
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, Math.min(imgHeight, pageHeight));
        
        // If content overflows to additional pages
        heightLeft -= pageHeight;
        
        while (heightLeft > 0) {
          position = -pageHeight * pageCount;
          pageCount++;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        // Add page numbers
        for (let i = 1; i <= pageCount; i++) {
          pdf.setPage(i);
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        }
        
        // Get filename from subject or default
        let pdfFilename = 'QuestionPaper';
        try {
          if (typeof paper !== 'undefined' && paper.subject) {
            pdfFilename = `QuestionPaper_${paper.subject}`;
          }
        } catch (e) {
          console.log('Using default filename');
        }
        
        // Save the PDF
        pdf.save(`${pdfFilename}.pdf`);
        
        // Clean up
        document.body.removeChild(tempContainer);
        document.body.removeChild(loadingOverlay);
        document.head.removeChild(spinnerStyle);
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.style.position = 'fixed';
        successMessage.style.top = '20px';
        successMessage.style.left = '50%';
        successMessage.style.transform = 'translateX(-50%)';
        successMessage.style.padding = '15px 20px';
        successMessage.style.backgroundColor = '#4CAF50';
        successMessage.style.color = 'white';
        successMessage.style.borderRadius = '5px';
        successMessage.style.zIndex = '9999';
        successMessage.textContent = 'Question paper downloaded as PDF successfully!';
        document.body.appendChild(successMessage);
        
        // Remove success message after 3 seconds
        setTimeout(() => {
          document.body.removeChild(successMessage);
        }, 3000);
      }).catch(error => {
        console.error('Error generating PDF:', error);
        document.body.removeChild(tempContainer);
        document.body.removeChild(loadingOverlay);
        document.head.removeChild(spinnerStyle);
        
        // Show error message
        alert('There was an error generating the PDF. Please try again.');
      });
    }, 1000); // Longer timeout to ensure everything is properly loaded
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this paper?");
    if (!confirmDelete) return;

    setDeleting(true);

    try {
      const response = await fetch(`http://localhost:5000/delete-paper/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server Error: ${text}`);
      }

      alert("Paper deleted successfully!");
      navigate("/createpapermidsem"); // Navigate back after deletion
    } catch (error) {
      console.error("❌ Error deleting paper:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  
  const handleApproval = async () => {
    try {
      await fetch("http://localhost:5000/api/questions/send-for-approval", { method: "POST" });
      alert("Paper sent for approval!");
    } catch (error) {
      console.error("❌ Error sending for approval:", error);
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", textAlign: "center", background: "rgb(200, 203, 206)", minHeight: "100vh" }}>
      <a href="/midsemester" style={{ textDecoration: "none", color: "#072b52", fontWeight: "bold", fontSize: "18px", display: "inline-block", padding: "15px" }}>
        &#129136; &nbsp; Back
      </a>

      <div style={{ 
        marginTop: "20px", 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '10px' 
      }}>
        <button onClick={handleRandomize} style={{
            padding: "10px 15px",
            background: "#1ece03",
            color: "white",
            border: "none",
            alignItems: "center",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "17px",
            display: "inline-flex",
            gap: '5px',
            marginBottom: '20px'
          }}>
            <ArrowRightLeft size={20} />Randomize
        </button>
        <button onClick={handleDelete} style={{
          padding: "10px 15px",
          fontSize: "17px",
          background: "#dc3545",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          marginBottom: '20px'
        }}>
          <Trash2 size={20} /> 
          Delete Paper
        </button>

        <button onClick={() => {
          setIsEditing(true);
          // Initialize editing state if not already done
          setEditedQuestions(paper.questions || []);
        }} style={{
          padding: "10px 15px",
          background: "#0275d8",
          fontSize: "17px",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          marginBottom: '20px'
        }}>
          <Edit size={20} /> Edit Questions
        </button>

        <button onClick={handleDownload} style={{
          padding: "10px 15px",
          background: "#a600ff",
          fontSize: "17px",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          marginBottom: '20px'
        }}>
          <Download size={20} /> Download
        </button>

        <button onClick={handleApproval} style={{
                padding: "10px 15px",
                background: "rgba(251, 247, 42, 0.88)",
                fontSize: "17px",
                color: "black",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                marginBottom: '20px'
              }}>
                <Upload size={20} /> Send for Approval
          </button>

        {isEditing && (
          <div style={{ display: 'inline-flex', gap: '10px' }}>
          </div>
        )}
      </div>

      <div id="paper-content">
        <div
          style={{
            maxWidth: "800px",
            marginTop: "80px",
            margin: 'auto',
            background: "white",
            padding: "10px 20px",
            boxShadow: '4px 4px 4px 4px rgba(0.2, 0.2, 0.2, 0.2)' 
           }}
        >
          <p style={{ marginLeft: "499px", fontSize: "14px", fontFamily: "verdana, sans-serif"}}> Reg No: </p>
          <p style={{ marginLeft: "499px", fontSize: "14px", fontFamily: "verdana, sans-serif"}}> Date: </p>

          <div
            style={{
              textAlign: "center",
              position: "relative",
              borderBlock: "none",
            }}
          >
            <img 
              src="\sjuniv_logo.png" 
              alt="St. Joseph's University Logo" 
              style={{ maxWidth: "80px", marginBottom: "5px", marginLeft:"330px" }}
            />
            
            <p style={{ fontWeight: "bold", margin: "5px 0", fontSize: "18px" }}>
              ST. JOSEPH'S UNIVERSITY, BENGALURU - 27
            </p>
            <p style={{ fontWeight: "bold", margin: "5px 0", fontSize: "16px" }}>
              BCA - {paper?.semester}
            </p>
            <p style={{ fontWeight: "bold", margin: "10px 0", fontSize: "16px" }}>
              MID SEMESTER EXAMINATION
            </p>
            <p style={{ margin: "10px 0", fontWeight: "bold", fontSize: "16px" }}>
            {paper?.subject}
            </p>
            <p style={{ fontWeight: "bolder", fontSize: "14px" }}>
              ( For current batch students only )
            </p>
          </div>
        </div>
        
        {loading ? (
          <p>Loading...</p>
        ) : paper && paper.questions && paper.questions.length > 0 ? (
          <div
            style={{
              maxWidth: "800px",
              margin: "0 auto",
              background: "white",
              padding: "20px",
              boxShadow: '4px 4px 0px 4px rgba(0.2, 0.2, 0.2, 0.2)',
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: "14.5px", fontFamily: "sans-serif", fontWeight: "bolder" }}>
              Time : 1hr
            </p>
            <p style={{ fontSize: "14.5px", fontFamily: "sans-serif", fontWeight: "bold" }}>
              Max Marks: 30
            </p>
            </div>
            <br></br><br></br>
            <h4 style={{ fontWeight: "bolder", textAlign: "center" }}>PART A</h4>
            <p style={{ fontWeight: "bold", textAlign: "left" }}><em>Answer all FIVE questions (2 * 5 = 10)</em></p>
            {paper.questions.filter(q => q.marks === 2).slice(0, 5).map((q, index) => (
              renderQuestion(q, index, index + 1)
            ))}

            <h4 style={{ fontWeight: "bolder", textAlign: "center", marginTop: "20px" }}>PART B</h4>
            <p style={{ fontWeight: "bold", textAlign: "left" }}><em>Answer any FIVE questions (4 * 5 = 20)</em></p>
            {paper.questions.filter(q => q.marks === 4).slice(0, 6).map((q, index) => (
              renderQuestion(q, index + 5, index + 6)
            ))}
          </div>
        ) : (
          <p>No questions available.</p>
        )}
      </div>
    </div>
  );
};

export default ViewPaper;