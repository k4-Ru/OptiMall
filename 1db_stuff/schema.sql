CREATE TABLE IF NOT EXISTS sellers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  location VARCHAR(100),
  rating DECIMAL(2,1)
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT,
  name VARCHAR(100),
  category VARCHAR(80),
  price DECIMAL(10,2),
  rating DECIMAL(2,1),
  stock INT,
  tags JSON,
  image_path VARCHAR(255) NULL,
  FOREIGN KEY (seller_id) REFERENCES sellers(id)
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  clerk_user_id VARCHAR(64) NOT NULL UNIQUE,
  email VARCHAR(255) NULL,
  name VARCHAR(120) NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_activity (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  clerk_user_id VARCHAR(64) NULL,
  event_type VARCHAR(50),
  product_id INT,
  category_id INT,
  search_query VARCHAR(255),
  weight_score INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_activity_clerk_user_id (clerk_user_id),
  INDEX idx_user_activity_user_id (user_id),
  INDEX idx_user_activity_product_id (product_id),
  CONSTRAINT fk_user_activity_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_user_activity_product FOREIGN KEY (product_id) REFERENCES products(id)
);
