# StreetWealth
# 📊 StreetWealth

> Empowering India's street vendors with smart financial tools.

**StreetWealth** is a robust, user-centric financial management platform built to support the unorganized sector—specifically street vendors. It simplifies income tracking, digital payments, micro-loan access, and financial literacy through a mobile-friendly interface, gamified learning modules, and mock UPI integration.

---

## 🚀 Project Overview

- **Target Audience**: Street vendors, small-scale entrepreneurs, and micro-business owners in India.  
- **Launch Date**: July 2025  
- **Current Version**: `v1.0.0`  
- **License**: [MIT License](LICENSE.md)  

StreetWealth aims to support **financial inclusion** by offering simple, intuitive tech for managing money and accessing government schemes like **PM SVANidhi**, **MUDRA Yojana**, and **Stand Up India**.

---

## ✨ Features

- 📒 **Digital Ledger** – Track daily income and expenses, auto-calculate balances.
- 💸 **Micro-Loan Access** – In-depth info and application links for verified schemes.
- 📚 **Financial Literacy Zone** – Learn budgeting, saving, UPI usage, and documentation.
- 🧾 **Receipt Scanner (OCR)** – Upload photos of receipts and auto-extract data.
- 🪙 **Mock UPI Integration** – Simulate digital payments and maintain records.
- 🤖 **Chatbot Assistant** – Get real-time help with loans, ledgers, and savings tips.

---

## 🧰 Tech Stack

| Frontend       | Backend        | Database | Tools & Libraries       |
|----------------|----------------|----------|--------------------------|
| HTML5, CSS3, JS (ES6+) | Node.js, Express.js | SQLite3   | Tesseract.js, JWT, bcrypt, Git |

---

## 📦 Installation Guide

### 🔧 Prerequisites
- [Node.js](https://nodejs.org/) (v14.x or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Git](https://git-scm.com/)

### 🛠️ Steps

```bash
# Clone the repository
git clone https://github.com/yourusername/streetwealth.git
cd streetwealth

# Install backend dependencies
npm install

# Start the server
node server.js
Database (streetwealth.db) auto-initializes on server start.

💡 Frontend Access
Use Live Server in VS Code or open:

arduino
Copy
Edit
http://127.0.0.1:5500/frontend/index.html
📋 Usage Instructions
Sign Up or Login using modal on the homepage.

Navigate via navbar:

Ledger – Add/view transactions.

Loans – Explore and apply.

Learn – View/download learning materials.

Upload Receipts to auto-fill ledger entries.

Use Chatbot for quick help on money matters.

🔍 Sample Workflow
text
Copy
Edit
1. Login → test@example.com / password123
2. Add income → ₹500 on 27 July 2025
3. Upload a receipt → auto-extracts ₹150 expense
4. Review balance → Shown in ledger summary
🧪 Development & Testing
Project Structure
pgsql
Copy
Edit
📁 frontend/
📄 server.js
📄 streetwealth.db (auto-generated)
API Testing
Use Postman for endpoints like:

http
Copy
Edit
POST http://localhost:4000/api/auth/register
POST http://localhost:4000/api/ledger
Dev Tips
Use browser dev tools for UI/debug

Test OCR with clear receipt images

Maintain consistent JS and CSS formatting

🔧 Contributing
We welcome contributions! Here's how:

bash
Copy
Edit
# Create a new feature branch
git checkout -b feature/your-feature-name

# After changes
git commit -m "Add: [short description]"
git push origin feature/your-feature-name
Then open a Pull Request.

☁️ Deployment
Use services like Heroku, AWS, or Railway

Set environment variables:

JWT_SECRET

PORT

Enable CORS as needed

Backup streetwealth.db regularly

🧠 Acknowledgments
Inspired by the everyday hustle of Indian street vendors.

Built using open-source technologies and public financial data.

📢 Release Notes
v1.0.0 – July 27, 2025
Ledger system, mock UPI, loan portal, PDF learning modules

Chatbot assistant integrated

OCR-based receipt scanning

📫 Contact & Support
💬 Issues? Open one on GitHub

📧 Email: vidhikumari6025@gmail.com (replace with actual contact)

🌐 Community: GitHub Discussions

“Financial tools should be for everyone — not just the privileged.” 💡
