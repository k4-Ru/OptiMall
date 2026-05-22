-- Step 4: user-level embedding storage for learning pipeline

START TRANSACTION;

CREATE TABLE IF NOT EXISTS `user_embeddings` (
  `user_id` int(11) NOT NULL,
  `embedding` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`embedding`)),
  `embedding_model` varchar(100) DEFAULT 'text-embedding-3-small',
  `embedding_dimension` int(11) DEFAULT 1536,
  `source_window_days` int(11) DEFAULT 120,
  `generated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`),
  KEY `idx_user_embeddings_model` (`embedding_model`),
  CONSTRAINT `fk_ue_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

COMMIT;
