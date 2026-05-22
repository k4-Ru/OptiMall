-- Step 2: Learning AI foundation schema
-- Creates exposure/outcome logging, daily feature store, model registry,
-- inference logs, and wires bundle ownership to users.

START TRANSACTION;

CREATE TABLE IF NOT EXISTS `recommendation_exposures` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `request_id` varchar(64) NOT NULL,
  `recommendation_log_id` int(11) DEFAULT NULL,
  `clerk_user_id` varchar(64) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `session_id` varchar(100) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `rank_position` int(11) NOT NULL,
  `source` enum('homepage','bundle_engine','similar_products','trending','ai_reranking','session_based','smart_mode','product_detail') NOT NULL DEFAULT 'ai_reranking',
  `strategy` varchar(64) NOT NULL DEFAULT 'heuristic_v1',
  `score` decimal(10,4) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_rex_request_product_rank` (`request_id`,`product_id`,`rank_position`),
  KEY `idx_rex_user_created` (`user_id`,`created_at`),
  KEY `idx_rex_request_id` (`request_id`),
  KEY `idx_rex_product_created` (`product_id`,`created_at`),
  CONSTRAINT `fk_rex_recommendation_log` FOREIGN KEY (`recommendation_log_id`) REFERENCES `recommendation_logs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_rex_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_rex_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `recommendation_outcomes` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `exposure_id` bigint(20) NOT NULL,
  `request_id` varchar(64) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `outcome_type` enum('viewed','clicked','carted','purchased','dismissed') NOT NULL,
  `outcome_value` decimal(10,4) NOT NULL DEFAULT 1.0000,
  `latency_ms` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_rou_exposure` (`exposure_id`),
  KEY `idx_rou_user_created` (`user_id`,`created_at`),
  KEY `idx_rou_request_product` (`request_id`,`product_id`),
  KEY `idx_rou_outcome_created` (`outcome_type`,`created_at`),
  CONSTRAINT `fk_rou_exposure` FOREIGN KEY (`exposure_id`) REFERENCES `recommendation_exposures` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rou_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_rou_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `user_product_features_daily` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `feature_date` date NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `request_count` int(11) NOT NULL DEFAULT 0,
  `view_count` int(11) NOT NULL DEFAULT 0,
  `click_count` int(11) NOT NULL DEFAULT 0,
  `cart_count` int(11) NOT NULL DEFAULT 0,
  `purchase_count` int(11) NOT NULL DEFAULT 0,
  `search_count` int(11) NOT NULL DEFAULT 0,
  `last_event_at` datetime DEFAULT NULL,
  `days_since_last_event` int(11) DEFAULT NULL,
  `category_affinity` decimal(8,4) DEFAULT 0.0000,
  `price_affinity` decimal(8,4) DEFAULT 0.0000,
  `popularity_score` decimal(8,4) DEFAULT 0.0000,
  `embedding_similarity` decimal(8,4) DEFAULT 0.0000,
  `prior_ctr` decimal(8,4) DEFAULT 0.0000,
  `prior_cvr` decimal(8,4) DEFAULT 0.0000,
  `feature_payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`feature_payload`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_upfd_date_user_product` (`feature_date`,`user_id`,`product_id`),
  KEY `idx_upfd_user_date` (`user_id`,`feature_date`),
  KEY `idx_upfd_product_date` (`product_id`,`feature_date`),
  CONSTRAINT `fk_upfd_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_upfd_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `model_registry` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `model_key` varchar(80) NOT NULL,
  `model_version` varchar(120) NOT NULL,
  `status` enum('training','candidate','active','archived','failed') NOT NULL DEFAULT 'training',
  `framework` varchar(40) DEFAULT NULL,
  `artifact_uri` varchar(500) DEFAULT NULL,
  `feature_schema_hash` varchar(128) DEFAULT NULL,
  `train_window_start` datetime DEFAULT NULL,
  `train_window_end` datetime DEFAULT NULL,
  `metrics` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metrics`)),
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `activated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_model_registry_version` (`model_version`),
  KEY `idx_model_registry_key_status` (`model_key`,`status`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `model_inference_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `request_id` varchar(64) NOT NULL,
  `model_registry_id` bigint(20) DEFAULT NULL,
  `model_version` varchar(120) DEFAULT NULL,
  `route` varchar(120) DEFAULT NULL,
  `strategy` varchar(64) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `score` decimal(10,6) DEFAULT NULL,
  `rank_position` int(11) DEFAULT NULL,
  `latency_ms` int(11) DEFAULT NULL,
  `fallback_used` tinyint(1) NOT NULL DEFAULT 0,
  `error_type` varchar(64) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_mil_request_id` (`request_id`),
  KEY `idx_mil_model_created` (`model_registry_id`,`created_at`),
  KEY `idx_mil_user_created` (`user_id`,`created_at`),
  KEY `idx_mil_fallback_created` (`fallback_used`,`created_at`),
  CONSTRAINT `fk_mil_model_registry` FOREIGN KEY (`model_registry_id`) REFERENCES `model_registry` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_mil_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_mil_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Bundle ownership wiring for per-user tracking
ALTER TABLE `bundles`
  ADD COLUMN IF NOT EXISTS `user_id` int(11) DEFAULT NULL AFTER `id`;

SET @idx_exists := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'bundles'
    AND INDEX_NAME = 'idx_bundles_user'
);
SET @idx_sql := IF(
  @idx_exists = 0,
  'ALTER TABLE `bundles` ADD KEY `idx_bundles_user` (`user_id`)',
  'SELECT 1'
);
PREPARE idx_stmt FROM @idx_sql;
EXECUTE idx_stmt;
DEALLOCATE PREPARE idx_stmt;

SET @fk_exists := (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'bundles'
    AND CONSTRAINT_NAME = 'fk_bundles_user'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
SET @fk_sql := IF(
  @fk_exists = 0,
  'ALTER TABLE `bundles` ADD CONSTRAINT `fk_bundles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL',
  'SELECT 1'
);
PREPARE fk_stmt FROM @fk_sql;
EXECUTE fk_stmt;
DEALLOCATE PREPARE fk_stmt;

COMMIT;
