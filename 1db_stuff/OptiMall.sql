-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: May 18, 2026 at 03:42 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `OptiMall`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `clerk_user_id` varchar(64) DEFAULT NULL,
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` varchar(32) NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `seller_id` int(11) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `category` varchar(80) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT NULL,
  `stock` int(11) DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `image_path` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `seller_id`, `name`, `category`, `price`, `rating`, `stock`, `tags`, `image_path`) VALUES
(93, 1, 'Mechanical Gaming Keyboard', 'Gaming', 2499.00, 4.8, 50, '[\"gaming\",\"keyboard\",\"rgb\",\"pc\"]', NULL),
(94, 1, 'Gaming Mouse RGB', 'Gaming', 1499.00, 4.7, 60, '[\"gaming\",\"mouse\",\"rgb\",\"pc\"]', NULL),
(95, 1, 'Extended Mouse Pad', 'Gaming', 699.00, 4.6, 70, '[\"gaming\",\"mousepad\",\"desk\"]', NULL),
(96, 1, 'Gaming Headset Surround', 'Gaming', 1999.00, 4.7, 40, '[\"gaming\",\"headset\",\"audio\"]', NULL),
(97, 1, 'USB Microphone', 'Gaming', 2899.00, 4.8, 35, '[\"streaming\",\"microphone\",\"gaming\"]', NULL),
(98, 1, '1080p Webcam', 'Gaming', 1799.00, 4.5, 45, '[\"streaming\",\"camera\",\"webcam\"]', NULL),
(99, 1, 'Gaming Chair Ergonomic', 'Gaming', 6999.00, 4.6, 20, '[\"gaming\",\"chair\",\"comfort\"]', NULL),
(100, 1, 'Dual Monitor Arm', 'Gaming', 2399.00, 4.7, 25, '[\"monitor\",\"desk\",\"setup\"]', NULL),
(101, 1, 'Gaming Monitor 144Hz', 'Gaming', 8999.00, 4.9, 15, '[\"monitor\",\"gaming\",\"display\"]', NULL),
(102, 1, 'RGB Desk Light Bar', 'Gaming', 1299.00, 4.5, 40, '[\"lighting\",\"desk\",\"rgb\"]', NULL),
(103, 2, 'Laptop Backpack', 'Study Essentials', 1499.00, 4.7, 80, '[\"student\",\"bag\",\"travel\"]', NULL),
(104, 2, 'Wireless Mouse Silent', 'Office & Productivity', 799.00, 4.6, 100, '[\"mouse\",\"office\",\"student\"]', NULL),
(105, 2, 'Laptop Stand Aluminum', 'Office & Productivity', 1199.00, 4.8, 60, '[\"laptop\",\"stand\",\"ergonomic\"]', NULL),
(106, 2, 'USB-C Hub 7-in-1', 'Office & Productivity', 1899.00, 4.7, 45, '[\"usb-c\",\"hub\",\"adapter\"]', NULL),
(107, 2, 'Portable SSD 1TB', 'Office & Productivity', 4599.00, 4.8, 35, '[\"storage\",\"ssd\",\"backup\"]', NULL),
(108, 2, 'Blue Light Glasses', 'Study Essentials', 599.00, 4.4, 90, '[\"study\",\"eye-care\",\"productivity\"]', NULL),
(109, 2, 'Noise Cancelling Earbuds', 'Audio', 2599.00, 4.7, 55, '[\"audio\",\"study\",\"wireless\"]', NULL),
(110, 2, 'Desk Organizer', 'Office & Productivity', 499.00, 4.5, 75, '[\"desk\",\"organization\",\"office\"]', NULL),
(111, 2, 'Smart Notebook', 'Study Essentials', 899.00, 4.5, 50, '[\"notes\",\"student\",\"study\"]', NULL),
(112, 2, 'Portable Desk Fan', 'Study Essentials', 699.00, 4.3, 65, '[\"desk\",\"cooling\",\"portable\"]', NULL),
(113, 3, '20W Fast Charger', 'Mobile Accessories', 799.00, 4.7, 120, '[\"charger\",\"mobile\",\"fast-charge\"]', NULL),
(114, 3, 'USB-C Cable Braided', 'Mobile Accessories', 299.00, 4.6, 150, '[\"cable\",\"usb-c\",\"mobile\"]', NULL),
(115, 3, 'MagSafe Power Bank', 'Mobile Accessories', 1899.00, 4.7, 50, '[\"powerbank\",\"wireless\",\"iphone\"]', NULL),
(116, 3, 'Phone Stand Adjustable', 'Mobile Accessories', 399.00, 4.5, 90, '[\"phone\",\"stand\",\"desk\"]', NULL),
(117, 3, 'Tempered Glass Screen Protector', 'Mobile Accessories', 199.00, 4.4, 200, '[\"screen\",\"protection\",\"mobile\"]', NULL),
(118, 3, 'Shockproof Phone Case', 'Mobile Accessories', 499.00, 4.6, 110, '[\"case\",\"protection\",\"mobile\"]', NULL),
(119, 3, 'Wireless Charging Pad', 'Mobile Accessories', 999.00, 4.5, 70, '[\"wireless\",\"charging\",\"desk\"]', NULL),
(120, 3, 'Bluetooth Selfie Stick', 'Mobile Accessories', 699.00, 4.3, 60, '[\"camera\",\"travel\",\"mobile\"]', NULL),
(121, 3, 'Car Phone Mount', 'Mobile Accessories', 599.00, 4.5, 75, '[\"car\",\"mount\",\"mobile\"]', NULL),
(122, 3, 'Waterproof Phone Pouch', 'Travel', 349.00, 4.4, 85, '[\"travel\",\"waterproof\",\"beach\"]', NULL),
(123, 4, 'Smart LED Bulb', 'Smart Home', 499.00, 4.5, 90, '[\"smart-home\",\"lighting\",\"wifi\"]', NULL),
(124, 4, 'Smart Plug WiFi', 'Smart Home', 699.00, 4.6, 80, '[\"smart-home\",\"automation\",\"wifi\"]', NULL),
(125, 4, 'Smart Security Camera', 'Smart Home', 2499.00, 4.7, 40, '[\"camera\",\"security\",\"wifi\"]', NULL),
(126, 4, 'Video Doorbell', 'Smart Home', 3999.00, 4.7, 25, '[\"security\",\"doorbell\",\"camera\"]', NULL),
(127, 4, 'Robot Vacuum Cleaner', 'Smart Home', 8999.00, 4.8, 20, '[\"cleaning\",\"robot\",\"smart-home\"]', NULL),
(128, 4, 'Air Purifier HEPA', 'Home Essentials', 5499.00, 4.8, 30, '[\"air\",\"health\",\"home\"]', NULL),
(129, 4, 'Smart Humidifier', 'Home Essentials', 2199.00, 4.6, 35, '[\"humidity\",\"air\",\"smart-home\"]', NULL),
(130, 4, 'WiFi Smart Strip', 'Smart Home', 1299.00, 4.5, 50, '[\"power\",\"wifi\",\"automation\"]', NULL),
(131, 4, 'Smart Thermometer', 'Smart Home', 999.00, 4.4, 60, '[\"temperature\",\"sensor\",\"smart\"]', NULL),
(132, 4, 'Motion Sensor Light', 'Smart Home', 899.00, 4.5, 55, '[\"motion\",\"lighting\",\"security\"]', NULL),
(133, 5, 'Yoga Mat Premium', 'Fitness', 999.00, 4.7, 70, '[\"fitness\",\"yoga\",\"exercise\"]', NULL),
(134, 5, 'Resistance Bands Set', 'Fitness', 799.00, 4.6, 65, '[\"fitness\",\"bands\",\"workout\"]', NULL),
(135, 5, 'Adjustable Dumbbells', 'Fitness', 6999.00, 4.8, 20, '[\"weights\",\"gym\",\"fitness\"]', NULL),
(136, 5, 'Smart Fitness Watch', 'Fitness', 3499.00, 4.7, 40, '[\"fitness\",\"watch\",\"health\"]', NULL),
(137, 5, 'Protein Shaker Bottle', 'Fitness', 399.00, 4.5, 90, '[\"protein\",\"gym\",\"nutrition\"]', NULL),
(138, 5, 'Foam Roller', 'Fitness', 699.00, 4.5, 60, '[\"recovery\",\"fitness\",\"massage\"]', NULL),
(139, 5, 'Running Shoes', 'Fashion', 3999.00, 4.8, 35, '[\"running\",\"fitness\",\"sports\"]', NULL),
(140, 5, 'Gym Backpack', 'Fitness', 1499.00, 4.6, 45, '[\"gym\",\"bag\",\"fitness\"]', NULL),
(141, 5, 'Wireless Sports Earbuds', 'Audio', 2299.00, 4.6, 50, '[\"fitness\",\"audio\",\"wireless\"]', NULL),
(142, 5, 'Hydration Water Bottle', 'Fitness', 499.00, 4.5, 100, '[\"water\",\"gym\",\"hydration\"]', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_metadata`
--

