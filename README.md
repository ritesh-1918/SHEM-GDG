# SHEM - Smart Home Energy Manager ⚡🏠

![SHEM Banner](https://img.shields.io/badge/Status-Live-success?style=for-the-badge) ![Tech Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20IoT-blue?style=for-the-badge) ![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**SHEM (Smart Home Energy Manager)** is a comprehensive IoT-based solution designed to monitor, analyze, and optimize household energy consumption in real-time. Combining a powerful **ESP32-based hardware controller** with a sleek **React/Vite Dashboard**, SHEM empowers users to take control of their electricity bills and reduce their carbon footprint.

> **🚀 Live Demo:** [View Live Deployment](https://shem-gdg-srinivas.vercel.app)

---

## 🌟 Key Features

### 🖥️ Dashboard V2 (Premium Experience)
- **Real-Time Monitoring**: Visualize Voltage, Current, Power, and Energy consumption live.
- **AI-Powered Insights**: Integrated **Chatbot & Smart Tips** (powered by Gemini) to suggest actionable energy-saving habits.
- **Interactive Video Demo**: Watch how SHEM works directly from the landing page.
- **Responsive Layout**: Optimized for all screen sizes with seamless scroll animations (`RevealOnScroll`).
- **Device Control**: Remote toggle for appliances (AC, Lights, etc.) directly from the web interface.

### 🤖 Intelligent Automation
- **Predictive Budgeting**: Set monthly energy budgets and get alerted before you cross them.
- **Smart Notifications**: Instant alerts for high usage, connection loss, or system anomalies.

### 🔧 Full Stack Architecture
- **Frontend**: React, Vite, TailwindCSS, Recharts, Framer Motion.
- **Backend**: Node.js, Express, Supabase (PostgreSQL).
- **Hardware**: ESP32, PZEM-004T Sensors, Relay Modules.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Git
- Supabase Account

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/srinivas191206/SHEM-GDG.git
    cd SHEM-GDG
    ```

2.  **Setup Frontend**
    ```bash
    cd shem-pro-frontend
    npm install
    # Rename env.example to .env and add your keys
    cp env.example .env
    ```

3.  **Running the App**
    ```bash
    npm run dev
    ```
    > Access at `http://localhost:5173`

---

## 📸 Functionality

### How It Works
The system uses sensors to collect real-time data which is processed by the ESP32 and sent to our secure backend. The frontend visualizes this data, providing:
1.  **Precision Sensing**: High-accuracy voltage/current readings.
2.  **Intelligent Processing**: Real-time power factor and energy calculation.
3.  **AI Analysis**: Gemini AI analyzes patterns to suggest savings.
4.  **Smart Connectivity**: Seamless WiFi/MQTT data streaming.

---

## 🤝 Contributing
Contributions are welcome! Please fork the repo and submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.

---

<p align="center">
  Built with ❤️ by the SHEM Team
</p>
