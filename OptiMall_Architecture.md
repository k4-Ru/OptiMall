# OptiMall System Architecture
### Intelligent E-commerce Platform (Mini Capstone)

---

## 1. Overview

OptiMall is an intelligent e-commerce system designed to help users optimize their spending by recommending product bundles based on budget, preferences, and behavior.

Unlike traditional platforms, OptiMall focuses on:
- Value optimization (not overbuying)
- Personalized recommendations
- Budget-aware product bundling

---

## 2. System Architecture

React Frontend
      |
      v
Node.js + Express Backend
      |
      v
Python Intelligent System Service
      |
      v
Database (MySQL/PostgreSQL)

---

## 3. Components

### 3.1 Frontend (React)

Responsible for user interaction.

Features:
- Product browsing
- Budget input
- Preference selection
- Viewing recommended bundles
- Cart management

---

### 3.2 Backend (Node.js + Express)

Acts as the central controller.

Responsibilities:
- API routing
- Authentication
- Product retrieval
- Activity logging
- Communication with Python service

Main APIs:
- POST /api/recommendations
- POST /api/activity
- GET /api/products

---

### 3.3 Python Intelligent System

Core intelligent component.

Responsibilities:
- Analyze user preferences
- Score products
- Generate bundles
- Return recommendations

Modules:
- Product Scoring Engine
- Bundle Optimization Engine
- Preference Analyzer
- Explanation Generator

---

### 3.4 Database (example)

Stores all system data.

---

## 4. Database Design

### Sellers Table

CREATE TABLE sellers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  location VARCHAR(100),
  rating DECIMAL(2,1)
);

---

### Products Table

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT,
  name VARCHAR(100),
  category VARCHAR(80),
  price DECIMAL(10,2),
  rating DECIMAL(2,1),
  stock INT,
  tags JSON,
  FOREIGN KEY (seller_id) REFERENCES sellers(id)
);

---

### User Activity Table

CREATE TABLE user_activity (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  event_type VARCHAR(50),
  product_id INT,
  category_id INT,
  search_query VARCHAR(255),
  weight_score INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---

## 5. Activity Tracking

Tracked events:
- view_product (+1)
- click_product (+2)
- add_to_cart (+5)
- purchase (+10)
- search (+3)

---

## 6. Intelligent System Logic

Input:
- User budget
- Preferences
- Product data
- Activity history

Processing:
- Product scoring
- Bundle optimization (Knapsack algorithm)

Output:
Recommended bundle with best value within budget.

---

## 7. System Flow

1. User inputs budget and preferences
2. Frontend sends request to backend
3. Backend fetches product data
4. Backend calls Python service
5. Python computes best bundle
6. Results returned to frontend

---

## 8. Key Features

- Personalized recommendations
- Budget-aware bundling
- Behavior-based learning
- Value optimization

---

## Tagline

Optimizing every peso.
