-- Align schema with Optimall_Intelligent_Architecture.md intelligent pipeline requirements.

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  clerk_user_id VARCHAR(64) NULL,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_orders_user_id (user_id),
  INDEX idx_orders_clerk_user_id (clerk_user_id),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS product_metadata (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  popularity_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  tag_vector JSON NULL,
  extra JSON NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_product_metadata_product_id (product_id),
  CONSTRAINT fk_product_metadata_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS recommendation_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  clerk_user_id VARCHAR(64) NULL,
  user_id INT NULL,
  source_event_type VARCHAR(50) NULL,
  source_product_id INT NULL,
  recommendation_payload JSON NOT NULL,
  model_name VARCHAR(100) NULL,
  latency_ms INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_recommendation_logs_clerk_user_id (clerk_user_id),
  INDEX idx_recommendation_logs_user_id (user_id),
  INDEX idx_recommendation_logs_source_product_id (source_product_id),
  CONSTRAINT fk_recommendation_logs_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_recommendation_logs_product FOREIGN KEY (source_product_id) REFERENCES products(id)
);
