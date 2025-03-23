# Getting Started with Create React App



first start the server side with the command npm run dev 
Then start the client side with the command npm start
In the server side for testing purposes dummy data is to be loaded into the database so this command : node seed.js

this was created using MERN stack 

# Question Paper Generator

## Introduction
### Project Overview
The **Question Paper Generator** is a web-based application that allows educators to create, manage, and generate question papers dynamically. It enables users to input questions, categorize them based on subjects, and generate question papers in an organized manner.

### Objectives
- Provide a streamlined interface for question entry.
- Allow dynamic subject selection and switching.
- Enable randomization of questions while maintaining structure.
- Generate and download question papers in PDF format.
- Ensure efficient backend storage and retrieval of questions.

### Problem Statement
Manually creating question papers is time-consuming and prone to errors. The **Question Paper Generator** automates the process, ensuring structured paper generation and improved efficiency.

### Scope of the Project
- Users can enter and edit questions dynamically.
- Papers can be structured into different sections.
- Generated papers can be saved, reviewed, and downloaded.
- Real-time editing and storage integration.

## System Requirements
### Hardware Requirements
- Minimum 4GB RAM
- Processor: Intel i5 or equivalent
- Minimum 20GB disk space

### Software Requirements
- Node.js (for frontend development)
- Express.js and MongoDB (for backend storage)
- React (for frontend UI)
- PDF generation libraries

## System Design
### Architecture Overview
The system follows a **client-server model**:
- **Frontend**: React-based UI for question entry, preview, and generation.
- **Backend**: Express.js API for managing questions and papers.
- **Database**: MongoDB to store questions and paper structures.

### Data Flow Diagrams (DFD)
- Level 0: User interacts with the system.
- Level 1: Users enter questions, generate papers, and download PDFs.
- Level 2: System processes input, applies rules, and outputs formatted question papers.

### Entity-Relationship (ER) Diagram
- Users, Questions, Papers, and Subjects as main entities.
- Relationships between questions and subjects, questions and papers.

### UML / Use Case Diagrams
- **Actors**: Admins, Educators
- **Use Cases**: Add Questions, Generate Paper, Edit Paper, Download PDF

## Technology Stack
### Frontend Technologies
- React.js (UI development)
- Redux (State management)
- Tailwind CSS (Styling)

### Backend Technologies
- Node.js (Server runtime)
- Express.js (API framework)
- MongoDB (Database storage)

### APIs and Integrations
- PDFKit for PDF generation
- JSON Web Tokens (JWT) for authentication

## Features & Functionalities
- **User Authentication** (Login & Authorization)
- **Question Entry & Preview** (Dynamic UI with inline editing)
- **Paper Generation** (Automated structuring of questions)
- **Randomization of Questions** (Maintaining marks distribution)
- **PDF Download** (Generate formatted question papers)
- **Subject Selection & Dynamic Switching**

## Database Schema
### Tables and Relationships
- **Users** (id, name, email, password)
- **Subjects** (id, name)
- **Questions** (id, text, subject_id, marks, type)
- **Papers** (id, title, subject_id, created_by, date)

### Normalization Details
- Ensures efficient data retrieval and updates.
- Foreign keys maintain relationships.

## Installation & Setup Guide
### Prerequisites
- Install Node.js and MongoDB.

### Cloning the Repository
```bash
git clone https://github.com/Justleraning/Question_Paper_Generater.git
cd Question_Paper_Generater
```

### Setting Up Backend
```bash
cd backend
npm install
node server.js
```

### Running the Frontend
```bash
cd frontend
npm install
npm start
```

### Database Migration Steps
- Ensure MongoDB is running.
- Use API endpoints to insert initial data.

## Code Structure
### Project Directory Overview
```
Question_Paper_Generater/
│── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── utils/
│── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
```

### Key Modules and Components
- **QuestionEntry.js**: Handles question input.
- **PreviewPage.js**: Displays question preview.
- **ViewPaper.js**: Renders final question paper.
- **server.js**: Handles backend operations.

## Testing
### Test Cases
| ID | Test Scenario | Expected Result |
|----|--------------|----------------|
| 1  | User logs in | Redirect to dashboard |
| 2  | Add question | Question stored successfully |
| 3  | Generate PDF | PDF downloaded correctly |

### Unit Testing
- Jest for frontend testing.
- Mocha/Chai for backend API testing.

### Integration Testing
- API endpoint validation using Postman.

## Deployment Guide
### Hosting Backend
- Use **Heroku** or **AWS EC2** for Express.js server.

### Hosting Frontend
- Deploy via **Vercel** or **Netlify**.

### Connecting Database
- Use MongoDB Atlas for cloud storage.

## Future Enhancements
- **Role-Based Access Control** (RBAC) for admin & users.
- **Export Options** (Word format, JSON format).
- **Question Bank Integration** for reusability.
- **AI-based Question Generation**.

## References & Acknowledgments
- St. Joseph’s University Guidelines
- Open-source libraries and tools

---

This **README.md** serves as a comprehensive guide for understanding, setting up, and using the **Question Paper Generator** project. 🚀

