import React, { useState, useEffect, useRef } from 'react';
import './CreatePapers.css';

// Question pool data
const questionPool = {
  partA: [
    {
      id: 'a1',
      text: 'List any two features of CLR.',
      type: 'short',
      points: 2,
      alternatives: [
        'Describe the Common Language Runtime in .NET.',
        'Explain the role of CLR in the .NET framework.'
      ]
    },
    {
      id: 'a2',
      text: 'Explain the difference between ref and out parameters in C#.',
      type: 'short',
      points: 2,
      alternatives: [
        'What are the key differences between ref and out keywords in C#?',
        'How do ref and out parameters affect variable initialization in C#?'
      ]
    },
    {
      id: 'a3',
      text: 'How do you prevent a method from being overridden in C#? Write a sample code.',
      type: 'short_code',
      points: 2,
      alternatives: [
        'Explain the purpose of the sealed keyword in C# with an example.',
        'Demonstrate how to make a method that cannot be overridden in derived classes.'
      ]
    },
    {
      id: 'a4',
      text: 'What is the purpose of using the finally block?',
      type: 'short',
      points: 2,
      alternatives: [
        'Explain exception handling in C# with finally block.',
        'Why is the finally block important in exception handling?'
      ]
    },
    {
      id: 'a5',
      text: 'What is the purpose of the SqlConnection class in ADO.NET? Write the syntax.',
      type: 'short_code',
      points: 2,
      alternatives: [
        'Explain how to establish a database connection in ADO.NET.',
        'Write the code to connect to a SQL Server database using ADO.NET.'
      ]
    },
    {
      id: 'a6',
      text: 'What are delegates in C#? Give an example.',
      type: 'short_code',
      points: 2,
      alternatives: [
        'Explain the concept of delegates and their uses in C#.',
        'How are delegates different from function pointers in other languages?'
      ]
    },
    {
      id: 'a7',
      text: 'Explain the concept of boxing and unboxing in C#.',
      type: 'short',
      points: 2,
      alternatives: [
        'What happens during boxing and unboxing of value types?',
        'Describe the performance implications of boxing and unboxing.'
      ]
    },
    {
      id: 'a8',
      text: 'What is an assembly in .NET?',
      type: 'short',
      points: 2,
      alternatives: [
        'Describe the structure and purpose of assemblies in .NET.',
        'Explain the difference between private and shared assemblies.'
      ]
    }
  ],
  partB: [
    {
      id: 'b1',
      text: 'Write a C# program to get a number and display the number in its reverse order.',
      type: 'code',
      points: 4,
      alternatives: [
        'Create a C# program that reverses an integer input by the user.',
        'Write a C# algorithm that takes a multi-digit number and outputs it backwards.'
      ]
    },
    {
      id: 'b2',
      text: 'How do we define a class and then add: variables, methods, modifiers, and further access to class members?',
      type: 'theory',
      points: 4,
      alternatives: [
        'Explain the syntax and structure of class definition in C#.',
        'Demonstrate how to implement encapsulation in C# classes.'
      ]
    },
    {
      id: 'b3',
      text: 'Write a program in C# to show the concept of the "Nested method".',
      type: 'code',
      points: 4,
      alternatives: [
        'Create a C# program demonstrating local functions in C#.',
        'Implement a practical example of nested methods in C#.'
      ]
    },
    {
      id: 'b4',
      text: 'How interface is different from inheritance? Give suitable syntax.',
      type: 'theory_code',
      points: 4,
      alternatives: [
        'Compare and contrast interfaces vs abstract classes in C#.',
        'Explain when to use interfaces instead of inheritance with examples.'
      ]
    },
    {
      id: 'b5',
      text: 'Can we create the object of a sealed class? Justify.',
      type: 'theory',
      points: 4,
      alternatives: [
        'Explain the purpose and limitations of sealed classes in C#.',
        'Discuss the scenarios where sealed classes are beneficial.'
      ]
    },
    {
      id: 'b6',
      text: 'Write a program in ASP.NET to find the date and time.',
      type: 'code',
      points: 4,
      alternatives: [
        'Create an ASP.NET web page that displays current date and time.',
        'Implement a DateTime picker in ASP.NET with validation.'
      ]
    },
    {
      id: 'b7',
      text: 'Compare and contrast ADO and ADO.NET.',
      type: 'theory',
      points: 4,
      alternatives: [
        'Explain the evolution from ADO to ADO.NET and its benefits.',
        'Describe the architectural differences between ADO and ADO.NET.'
      ]
    },
    {
      id: 'b8',
      text: 'Explain the concept of generics in C# with examples.',
      type: 'theory_code',
      points: 4,
      alternatives: [
        'Write a C# program demonstrating generic collections.',
        'How do generics improve type safety in C#? Provide examples.'
      ]
    }
  ],
  partC: [
    {
      id: 'c1',
      text: 'a) With suitable illustration explain the scope of each category of the variables.\nb) Write the C# program to demonstrate the working of foreach loop. List the characteristics of foreach loop.',
      type: 'theory_code',
      points: 10,
      subpoints: [5, 5],
      alternatives: [
        'a) Describe variable scoping in C# (local, instance, static).\nb) Implement array and collection iteration using foreach loops.',
        'a) Explain lifetime and accessibility of variables in C#.\nb) Compare for loop vs foreach loop with practical examples.'
      ]
    },
    {
      id: 'c2',
      text: 'a) Write a C# program to illustrate the multilevel inheritance with the virtual method.\nb) Write a console program to find a Fibonacci series of entered number.',
      type: 'code',
      points: 10,
      subpoints: [6, 4],
      alternatives: [
        'a) Implement method overriding across multiple inheritance levels.\nb) Create a program that generates Fibonacci numbers up to n terms.',
        'a) Demonstrate polymorphism using virtual methods and inheritance.\nb) Write a recursive solution for Fibonacci sequence calculation.'
      ]
    },
    {
      id: 'c3',
      text: 'a) Describe the architecture of ADO.NET.\nb) What is a data adapter? Writer a C# code to create a data set from a data adapter.',
      type: 'theory_code',
      points: 10,
      subpoints: [5, 5],
      alternatives: [
        'a) Explain the components and layers in ADO.NET architecture.\nb) Implement data binding using DataAdapter and DataSet.',
        'a) Draw the ADO.NET object model and explain each component.\nb) Write code to perform CRUD operations using DataAdapter.'
      ]
    },
    {
      id: 'c4',
      text: 'Develop an ASP.NET forms application for student enrollment in the intercollege technical contest, with appropriate form events, controls, menus, and dialog boxes.',
      type: 'project',
      points: 10,
      alternatives: [
        'Create a web form for event registration with validation and confirmation.',
        'Design a multi-page web application for managing student participation in competitions.'
      ]
    },
    {
      id: 'c5',
      text: 'a) Explain the concept of threading in C#.\nb) Write a C# program that creates multiple threads to perform different tasks concurrently.',
      type: 'theory_code',
      points: 10,
      subpoints: [5, 5],
      alternatives: [
        'a) Describe thread synchronization mechanisms in C#.\nb) Implement a producer-consumer pattern using threads.',
        'a) Compare asynchronous programming to multi-threading.\nb) Create a thread pool example in C#.'
      ]
    }
  ],
  mcq: [
    {
      id: 'm1',
      text: 'Which of the following is NOT a valid C# access modifier?',
      options: [
        'a) Public',
        'b) Protected',
        'c) Friend',
        'd) Internal'
      ],
      answer: 'c',
      points: 1,
      alternatives: [
        'What access modifier restricts access to the containing assembly?',
        'Which keyword controls the visibility of class members in C#?'
      ]
    },
    {
      id: 'm2',
      text: 'What does CLR stand for in .NET?',
      options: [
        'a) Common Language Runtime',
        'b) Central Language Runtime',
        'c) Common Logical Runtime',
        'd) Central Logical Runtime'
      ],
      answer: 'a',
      points: 1,
      alternatives: [
        'Which component of .NET executes the managed code?',
        'What performs Just-In-Time compilation in .NET?'
      ]
    },
    {
      id: 'm3',
      text: 'Which of the following is used to prevent a class from being inherited?',
      options: [
        'a) static',
        'b) abstract',
        'c) virtual',
        'd) sealed'
      ],
      answer: 'd',
      points: 1,
      alternatives: [
        'What keyword is used to make a class non-inheritable?',
        'Which modifier prevents extension of a class?'
      ]
    },
    {
      id: 'm4',
      text: 'What is the correct syntax to declare a delegate in C#?',
      options: [
        'a) delegate void MyDelegate();',
        'b) void delegate MyDelegate();',
        'c) MyDelegate delegate void();',
        'd) void MyDelegate delegate();'
      ],
      answer: 'a',
      points: 1,
      alternatives: [
        'How do you define a type-safe function pointer in C#?',
        'What is the proper way to create a delegate type?'
      ]
    }
  ]
};