CREATE TABLE `product_metadata` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `popularity_score` decimal(5,2) NOT NULL DEFAULT 0.00,
  `tag_vector` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tag_vector`)),
  `extra` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`extra`)),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `recommendation_logs`
--

CREATE TABLE `recommendation_logs` (
  `id` int(11) NOT NULL,
  `clerk_user_id` varchar(64) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `source_event_type` varchar(50) DEFAULT NULL,
  `source_product_id` int(11) DEFAULT NULL,
  `recommendation_payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`recommendation_payload`)),
  `model_name` varchar(100) DEFAULT NULL,
  `latency_ms` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sellers`
--

CREATE TABLE `sellers` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sellers`
--

INSERT INTO `sellers` (`id`, `name`, `location`, `rating`) VALUES
(1, 'GameHub PH', NULL, NULL),
(2, 'StudyTech Store', NULL, NULL),
(3, 'MobileMate', NULL, NULL),
(4, 'SmartHome Central', NULL, NULL),
(5, 'FitLife Gear', NULL, NULL),
(6, 'Creator Studio Shop', NULL, NULL),
(7, 'KitchenPro PH', NULL, NULL),
(8, 'Travel Essentials Co.', NULL, NULL),
(9, 'PetCare Corner', NULL, NULL),
(10, 'OfficeWorks PH', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `clerk_user_id` varchar(64) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `name` varchar(120) DEFAULT NULL,
  `role` enum('customer','admin') NOT NULL DEFAULT 'customer',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `clerk_user_id`, `email`, `name`, `role`, `created_at`, `updated_at`) VALUES
