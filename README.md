## **Installation**

### **Required Tools**
- Node.js 18+ and npm 9+
- Git

---

### **Frontend (React)**

1. **Clone the frontend repository**  
   ```bash
   git clone https://github.com/gjergj753/EECS4413-Project.git
   cd Frontend
   ```

2. **Install dependencies**  
   ```bash
   npm install
   ```

3. **Start the development server**  
   ```bash
   npm run dev
   ```

   The frontend will run at [**http://localhost:5173/**](http://localhost:5173/)

### **Backend Spring Boot**

1. **Change to Backend Directory**
   
   ```bash
   cd backend
   ```
3. Open MySQL command line or Workbench and run:
   
   ```bash
   -- Create database
   CREATE DATABASE bookstore_db;
   
   -- Create user
   CREATE USER 'bookstore_user'@'localhost' IDENTIFIED BY 'your_bookstore_password';
   
   -- Grant permissions
   GRANT ALL PRIVILEGES ON bookstore_db.* TO 'your_bookstore_username'@'localhost';
   
   FLUSH PRIVILEGES;
   ```
5. Configure Enviormental Variable:
   
   ```bash
   --Linux
   export DB_USER="your_bookstore_username"
   export DB_PASS="your_bookstore_password"

   --Windows CMD (To set permanent variable, use setx instead of set)
   set DB_USER "your_bookstore_username"
   set DB_PASS "your_bookstore_password"
   ```
7. Install Dependencies:
   
   ```bash
   mvn clean install
   ```
9. Run the Backend:
    
   ```bash
   mvn spring-boot:run
   ```
11. Verify Backend is Running properly:
   ```bash
   curl http://localhost:3306/health
   ```
   