const CreatePapers = () => {
  // Reference for printing
  const componentRef = useRef();
  
  // State for paper details
  const [paperDetails, setPaperDetails] = useState({
    university: "ST. JOSEPH'S UNIVERSITY, BENGALURU - 27",
    course: "BCA - III SEMESTER",
    subject: "CA 3222: C# AND DOT NET FRAMEWORK",
    examMonth: "October 2024",
    duration: "2",
    maxMarks: "60"
  });
  
  // State for questions
  const [questions, setQuestions] = useState({
    partA: [],
    partB: [],
    partC: []
  });
  
  // State to control whether to show the paper
  const [showPaper, setShowPaper] = useState(false);
  
  // Function to safely select random questions from the pool
  const selectRandomQuestions = (pool, count) => {
    // Check if pool is an array and not empty
    if (!Array.isArray(pool) || pool.length === 0) {
      console.error('Question pool is not an array or is empty:', pool);
      return []; // Return empty array if pool is invalid
    }
    
    // Return all questions if count is greater than pool size
    if (count >= pool.length) {
      return [...pool]; // Return a copy of the array
    }
    
    // Shuffle and select questions
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };
  
  // Function to generate a new question paper
  const generatePaper = () => {
    try {
      // Make sure questionPool exists and has the expected structure
      if (!questionPool || !questionPool.partA || !questionPool.partB || !questionPool.partC) {
        console.error('Question pool is not properly structured:', questionPool);
        throw new Error('Question pool is not properly structured');
      }
      
      const partAQuestions = selectRandomQuestions(questionPool.partA, 5);
      const partBQuestions = selectRandomQuestions(questionPool.partB, 7);
      const partCQuestions = selectRandomQuestions(questionPool.partC, 4);
      
      setQuestions({
        partA: partAQuestions,
        partB: partBQuestions,
        partC: partCQuestions
      });
      
      setShowPaper(true);
      
      // Scroll to the generated paper after a short delay to allow rendering
      setTimeout(() => {
        const paperElement = document.getElementById('din8-paper-container');
        if (paperElement) {
          paperElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      console.error('Error generating paper:', error);
      alert('There was an error generating the question paper. Please check the console for details.');
    }
  };
  
  // Function to replace a question with an alternative
  const replaceQuestion = (questionId) => {
    try {
      // Determine which part the question belongs to
      let part;
      let questionIndex;
      
      if (questionId.startsWith('a')) {
        part = 'partA';
        questionIndex = questionPool.partA.findIndex(q => q.id === questionId);
      } else if (questionId.startsWith('b')) {
        part = 'partB';
        questionIndex = questionPool.partB.findIndex(q => q.id === questionId);
      } else if (questionId.startsWith('c')) {
        part = 'partC';
        questionIndex = questionPool.partC.findIndex(q => q.id === questionId);
      } else if (questionId.startsWith('m')) {
        part = 'mcq';
        questionIndex = questionPool.mcq.findIndex(q => q.id === questionId);
      }
      
      if (questionIndex !== -1 && part && questionPool[part]) {
        // Get the current question
        const currentQuestion = questionPool[part][questionIndex];
        
        // Find an alternative question that's not currently displayed
        const otherPossibleQuestions = questionPool[part].filter(q => 
          !questions[part].some(displayedQ => displayedQ.id === q.id) && q.id !== questionId
        );
        
        // Create a copy of the current questions
        const updatedQuestions = { ...questions };
        
        if (otherPossibleQuestions.length > 0) {
          // Select a random alternative question
          const alternativeQuestion = otherPossibleQuestions[Math.floor(Math.random() * otherPossibleQuestions.length)];
          
          // Find the question to replace in the current questions array
          const replaceIndex = updatedQuestions[part].findIndex(q => q.id === questionId);
          
          if (replaceIndex !== -1) {
            // Replace the question
            updatedQuestions[part][replaceIndex] = alternativeQuestion;
            setQuestions(updatedQuestions);
            
            // Show a success message
            // alert('Question replaced successfully!');
          }
        } else {
          // If no alternative questions are available, use the alternatives within the current question
          if (currentQuestion.alternatives && currentQuestion.alternatives.length > 0) {
            // Find the question to update in the current questions array
            const updateIndex = updatedQuestions[part].findIndex(q => q.id === questionId);
            
            if (updateIndex !== -1) {
              // Get a random alternative text
              const alternativeText = currentQuestion.alternatives[Math.floor(Math.random() * currentQuestion.alternatives.length)];
              
              // Create a modified question with the alternative text
              const modifiedQuestion = { ...updatedQuestions[part][updateIndex], text: alternativeText };
              
              // Update the question
              updatedQuestions[part][updateIndex] = modifiedQuestion;
              setQuestions(updatedQuestions);
              
              // Show a success message
              alert('Question replaced with an alternative version!');
            }
          } else {
            alert('No alternative questions available for this section.');
          }
        }
      } else {
        console.error('Question not found:', questionId);
        alert('Error: Question not found.');
      }
    } catch (error) {
      console.error('Error replacing question:', error);
      alert('There was an error replacing the question. Please try again.');
    }
  };
  
  // Function to handle the send for approval action
  const sendForApproval = () => {
    // In a real application, this would submit the paper to an approval workflow
    alert('Question paper has been sent for approval to the department head!');
  };

  // Function to save paper (in a real app, this would save to a database)
  const savePaper = () => {
    alert('Question paper has been saved successfully!');
  };
  
  // Function to download/print the paper as PDF using a third-party library
  const downloadPaper = () => {
    // Show loading indicator
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'din8-loading-overlay';
    loadingOverlay.innerHTML = '<div class="din8-loading-spinner"></div><div style="margin-top: 20px;">Generating PDF...</div>';
    document.body.appendChild(loadingOverlay);
    
    // Create a new script element for jsPDF
    const jsPDFScript = document.createElement('script');
    jsPDFScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    jsPDFScript.async = true;
    
    // Create a new script element for html2canvas
    const html2canvasScript = document.createElement('script');
    html2canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    html2canvasScript.async = true;
    
    // Append both scripts to the document
    document.body.appendChild(jsPDFScript);
    document.body.appendChild(html2canvasScript);
    
    // Function to create PDF once libraries are loaded
    const createPDF = () => {
      // Get the paper element
      const paperElement = document.querySelector('.din8-a4-paper');
      
      // Create a clone to avoid modifying the original
      const paperClone = paperElement.cloneNode(true);
      
      // Create a container for the clone with specific styling to match the desired output
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
      
      // Remove all replace buttons
      const replaceButtons = tempContainer.querySelectorAll('.din8-replace-btn');
      replaceButtons.forEach(button => {
        button.remove();
      });
      
      // Remove paper actions
      const paperActions = tempContainer.querySelector('.din8-paper-actions');
      if (paperActions) {
        paperActions.remove();
      }
      
      // Adjust the question padding since we removed the buttons
      const questions = tempContainer.querySelectorAll('.din8-question');
      questions.forEach(question => {
        question.style.paddingRight = '0';
      });
      
      // Make sure the university logo is properly set
      const logo = tempContainer.querySelector('.din8-university-logo');
      if (logo) {
        logo.crossOrigin = "Anonymous";
        logo.style.display = 'block';
        logo.style.width = '120px';
        logo.style.height = 'auto';
        
        // Force the image to be fully loaded
        if (!logo.complete) {
          logo.src = logo.src;
        }
      }
      
      // Ensure all headers are centered
      const headerTexts = tempContainer.querySelectorAll('.din8-university-name, .din8-course-details, .din8-paper-title');
      headerTexts.forEach(text => {
        text.style.textAlign = 'center';
        text.style.width = '100%';
      });
      
      // Center all part titles and instructions
      const partTitles = tempContainer.querySelectorAll('.din8-part-title');
      partTitles.forEach(title => {
        title.style.textAlign = 'center';
        title.style.fontWeight = 'bold';
        title.style.marginTop = '20px';
        title.style.marginBottom = '5px';
      });
      
      // Update the page footer to show correct page numbers
      const pageFooter = tempContainer.querySelector('.din8-page-footer');
      if (pageFooter) {
        pageFooter.textContent = 'Page 1 of 2';
      }
      
      // Adjust margins and padding for a cleaner look
      const a4Page = tempContainer.querySelector('.din8-a4-page');
      if (a4Page) {
        a4Page.style.paddingTop = '10mm';
        a4Page.style.paddingBottom = '10mm';
      }
      
      // Wait for the DOM to update
      setTimeout(() => {
        // Use html2canvas to convert to image
        window.html2canvas(paperClone, {
          scale: 2, // Higher scale for better quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          onclone: (clonedDoc) => {
            // Further adjustments to cloned document if needed
            const clonedQuestions = clonedDoc.querySelectorAll('.din8-question');
            clonedQuestions.forEach(q => {
              q.style.paddingRight = '0';
            });
          }
        }).then(canvas => {
          // Create PDF
          const { jsPDF } = window.jspdf;
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
          
          // Add the image to the PDF (first page)
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
          
          // If content overflows to second page
          if (imgHeight > pageHeight) {
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, -pageHeight, imgWidth, imgHeight);
          }
          
          // Save the PDF
          pdf.save('Question_Paper.pdf');
          
          // Clean up
          document.body.removeChild(tempContainer);
          document.body.removeChild(loadingOverlay);
          
          // Show success message
          alert('Question paper downloaded as PDF successfully!');
        }).catch(error => {
          console.error('Error generating PDF:', error);
          document.body.removeChild(tempContainer);
          document.body.removeChild(loadingOverlay);
          alert('There was an error generating the PDF. Please try again.');
        });
      }, 500);
    };
    
    // Check if libraries are loaded before creating PDF
    const checkLibrariesLoaded = () => {
      if (window.jspdf && window.html2canvas) {
        createPDF();
      } else {
        setTimeout(checkLibrariesLoaded, 100);
      }
    };
    
    // Start checking if libraries are loaded
    jsPDFScript.onload = checkLibrariesLoaded;
  };
  
  // Generate a paper on first load
  useEffect(() => {
    try {
      generatePaper();
    } catch (error) {
      console.error('Error in initial paper generation:', error);
    }
  }, []);
  
  // Get current date for the paper
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear().toString().slice(-2);
  
  return (
    <div className="din8-app-container">
      {/* Question Paper Generator Title */}
      <h1 className="din8-main-title">Question Paper Generator</h1>
      
      {showPaper && (
        <div className="din8-paper-container" id="din8-paper-container">
          <div className="din8-a4-paper" ref={componentRef}>
            {/* Page 1 */}
            <div className="din8-a4-page">
              <div className="din8-university-header">
                <div className="din8-header-flex">
                  <img 
                    src="/SJU.png" 
                    alt="St. Joseph's University" 
                    className="din8-university-logo"
                    crossOrigin="anonymous"
                  />
                  <div className="din8-header-text">
                    <div className="din8-university-name">{paperDetails.university}</div>
                    <div className="din8-course-details">{paperDetails.course}</div>
                    <div className="din8-course-details">SEMESTER EXAMINATION: {paperDetails.examMonth}</div>
                    <div className="din8-course-details">(Examination conducted in November 2024)</div>
                    <div className="din8-paper-title">{paperDetails.subject}</div>
                    <div className="din8-course-details">( For current batch students only )</div>
                  </div>
                </div>
              </div>
              
              <div className="din8-registration-box">
                <div>Registration Number:</div>
                <div>Date:</div>
              </div>
              
              <div className="din8-exam-info">
                <div>Time: {paperDetails.duration} Hours</div>
                <div>Max Marks: {paperDetails.maxMarks}</div>
              </div>
              
              <div className="din8-course-details">This paper contains 2 printed pages and 3 parts</div>
              
              {/* Part A */}
              <div className="din8-part-title">PART-A</div>
              <div className="din8-part-instructions">
                <div>Answer all FIVE questions</div>
                <div>(2 X 5 = 10)</div>
              </div>
              
              <div className="din8-question-list">
                {questions.partA.map((question, index) => (
                  <div className="din8-question" id={question.id} key={question.id}>
                    <span className="din8-question-number">{index + 1}.</span>
                    <span className="din8-question-text">{question.text}</span>
                    
                    <button 
                      className="din8-replace-btn" 
                      onClick={() => replaceQuestion(question.id)}
                    >
                      Replace
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Part B */}
              <div className="din8-part-title">PART-B</div>
              <div className="din8-part-instructions">
                <div>Answer any FIVE questions</div>
                <div>(4 X 5 = 20)</div>
              </div>
              
              <div className="din8-question-list">
                {questions.partB.map((question, index) => (
                  <div className="din8-question" id={question.id} key={question.id}>
                    <span className="din8-question-number">{index + 6}.</span>
                    <span className="din8-question-text">{question.text}</span>
                    
                    <button 
                      className="din8-replace-btn" 
                      onClick={() => replaceQuestion(question.id)}
                    >
                      Replace
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Part C */}
              <div className="din8-part-title">PART-C</div>
              <div className="din8-part-instructions">
                <div>Answer any THREE questions</div>
                <div>(10 X 3 = 30)</div>
              </div>
              
              <div className="din8-question-list">
                {questions.partC.map((question, index) => (
                  <div className="din8-question" id={question.id} key={question.id}>
                    <span className="din8-question-number">{index + 13}.</span>
                    <span className="din8-question-text">{question.text}</span>
                    <button 
                      className="din8-replace-btn" 
                      onClick={() => replaceQuestion(question.id)}
                    >
                      Replace
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="din8-page-footer">Page 1 of 1</div>
            </div>
          </div>
          
          {/* Action buttons outside the paper */}
          <div className="din8-paper-actions">
            <button className="din8-action-btn din8-save-btn" onClick={savePaper}>
              Save Paper
            </button>
            <button className="din8-action-btn din8-download-btn" onClick={downloadPaper}>
              Download Paper
            </button>
            <button className="din8-action-btn din8-generate-btn" onClick={generatePaper}>
              Randomize Question
            </button>
            <button className="din8-action-btn din8-approve-btn" onClick={sendForApproval}>
              Send for Approval
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePapers;