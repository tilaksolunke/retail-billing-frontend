# Vendix - Frontend (React)

React.js frontend for Vendix — an AI-powered retail billing software for small shops.

> 🔗 Backend Repository: [link to your backend repo here]

---

## ✨ Features
- 🧾 Cart-based billing with printable receipts
- 📊 Real-time sales dashboard
- 🤖 AI chatbot widget for business insights
- 💳 Stripe payment integration
- 🔐 Role-based UI (Admin & Staff views)
- 📜 Order history with complete details

---

## 🛠️ Tech Stack
- React.js
- React Router
- Axios
- Bootstrap
- React Hot Toast

---

## ⚙️ Setup

**1. Clone the repo**
```bash
git clone https://github.com/yourusername/vendix-frontend.git
cd vendix-frontend
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure backend URL**

Open `src/Util/constants.js` and set your backend URL:
```javascript
export const BASE_URL = "http://localhost:8080/api/v1.0";
```

**4. Run the app**
```bash
npm run dev
```
Runs at `http://localhost:5173`

---

## 📁 Project Structure
client/
├── src/
│   ├── Components/
│   │   ├── AiChat/        # AI chatbot widget
│   │   ├── CartItems/     # Cart management
│   │   ├── CartSummary/   # Order summary & payment
│   │   ├── Menubar/       # Navigation
│   │   └── ReceiptPopup/  # Printable receipt
│   ├── pages/
│   │   ├── Dashboard/     # Sales overview
│   │   ├── Explore/       # Billing & cart
│   │   ├── ManageItems/   # Product management
│   │   ├── ManageUsers/   # User management
│   │   └── OrderHistory/  # Order records
│   ├── Service/           # API calls
│   ├── context/           # Global state
│   └── Util/              # Constants

---

## 🔗 Related
- Backend Repository: [Vendix Backend](link here)
- LinkedIn: [Tilak Solunke](https://linkedin.com/in/tilaksolunke)
