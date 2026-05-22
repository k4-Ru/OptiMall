START TRANSACTION;

ALTER TABLE `bundle_ratings`
  ADD COLUMN IF NOT EXISTS `rating_stage` enum('generated','post_purchase') NOT NULL DEFAULT 'generated' AFTER `source`,
  ADD COLUMN IF NOT EXISTS `post_purchase_rating` tinyint(4) DEFAULT NULL AFTER `rating_score`,
  ADD COLUMN IF NOT EXISTS `reason_tags_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`reason_tags_json`)) AFTER `post_purchase_rating`,
  ADD COLUMN IF NOT EXISTS `generation_context_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`generation_context_json`)) AFTER `bundle_payload`;

COMMIT;

