-- Allow non-product interactions (e.g. searched) in user_interactions.
-- Safe to run on MariaDB/MySQL where the existing FK is named fk_ui_product.

START TRANSACTION;

ALTER TABLE `user_interactions`
  DROP FOREIGN KEY `fk_ui_product`;

ALTER TABLE `user_interactions`
  MODIFY `product_id` int(11) NULL;

ALTER TABLE `user_interactions`
  ADD CONSTRAINT `fk_ui_product`
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE SET NULL;

COMMIT;
