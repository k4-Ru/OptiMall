-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: May 19, 2026 at 07:37 PM
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
(109, 2, 'Noise Cancelling Earbuds', 'Audio', 2599.00, 4.7, 55, '[\"audio\",\"study\",\"wireless\"]', '/images/earbuds_1778761100549.png'),
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
(142, 5, 'Hydration Water Bottle', 'Fitness', 499.00, 4.5, 100, '[\"water\",\"gym\",\"hydration\"]', NULL),
(143, 11, 'Budget Mechanical Keyboard', 'Gaming', 1599.00, 4.5, 70, '[\"gaming\",\"keyboard\",\"budget\",\"rgb\"]', NULL),
(144, 11, 'Entry Gaming Mouse', 'Gaming', 699.00, 4.4, 120, '[\"gaming\",\"mouse\",\"budget\"]', NULL),
(145, 11, 'USB WiFi Adapter', 'Electronics', 499.00, 4.3, 150, '[\"wifi\",\"adapter\",\"pc\"]', NULL),
(146, 11, 'Bluetooth 5.3 Dongle', 'Electronics', 399.00, 4.2, 140, '[\"bluetooth\",\"adapter\",\"pc\"]', NULL),
(147, 11, 'Portable Power Bank 20000mAh', 'Mobile Accessories', 1499.00, 4.6, 90, '[\"powerbank\",\"travel\",\"mobile\"]', NULL),
(148, 11, 'Fast Charger 65W USB-C', 'Mobile Accessories', 1299.00, 4.7, 80, '[\"charger\",\"usb-c\",\"fast-charge\"]', NULL),
(149, 11, 'Braided USB-C Cable 2m', 'Mobile Accessories', 299.00, 4.5, 200, '[\"cable\",\"usb-c\",\"charging\"]', NULL),
(150, 11, 'Laptop Cooling Pad', 'Office & Productivity', 999.00, 4.4, 75, '[\"laptop\",\"cooling\",\"study\"]', NULL),
(151, 12, 'Student Planner Notebook', 'Study Essentials', 199.00, 4.6, 180, '[\"student\",\"planner\",\"notes\"]', NULL),
(152, 12, 'Desk Organizer Set', 'Study Essentials', 349.00, 4.5, 140, '[\"desk\",\"organizer\",\"study\"]', NULL),
(153, 12, 'Rechargeable Desk Lamp', 'Study Essentials', 899.00, 4.7, 95, '[\"lamp\",\"study\",\"desk\"]', NULL),
(154, 12, 'Scientific Calculator', 'Study Essentials', 799.00, 4.6, 85, '[\"calculator\",\"school\",\"study\"]', NULL),
(155, 12, 'A4 Bond Paper Ream', 'Study Essentials', 289.00, 4.4, 160, '[\"paper\",\"school\",\"printing\"]', NULL),
(156, 12, 'Printer Ink Refill Kit', 'Office & Productivity', 699.00, 4.3, 70, '[\"printer\",\"ink\",\"office\"]', NULL),
(157, 12, 'Wireless Presenter Clicker', 'Office & Productivity', 599.00, 4.5, 60, '[\"presentation\",\"school\",\"office\"]', NULL),
(158, 12, 'Laptop Sleeve 14 inch', 'Study Essentials', 499.00, 4.6, 100, '[\"laptop\",\"sleeve\",\"student\"]', NULL),
(159, 13, 'RGB Gaming Speaker Bar', 'Gaming', 1399.00, 4.6, 55, '[\"gaming\",\"speaker\",\"rgb\"]', NULL),
(160, 13, 'Controller Gamepad Wireless', 'Gaming', 1799.00, 4.7, 50, '[\"gaming\",\"controller\",\"wireless\"]', NULL),
(161, 13, 'Gaming Desk 120cm', 'Gaming', 4999.00, 4.6, 18, '[\"gaming\",\"desk\",\"setup\"]', NULL),
(162, 13, 'Monitor Riser Stand', 'Gaming', 899.00, 4.5, 70, '[\"monitor\",\"stand\",\"desk\"]', NULL),
(163, 13, 'Headset Stand RGB', 'Gaming', 799.00, 4.4, 85, '[\"gaming\",\"headset\",\"stand\"]', NULL),
(164, 13, '144Hz HDMI Cable', 'Gaming', 399.00, 4.3, 130, '[\"hdmi\",\"monitor\",\"gaming\"]', NULL),
(165, 13, 'Thermal Paste Kit', 'Gaming', 349.00, 4.4, 90, '[\"pc\",\"thermal\",\"maintenance\"]', NULL),
(166, 13, 'PC Cleaning Air Blower', 'Gaming', 1199.00, 4.5, 45, '[\"pc\",\"cleaning\",\"maintenance\"]', NULL),
(167, 14, 'Smart LED Bulb 4-Pack', 'Smart Home', 1299.00, 4.6, 80, '[\"smart-home\",\"lighting\",\"wifi\"]', NULL),
(168, 14, 'Smart Plug Mini', 'Smart Home', 499.00, 4.5, 110, '[\"smart-home\",\"plug\",\"wifi\"]', NULL),
(169, 14, 'Door Sensor Alarm', 'Smart Home', 899.00, 4.4, 70, '[\"security\",\"sensor\",\"home\"]', NULL),
(170, 14, 'WiFi Security Camera', 'Smart Home', 1899.00, 4.6, 45, '[\"camera\",\"security\",\"wifi\"]', NULL),
(171, 14, 'Automatic Soap Dispenser', 'Home Essentials', 799.00, 4.3, 75, '[\"home\",\"hygiene\",\"dispenser\"]', NULL),
(172, 14, 'Foldable Storage Box Set', 'Home Essentials', 599.00, 4.4, 120, '[\"storage\",\"home\",\"organizer\"]', NULL),
(173, 14, 'Mini Air Purifier', 'Home Essentials', 1799.00, 4.5, 40, '[\"air\",\"purifier\",\"home\"]', NULL),
(174, 14, 'Digital Room Thermometer', 'Home Essentials', 349.00, 4.2, 100, '[\"thermometer\",\"home\",\"room\"]', NULL),
(175, 15, 'Smart Fitness Band', 'Fitness', 1699.00, 4.6, 65, '[\"fitness\",\"wearable\",\"health\"]', NULL),
(176, 15, 'Yoga Mat Non-Slip', 'Fitness', 699.00, 4.5, 90, '[\"fitness\",\"yoga\",\"exercise\"]', NULL),
(177, 15, 'Resistance Bands Set', 'Fitness', 499.00, 4.4, 110, '[\"fitness\",\"bands\",\"workout\"]', NULL),
(178, 15, 'Adjustable Dumbbell Pair', 'Fitness', 2999.00, 4.7, 25, '[\"fitness\",\"dumbbell\",\"strength\"]', NULL),
(179, 15, 'Insulated Water Bottle', 'Fitness', 499.00, 4.6, 120, '[\"water\",\"fitness\",\"bottle\"]', NULL),
(180, 15, 'Running Waist Bag', 'Fitness', 399.00, 4.3, 100, '[\"running\",\"bag\",\"fitness\"]', NULL),
(181, 15, 'Jump Rope Digital Counter', 'Fitness', 349.00, 4.4, 105, '[\"fitness\",\"jump-rope\",\"cardio\"]', NULL),
(182, 15, 'Posture Corrector Brace', 'Fitness', 599.00, 4.2, 85, '[\"posture\",\"back\",\"health\"]', NULL),
(183, 16, 'USB Condenser Microphone', 'Content Creation', 2499.00, 4.8, 40, '[\"creator\",\"microphone\",\"streaming\"]', NULL),
(184, 16, 'LED Ring Light 12 inch', 'Content Creation', 1199.00, 4.6, 75, '[\"creator\",\"lighting\",\"video\"]', NULL),
(185, 16, 'Phone Tripod Stand', 'Content Creation', 799.00, 4.5, 100, '[\"tripod\",\"phone\",\"creator\"]', NULL),
(186, 16, 'Lavalier Microphone Wireless', 'Content Creation', 1899.00, 4.6, 55, '[\"microphone\",\"wireless\",\"creator\"]', NULL),
(187, 16, 'Portable Photo Light Box', 'Content Creation', 1599.00, 4.5, 45, '[\"product-photo\",\"creator\",\"lighting\"]', NULL),
(188, 16, 'Camera SD Card 128GB', 'Content Creation', 899.00, 4.7, 90, '[\"camera\",\"storage\",\"sd-card\"]', NULL),
(189, 16, 'Video Editing Shortcut Keyboard', 'Content Creation', 2999.00, 4.6, 22, '[\"editing\",\"keyboard\",\"creator\"]', NULL),
(190, 16, 'Acoustic Foam Panels 12pcs', 'Content Creation', 1299.00, 4.4, 60, '[\"audio\",\"foam\",\"studio\"]', NULL),
(191, 17, 'Travel Neck Pillow', 'Travel', 399.00, 4.5, 130, '[\"travel\",\"comfort\",\"pillow\"]', NULL),
(192, 17, 'Packing Cubes Set', 'Travel', 599.00, 4.6, 120, '[\"travel\",\"packing\",\"organizer\"]', NULL),
(193, 17, 'Universal Travel Adapter', 'Travel', 799.00, 4.7, 80, '[\"travel\",\"adapter\",\"charger\"]', NULL),
(194, 17, 'Anti-Theft Sling Bag', 'Travel', 1099.00, 4.5, 70, '[\"travel\",\"bag\",\"security\"]', NULL),
(195, 17, 'Digital Luggage Scale', 'Travel', 499.00, 4.4, 95, '[\"travel\",\"luggage\",\"scale\"]', NULL),
(196, 17, 'Rainproof Backpack Cover', 'Travel', 299.00, 4.3, 140, '[\"travel\",\"rain\",\"bag\"]', NULL),
(197, 17, 'Vacuum Travel Bottle Set', 'Travel', 349.00, 4.2, 100, '[\"travel\",\"bottle\",\"toiletries\"]', NULL),
(198, 17, 'Compact Umbrella Windproof', 'Travel', 499.00, 4.5, 110, '[\"umbrella\",\"travel\",\"rain\"]', NULL),
(199, 18, 'Automatic Pet Feeder', 'Pet Supplies', 2299.00, 4.6, 35, '[\"pet\",\"feeder\",\"automatic\"]', NULL),
(200, 18, 'Pet Water Fountain', 'Pet Supplies', 1699.00, 4.5, 45, '[\"pet\",\"water\",\"fountain\"]', NULL),
(201, 18, 'Cat Scratching Post', 'Pet Supplies', 899.00, 4.4, 75, '[\"cat\",\"scratch\",\"pet\"]', NULL),
(202, 18, 'Dog Harness Adjustable', 'Pet Supplies', 599.00, 4.5, 100, '[\"dog\",\"harness\",\"pet\"]', NULL),
(203, 18, 'Pet Grooming Brush', 'Pet Supplies', 349.00, 4.4, 130, '[\"pet\",\"grooming\",\"brush\"]', NULL),
(204, 18, 'Pet Carrier Bag', 'Pet Supplies', 1299.00, 4.6, 60, '[\"pet\",\"carrier\",\"travel\"]', NULL),
(205, 18, 'Training Treat Pouch', 'Pet Supplies', 299.00, 4.3, 120, '[\"pet\",\"training\",\"dog\"]', NULL),
(206, 18, 'Washable Pet Bed', 'Pet Supplies', 1199.00, 4.5, 55, '[\"pet\",\"bed\",\"comfort\"]', NULL),
(207, 19, 'Air Fryer 4L', 'Kitchen', 3499.00, 4.8, 30, '[\"kitchen\",\"air-fryer\",\"cooking\"]', NULL),
(208, 19, 'Rice Cooker 1.8L', 'Kitchen', 1899.00, 4.6, 50, '[\"kitchen\",\"rice-cooker\",\"home\"]', NULL),
(209, 19, 'Electric Kettle Stainless', 'Kitchen', 999.00, 4.5, 80, '[\"kitchen\",\"kettle\",\"appliance\"]', NULL),
(210, 19, 'Blender 1.5L', 'Kitchen', 1599.00, 4.6, 45, '[\"kitchen\",\"blender\",\"smoothie\"]', NULL),
(211, 19, 'Non-Stick Pan Set', 'Kitchen', 1299.00, 4.5, 65, '[\"kitchen\",\"pan\",\"cooking\"]', NULL),
(212, 19, 'Digital Kitchen Scale', 'Kitchen', 599.00, 4.4, 95, '[\"kitchen\",\"scale\",\"baking\"]', NULL),
(213, 19, 'Meal Prep Containers 10pcs', 'Kitchen', 499.00, 4.5, 120, '[\"kitchen\",\"containers\",\"meal-prep\"]', NULL),
(214, 19, 'Knife Set with Block', 'Kitchen', 1499.00, 4.6, 40, '[\"kitchen\",\"knife\",\"cooking\"]', NULL),
(215, 20, 'Budget Earbuds Wired', 'Mobile Accessories', 199.00, 4.2, 220, '[\"earbuds\",\"budget\",\"audio\"]', NULL),
(216, 20, 'Basic Phone Stand', 'Mobile Accessories', 149.00, 4.3, 200, '[\"phone\",\"stand\",\"desk\"]', NULL),
(217, 20, 'Mini Bluetooth Speaker', 'Audio', 699.00, 4.4, 100, '[\"speaker\",\"bluetooth\",\"audio\"]', NULL),
(218, 20, 'Rechargeable Flashlight', 'Home Essentials', 399.00, 4.5, 140, '[\"flashlight\",\"emergency\",\"home\"]', NULL),
(219, 20, 'Extension Cord 4-Gang', 'Home Essentials', 499.00, 4.4, 150, '[\"extension\",\"power\",\"home\"]', NULL),
(220, 20, 'Budget Backpack', 'Study Essentials', 699.00, 4.3, 120, '[\"bag\",\"student\",\"budget\"]', NULL),
(221, 20, 'Reusable Eco Bag Set', 'Home Essentials', 199.00, 4.4, 180, '[\"eco\",\"bag\",\"shopping\"]', NULL),
(222, 20, 'Mini Desk Fan USB', 'Office & Productivity', 399.00, 4.5, 130, '[\"fan\",\"desk\",\"usb\"]', NULL);

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
(10, 'OfficeWorks PH', NULL, NULL),
(11, 'BudgetBytes Electronics', 'Olongapo City', 4.6),
(12, 'CampusCart PH', 'Manila', 4.5),
(13, 'GamerForge Supply', 'Quezon City', 4.8),
(14, 'HomeNest Finds', 'Cebu City', 4.6),
(15, 'FitTech Outlet', 'Makati', 4.7),
(16, 'CreatorLab Gear', 'Pasig', 4.8),
(17, 'TravelLite PH', 'Baguio City', 4.5),
(18, 'PetPal Market', 'Davao City', 4.6),
(19, 'KitchenSmart Depot', 'Iloilo City', 4.7),
(20, 'ValueMart Essentials', 'Angeles City', 4.4);

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
(7, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'view_product', 121, NULL, NULL, 1, '2026-05-18 13:35:51'),
(8, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'view_product', 127, NULL, NULL, 1, '2026-05-18 15:09:03'),
(9, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'view_product', 133, NULL, NULL, 1, '2026-05-18 17:07:15'),
(10, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'view_product', 133, NULL, NULL, 1, '2026-05-18 17:07:15'),
(11, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'view_product', 133, NULL, NULL, 1, '2026-05-18 17:07:15'),
(12, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'view_product', 133, NULL, NULL, 1, '2026-05-18 17:07:15'),
(13, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'view_product', 116, NULL, NULL, 1, '2026-05-18 17:21:27'),
(14, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'view_product', 113, NULL, NULL, 1, '2026-05-18 17:25:08'),
(15, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'view_product', 113, NULL, NULL, 1, '2026-05-18 17:25:08'),
(16, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'view_product', 122, NULL, NULL, 1, '2026-05-18 17:31:55'),
(17, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'view_product', 122, NULL, NULL, 1, '2026-05-18 17:31:56'),
(18, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'view_product', 133, NULL, NULL, 1, '2026-05-18 18:22:54'),
(19, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Budget Essentials @ 10000', 1, '2026-05-18 18:41:35'),
(20, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Fitness Focus @ 1000', 1, '2026-05-18 18:42:42'),
(21, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Travel Focus @ 1000', 1, '2026-05-18 18:42:48'),
(22, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Travel Focus @ 1000', 1, '2026-05-18 18:46:27'),
(23, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Content Creator Kit @ 1000', 1, '2026-05-18 18:50:41'),
(24, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 16:44:20'),
(25, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 5000', 1, '2026-05-19 17:17:48'),
(26, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1000', 1, '2026-05-19 17:17:50'),
(27, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1000', 1, '2026-05-19 17:17:52'),
(28, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 3500', 1, '2026-05-19 17:17:54'),
(29, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 3500', 1, '2026-05-19 17:17:56'),
(30, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 3500', 1, '2026-05-19 17:17:58'),
(31, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1500', 1, '2026-05-19 17:18:01'),
(32, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1500', 1, '2026-05-19 17:18:03'),
(33, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1500', 1, '2026-05-19 17:18:05'),
(34, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1500', 1, '2026-05-19 17:18:08'),
(35, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1500', 1, '2026-05-19 17:18:10'),
(36, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1500', 1, '2026-05-19 17:18:13'),
(37, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1500', 1, '2026-05-19 17:18:15'),
(38, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1500', 1, '2026-05-19 17:18:18'),
(39, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1500', 1, '2026-05-19 17:18:20'),
(40, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1500', 1, '2026-05-19 17:18:22'),
(41, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1500', 1, '2026-05-19 17:18:25'),
(42, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1500', 1, '2026-05-19 17:18:27'),
(43, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1500', 1, '2026-05-19 17:18:29'),
(44, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1500', 1, '2026-05-19 17:18:31'),
(45, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1500', 1, '2026-05-19 17:18:33'),
(46, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1500', 1, '2026-05-19 17:18:36'),
(47, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1500', 1, '2026-05-19 17:18:38'),
(48, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1500', 1, '2026-05-19 17:18:41'),
(49, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1500', 1, '2026-05-19 17:18:43'),
(50, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1500', 1, '2026-05-19 17:18:45'),
(51, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1000', 1, '2026-05-19 17:18:47'),
(52, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1000', 1, '2026-05-19 17:18:50'),
(53, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1000', 1, '2026-05-19 17:18:52'),
(54, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1000', 1, '2026-05-19 17:18:55'),
(55, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1000', 1, '2026-05-19 17:18:57'),
(56, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1000', 1, '2026-05-19 17:19:00'),
(57, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1000', 1, '2026-05-19 17:19:03'),
(58, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1000', 1, '2026-05-19 17:19:05'),
(59, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1000', 1, '2026-05-19 17:19:07'),
(60, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1000', 1, '2026-05-19 17:19:09'),
(61, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1000', 1, '2026-05-19 17:19:12'),
(62, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1000', 1, '2026-05-19 17:19:14'),
(63, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1000', 1, '2026-05-19 17:19:16'),
(64, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1000', 1, '2026-05-19 17:19:18'),
(65, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1000', 1, '2026-05-19 17:19:20'),
(66, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1000', 1, '2026-05-19 17:19:22'),
(67, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1000', 1, '2026-05-19 17:19:24'),
(68, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1000', 1, '2026-05-19 17:19:26'),
(69, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1000', 1, '2026-05-19 17:19:28'),
(70, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1000', 1, '2026-05-19 17:19:32'),
(71, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1000', 1, '2026-05-19 17:19:34'),
(72, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1000', 1, '2026-05-19 17:19:36'),
(73, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1000', 1, '2026-05-19 17:19:38'),
(74, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Gaming Focus @ 1000', 1, '2026-05-19 17:19:40'),
(75, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:21:07'),
(76, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 500', 1, '2026-05-19 17:21:09'),
(77, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 500', 1, '2026-05-19 17:21:11'),
(78, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 500', 1, '2026-05-19 17:21:13'),
(79, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 500', 1, '2026-05-19 17:21:18'),
(80, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 1200', 1, '2026-05-19 17:21:20'),
(81, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 1200', 1, '2026-05-19 17:21:22'),
(82, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 1200', 1, '2026-05-19 17:21:24'),
(83, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 1200', 1, '2026-05-19 17:21:27'),
(84, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:21:29'),
(85, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:21:31'),
(86, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:21:33'),
(87, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:21:36'),
(88, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:21:38'),
(89, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:21:40'),
(90, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:21:43'),
(91, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:21:46'),
(92, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:21:49'),
(93, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:21:55'),
(94, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:21:58'),
(95, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:22:01'),
(96, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:22:03'),
(97, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:22:06'),
(98, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:22:08'),
(99, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:22:10'),
(100, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:22:13'),
(101, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:22:17'),
(102, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:22:20'),
(103, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:22:25'),
(104, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:22:27'),
(105, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:22:31'),
(106, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:22:33'),
(107, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:22:36'),
(108, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:22:39'),
(109, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:22:41'),
(110, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:22:43'),
(111, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:22:45'),
(112, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:22:48'),
(113, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:22:52'),
(114, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:22:55'),
(115, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:22:57'),
(116, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:23:00'),
(117, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:23:02'),
(118, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:23:05'),
(119, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:23:07'),
(120, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:23:10'),
(121, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:23:12'),
(122, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 2000', 1, '2026-05-19 17:23:14'),
(123, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:28:58'),
(124, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:29:00'),
(125, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:29:03'),
(126, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:29:05'),
(127, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:29:06'),
(128, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:29:07'),
(129, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:29:10'),
(130, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:29:12'),
(131, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:29:14'),
(132, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:29:15'),
(133, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:29:16'),
(134, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:29:18'),
(135, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:29:21'),
(136, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:29:21'),
(137, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:29:23'),
(138, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:29:25'),
(139, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:29:28'),
(140, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:29:30'),
(141, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:29:32'),
(142, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:29:35'),
(143, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:29:39'),
(144, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:29:45'),
(145, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:29:48'),
(146, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:29:53'),
(147, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:29:56'),
(148, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:29:58'),
(149, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:30:01'),
(150, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:30:04'),
(151, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:30:08'),
(152, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:30:10'),
(153, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:30:12'),
(154, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:30:15'),
(155, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:30:18'),
(156, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:30:20'),
(157, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:30:24'),
(158, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:30:26'),
(159, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:30:31'),
(160, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:30:34'),
(161, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:30:37'),
(162, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:30:40'),
(163, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:30:43'),
(164, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:30:45'),
(165, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:30:47'),
(166, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:30:49'),
(167, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:30:51'),
(168, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:30:55'),
(169, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:30:58'),
(170, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:31:01'),
(171, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:31:03'),
(172, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:31:05'),
(173, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:31:08'),
(174, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:31:10'),
(175, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:31:12'),
(176, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:31:14'),
(177, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:31:18'),
(178, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:31:20'),
(179, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:31:22'),
(180, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:31:24'),
(181, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:31:27'),
(182, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:31:29'),
(183, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:31:31'),
(184, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:31:33'),
(185, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:31:35'),
(186, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:31:37'),
(187, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:31:39'),
(188, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:31:42'),
(189, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:31:44'),
(190, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:31:46'),
(191, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:31:48'),
(192, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:31:50'),
(193, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:31:52'),
(194, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:31:54'),
(195, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:31:57'),
(196, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:31:59'),
(197, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:32:01'),
(198, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:32:04'),
(199, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:32:06'),
(200, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:32:08'),
(201, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:32:10'),
(202, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:32:12'),
(203, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:32:17'),
(204, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:32:20'),
(205, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:32:23'),
(206, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:32:27'),
(207, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:32:29'),
(208, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:32:31'),
(209, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:32:33'),
(210, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:32:36'),
(211, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:32:39'),
(212, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:32:42'),
(213, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:32:46'),
(214, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:32:48'),
(215, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:32:50'),
(216, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:32:53'),
(217, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:32:55'),
(218, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:32:57'),
(219, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:33:00'),
(220, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:33:03'),
(221, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:33:06'),
(222, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:33:09'),
(223, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:33:11'),
(224, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:33:14'),
(225, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:33:16'),
(226, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:33:18'),
(227, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:33:20'),
(228, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:33:23');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=223;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=493;

--
-- AUTO_INCREMENT for table `user_activity`
--
ALTER TABLE `user_activity`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=229;

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