(4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', NULL, NULL, 'customer', '2026-05-18 13:35:51', '2026-05-18 13:38:23');

-- --------------------------------------------------------

--
-- Table structure for table `user_activity`
--

CREATE TABLE `user_activity` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `clerk_user_id` varchar(64) DEFAULT NULL,
  `event_type` varchar(50) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `search_query` varchar(255) DEFAULT NULL,
  `weight_score` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_activity`
--

INSERT INTO `user_activity` (`id`, `user_id`, `clerk_user_id`, `event_type`, `product_id`, `category_id`, `search_query`, `weight_score`, `created_at`) VALUES
(4, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'view_product', 121, NULL, NULL, 1, '2026-05-18 13:35:51'),
(5, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'view_product', 121, NULL, NULL, 1, '2026-05-18 13:35:51'),
(6, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'view_product', 121, NULL, NULL, 1, '2026-05-18 13:35:51'),
(7, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'view_product', 121, NULL, NULL, 1, '2026-05-18 13:35:51');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_orders_user_id` (`user_id`),
  ADD KEY `idx_orders_clerk_user_id` (`clerk_user_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `seller_id` (`seller_id`);

--
-- Indexes for table `product_metadata`
--
ALTER TABLE `product_metadata`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_product_metadata_product_id` (`product_id`);

--
-- Indexes for table `recommendation_logs`
--
ALTER TABLE `recommendation_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_recommendation_logs_clerk_user_id` (`clerk_user_id`),
  ADD KEY `idx_recommendation_logs_user_id` (`user_id`),
  ADD KEY `idx_recommendation_logs_source_product_id` (`source_product_id`);

--
-- Indexes for table `sellers`
--
ALTER TABLE `sellers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clerk_user_id` (`clerk_user_id`);

--
-- Indexes for table `user_activity`
--
ALTER TABLE `user_activity`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_activity_clerk_user_id` (`clerk_user_id`),
  ADD KEY `idx_user_activity_user_id` (`user_id`),
  ADD KEY `idx_user_activity_product_id` (`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=143;

--
-- AUTO_INCREMENT for table `product_metadata`
--
ALTER TABLE `product_metadata`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `recommendation_logs`
--
ALTER TABLE `recommendation_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sellers`
--
ALTER TABLE `sellers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `user_activity`
--
ALTER TABLE `user_activity`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`);

--
-- Constraints for table `product_metadata`
--
ALTER TABLE `product_metadata`
  ADD CONSTRAINT `fk_product_metadata_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `recommendation_logs`
--
ALTER TABLE `recommendation_logs`
  ADD CONSTRAINT `fk_recommendation_logs_product` FOREIGN KEY (`source_product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `fk_recommendation_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `user_activity`
--
ALTER TABLE `user_activity`
  ADD CONSTRAINT `fk_user_activity_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `fk_user_activity_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
