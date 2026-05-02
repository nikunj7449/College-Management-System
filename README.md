<p align="center">
  <img src="https://raw.githubusercontent.com/nikunj7449/CMS_Nikunj/main/cms_hero_banner.png" alt="CMS Hero Banner" width="100%">
  <br>
  <img src="https://raw.githubusercontent.com/nikunj7449/CMS_Nikunj/main/cms_animated_logo.svg?p=p" alt="CMS Animated Logo" height="120">
</p>

<h1 align="center">🕵️‍♀️ College Management System</h1>

<p align="center">
  <strong>A Next-Gen, Role-Based educational management ecosystem built on the MERN stack.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/Node.js-20-green?style=for-the-badge&logo=nodedotjs" alt="Node.js">
  <img src="https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwindcss" alt="Tailwind 4.0">
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/Vite-7.0-646CFF?style=for-the-badge&logo=vite" alt="Vite">
</p>

---

## 🔥 Overview

The **College Management System (CMS)** is a comprehensive, state-of-the-art digital solution designed to streamline educational administration. From student enrollment and faculty assignments to automated fee tracking and exam coordination, CMS digitizes the entire lifecycle of an institution.

### 🎭 Role-Based Powerhouse
The system is built on a granular **RBAC (Role-Based Access Control)** system with four primary entry points:
- 👑 **Super Admin:** The ultimate orchestrator with control over modules, roles, and permissions.
- 🏢 **Admin:** The operational core handling students, faculty, courses, and fees.
- 👨‍🏫 **Faculty:** Empowered teaching staff managing attendance, results, and student performance.
- 🎓 **Student:** The academic portal for fees, exams, attendance logs, and notifications.

---

## ✨ Primary Features

| Category | Description |
| :--- | :--- |
| **🏢 Institution Ops** | Manage Courses, Branches, and Subjects with a hierarchical curriculum structure. |
| **👥 User Management** | Comprehensive profiles for Students, Faculty, and Staff with document storage. |
| **💰 Fee Ecosystem** | Multi-layered fee structure, payment recording, extra fees, and automated status updates. |
| **📊 Attendance** | Subject-wise attendance marking by faculty with student-level filtering. |
| **📝 Exams & Results** | Dynamic exam scheduling, subject-wise marks entry, and automated grading. |
| **📢 Communications** | Global and targeted notifications, college-wide events with Cloudinary image support. |
| **📈 Analytics** | Role-specific dashboards with real-time stats and data-driven insights. |

---

## 🛠️ Technological Stack

### **Frontend**
- **Core:** React 19 + Vite 7
- **Styling:** Tailwind CSS 4 (Next-gen utility engine)
- **State/Routing:** React Router 7
- **Visuals:** Lucide React (Icons), Recharts (Analytics), Big Calendar
- **UX:** React Toastify, Glassmorphism-inspired UI Components

### **Backend**
- **Server:** Node.js + Express.js
- **Database:** MongoDB with Mongoose ODM
- **Security:** JWT Authentication, Bcrypt Password Hashing, Granular Middleware
- **Assets:** Cloudinary (Image management)
- **Utilities:** Nodemailer (OTP-based password recovery), Date-fns

---

## 🚀 Quick Start Guide

### **Prerequisites**
- Node.js (v18+)
- MongoDB (Atlas or Local instance)
- Cloudinary Account (for image uploads)

### **Installation**

1. **Clone the Repository**
   ```bash
   git clone https://github.com/nikunj7449/CMS_Nikunj.git
   cd CMS_Nikunj
   ```


2. **Backend Setup**
   ```bash
   cd Backend
   npm install

   # Setup Environment Variables
   cp .env.example .env
   # Open .env and fill in your credentials (MongoDB, JWT, Cloudinary, SMTP, Stripe)

   npm run dev
   ```


3. **Frontend Setup**
   ```bash
   cd ../Frontend
   npm install

   # Setup Environment Variables
   cp .env.example .env
   # Open .env and update VITE_API_URL if your backend is running on a different port

   npm run dev
   ```


---

## 💎 Design Philosophy
CMS follows a **Modern Glassmorphism** aesthetic, emphasizing clarity, vibrance, and smooth interactions.
- **Micro-interactions:** Subtle hover effects and transitions.
- **Responsiveness:** Fully adaptive layouts designed for both mobile and desktop.
- **Premium Palettes:** Curated deep blues and glowing cyans for a high-tech corporate look.

---

## 📜 License
This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more details.

---

<p align="center">
  Built with ❤️ by Nikunj & Team
</p>
