START TRANSACTION;

CREATE TABLE IF NOT EXISTS `bundle_ratings` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `bundle_id` int(11) DEFAULT NULL,
  `scenario_key` varchar(64) DEFAULT NULL,
  `goal_text` varchar(255) DEFAULT NULL,
  `rating_score` tinyint(4) NOT NULL,
  `bundle_signature` varchar(255) NOT NULL,
  `bundle_payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`bundle_payload`)),
  `source` enum('smart_mode','product_page','manual') NOT NULL DEFAULT 'smart_mode',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_bundle_ratings_user_signature` (`user_id`,`bundle_signature`),
  KEY `idx_bundle_ratings_user_created` (`user_id`,`created_at`),
  KEY `idx_bundle_ratings_bundle` (`bundle_id`),
  KEY `idx_bundle_ratings_score_created` (`rating_score`,`created_at`),
  CONSTRAINT `fk_bundle_ratings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bundle_ratings_bundle` FOREIGN KEY (`bundle_id`) REFERENCES `bundles` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_bundle_ratings_score` CHECK (`rating_score` BETWEEN 1 AND 4)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

COMMIT;

