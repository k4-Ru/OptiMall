-- Add persistent suspicious-user flags.

ALTER TABLE `users`
  ADD COLUMN `is_flagged` tinyint(1) NOT NULL DEFAULT 0 AFTER `role`,
  ADD COLUMN `flagged_at` datetime DEFAULT NULL AFTER `is_flagged`,
  ADD COLUMN `flag_reason` varchar(255) DEFAULT NULL AFTER `flagged_at`;

ALTER TABLE `users`
  ADD KEY `idx_users_is_flagged` (`is_flagged`);
