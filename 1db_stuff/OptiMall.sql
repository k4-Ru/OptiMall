-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: May 21, 2026 at 05:42 PM
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
-- Database: `optimall`
--

-- --------------------------------------------------------

--
-- Table structure for table `bundles`
--

CREATE TABLE `bundles` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `bundle_type` enum('gaming','study','travel','fitness','creator','smart_home','kitchen') NOT NULL,
  `estimated_total_price` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bundle_items`
--

CREATE TABLE `bundle_items` (
  `id` int(11) NOT NULL,
  `bundle_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) GENERATED ALWAYS AS (`quantity` * `unit_price`) STORED,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
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
(93, 1, 'Mechanical Gaming Keyboard', 'Gaming', 2499.00, 4.8, 50, '[\"gaming\",\"keyboard\",\"rgb\",\"pc\"]', '/images/93.png'),
(94, 1, 'Gaming Mouse RGB', 'Gaming', 1499.00, 4.7, 60, '[\"gaming\",\"mouse\",\"rgb\",\"pc\"]', '/images/94.png'),
(95, 1, 'Extended Mouse Pad', 'Gaming', 699.00, 4.6, 70, '[\"gaming\",\"mousepad\",\"desk\"]', '/images/94.png'),
(96, 1, 'Gaming Headset Surround', 'Gaming', 1999.00, 4.7, 40, '[\"gaming\",\"headset\",\"audio\"]', '/images/landing_shopper_hero_1.png'),
(97, 1, 'USB Microphone', 'Gaming', 2899.00, 4.8, 35, '[\"streaming\",\"microphone\",\"gaming\"]', '/images/9.png'),
(98, 1, '1080p Webcam', 'Gaming', 1799.00, 4.5, 45, '[\"streaming\",\"camera\",\"webcam\"]', '/images/98.png'),
(99, 1, 'Gaming Chair Ergonomic', 'Gaming', 6999.00, 4.6, 20, '[\"gaming\",\"chair\",\"comfort\"]', '/images/99.png'),
(100, 1, 'Dual Monitor Arm', 'Gaming', 2399.00, 4.7, 25, '[\"monitor\",\"desk\",\"setup\"]', '/images/100.png'),
(101, 1, 'Gaming Monitor 144Hz', 'Gaming', 8999.00, 4.9, 15, '[\"monitor\",\"gaming\",\"display\"]', '/images/101.png'),
(102, 1, 'RGB Desk Light Bar', 'Gaming', 1299.00, 4.5, 40, '[\"lighting\",\"desk\",\"rgb\"]', '/images/102.png'),
(103, 2, 'Laptop Backpack', 'Study Essentials', 1499.00, 4.7, 80, '[\"student\",\"bag\",\"travel\"]', '/images/103.png'),
(104, 2, 'Wireless Mouse Silent', 'Office & Productivity', 799.00, 4.6, 100, '[\"mouse\",\"office\",\"student\"]', '/images/104.png'),
(105, 2, 'Laptop Stand Aluminum', 'Office & Productivity', 1199.00, 4.8, 60, '[\"laptop\",\"stand\",\"ergonomic\"]', '/images/105.png'),
(106, 2, 'USB-C Hub 7-in-1', 'Office & Productivity', 1899.00, 4.7, 45, '[\"usb-c\",\"hub\",\"adapter\"]', '/images/106.png'),
(107, 2, 'Portable SSD 1TB', 'Office & Productivity', 4599.00, 4.8, 35, '[\"storage\",\"ssd\",\"backup\"]', '/images/107.png'),
(108, 2, 'Blue Light Glasses', 'Study Essentials', 599.00, 4.4, 90, '[\"study\",\"eye-care\",\"productivity\"]', '/images/108.png'),
(109, 2, 'Noise Cancelling Earbuds', 'Audio', 2599.00, 4.7, 55, '[\"audio\",\"study\",\"wireless\"]', '/images/earbuds.png'),
(110, 2, 'Desk Organizer', 'Office & Productivity', 499.00, 4.5, 75, '[\"desk\",\"organization\",\"office\"]', '/images/110.png'),
(111, 2, 'Smart Notebook', 'Study Essentials', 899.00, 4.5, 50, '[\"notes\",\"student\",\"study\"]', '/images/111.png'),
(112, 2, 'Portable Desk Fan', 'Study Essentials', 699.00, 4.3, 65, '[\"desk\",\"cooling\",\"portable\"]', '/images/112.png'),
(113, 3, '20W Fast Charger', 'Mobile Accessories', 799.00, 4.7, 120, '[\"charger\",\"mobile\",\"fast-charge\"]', '/images/113.png'),
(114, 3, 'USB-C Cable Braided', 'Mobile Accessories', 299.00, 4.6, 150, '[\"cable\",\"usb-c\",\"mobile\"]', '/images/114.png'),
(115, 3, 'MagSafe Power Bank', 'Mobile Accessories', 1899.00, 4.7, 50, '[\"powerbank\",\"wireless\",\"iphone\"]', '/images/115.png'),
(116, 3, 'Phone Stand Adjustable', 'Mobile Accessories', 399.00, 4.5, 90, '[\"phone\",\"stand\",\"desk\"]', '/images/116.png'),
(117, 3, 'Tempered Glass Screen Protector', 'Mobile Accessories', 199.00, 4.4, 200, '[\"screen\",\"protection\",\"mobile\"]', '/images/117.png'),
(118, 3, 'Shockproof Phone Case', 'Mobile Accessories', 499.00, 4.6, 110, '[\"case\",\"protection\",\"mobile\"]', '/images/118.png'),
(119, 3, 'Wireless Charging Pad', 'Mobile Accessories', 999.00, 4.5, 70, '[\"wireless\",\"charging\",\"desk\"]', '/images/119.png'),
(120, 3, 'Bluetooth Selfie Stick', 'Mobile Accessories', 699.00, 4.3, 60, '[\"camera\",\"travel\",\"mobile\"]', '/images/120.png'),
(121, 3, 'Car Phone Mount', 'Mobile Accessories', 599.00, 4.5, 75, '[\"car\",\"mount\",\"mobile\"]', '/images/121.png'),
(122, 3, 'Waterproof Phone Pouch', 'Travel', 349.00, 4.4, 85, '[\"travel\",\"waterproof\",\"beach\"]', '/images/122.png'),
(123, 4, 'Smart LED Bulb', 'Smart Home', 499.00, 4.5, 90, '[\"smart-home\",\"lighting\",\"wifi\"]', '/images/123.png'),
(124, 4, 'Smart Plug WiFi', 'Smart Home', 699.00, 4.6, 80, '[\"smart-home\",\"automation\",\"wifi\"]', '/images/124.png'),
(125, 4, 'Smart Security Camera', 'Smart Home', 2499.00, 4.7, 40, '[\"camera\",\"security\",\"wifi\"]', '/images/125.png'),
(126, 4, 'Video Doorbell', 'Smart Home', 3999.00, 4.7, 25, '[\"security\",\"doorbell\",\"camera\"]', '/images/126.png'),
(127, 4, 'Robot Vacuum Cleaner', 'Smart Home', 8999.00, 4.8, 20, '[\"cleaning\",\"robot\",\"smart-home\"]', '/images/127.png'),
(128, 4, 'Air Purifier HEPA', 'Home Essentials', 5499.00, 4.8, 30, '[\"air\",\"health\",\"home\"]', '/images/128.png'),
(129, 4, 'Smart Humidifier', 'Home Essentials', 2199.00, 4.6, 35, '[\"humidity\",\"air\",\"smart-home\"]', '/images/129.png'),
(130, 4, 'WiFi Smart Strip', 'Smart Home', 1299.00, 4.5, 50, '[\"power\",\"wifi\",\"automation\"]', '/images/130.png'),
(131, 4, 'Smart Thermometer', 'Smart Home', 999.00, 4.4, 60, '[\"temperature\",\"sensor\",\"smart\"]', '/images/131.png'),
(132, 4, 'Motion Sensor Light', 'Smart Home', 899.00, 4.5, 55, '[\"motion\",\"lighting\",\"security\"]', '/images/132.png'),
(133, 5, 'Yoga Mat Premium', 'Fitness', 999.00, 4.7, 70, '[\"fitness\",\"yoga\",\"exercise\"]', '/images/133.png'),
(134, 5, 'Resistance Bands Set', 'Fitness', 799.00, 4.6, 65, '[\"fitness\",\"bands\",\"workout\"]', '/images/134.png'),
(135, 5, 'Adjustable Dumbbells', 'Fitness', 6999.00, 4.8, 20, '[\"weights\",\"gym\",\"fitness\"]', '/images/135.png'),
(136, 5, 'Smart Fitness Watch', 'Fitness', 3499.00, 4.7, 40, '[\"fitness\",\"watch\",\"health\"]', '/images/136.png'),
(137, 5, 'Protein Shaker Bottle', 'Fitness', 399.00, 4.5, 90, '[\"protein\",\"gym\",\"nutrition\"]', '/images/137.png'),
(138, 5, 'Foam Roller', 'Fitness', 699.00, 4.5, 60, '[\"recovery\",\"fitness\",\"massage\"]', '/images/138.png'),
(139, 5, 'Running Shoes', 'Fashion', 3999.00, 4.8, 35, '[\"running\",\"fitness\",\"sports\"]', '/images/139.png'),
(140, 5, 'Gym Backpack', 'Fitness', 1499.00, 4.6, 45, '[\"gym\",\"bag\",\"fitness\"]', '/images/140.png'),
(141, 5, 'Wireless Sports Earbuds', 'Audio', 2299.00, 4.6, 50, '[\"fitness\",\"audio\",\"wireless\"]', '/images/141.png'),
(142, 5, 'Hydration Water Bottle', 'Fitness', 499.00, 4.5, 100, '[\"water\",\"gym\",\"hydration\"]', '/images/142.png'),
(143, 11, 'Budget Mechanical Keyboard', 'Gaming', 1599.00, 4.5, 70, '[\"gaming\",\"keyboard\",\"budget\",\"rgb\"]', '/images/143.png'),
(144, 11, 'Entry Gaming Mouse', 'Gaming', 699.00, 4.4, 120, '[\"gaming\",\"mouse\",\"budget\"]', '/images/144.png'),
(145, 11, 'USB WiFi Adapter', 'Electronics', 499.00, 4.3, 150, '[\"wifi\",\"adapter\",\"pc\"]', '/images/145.png'),
(146, 11, 'Bluetooth 5.3 Dongle', 'Electronics', 399.00, 4.2, 140, '[\"bluetooth\",\"adapter\",\"pc\"]', '/images/146.png'),
(147, 11, 'Portable Power Bank 20000mAh', 'Mobile Accessories', 1499.00, 4.6, 90, '[\"powerbank\",\"travel\",\"mobile\"]', '/images/147.png'),
(148, 11, 'Fast Charger 65W USB-C', 'Mobile Accessories', 1299.00, 4.7, 80, '[\"charger\",\"usb-c\",\"fast-charge\"]', '/images/148.png'),
(149, 11, 'Braided USB-C Cable 2m', 'Mobile Accessories', 299.00, 4.5, 200, '[\"cable\",\"usb-c\",\"charging\"]', '/images/149.png'),
(150, 11, 'Laptop Cooling Pad', 'Office & Productivity', 999.00, 4.4, 75, '[\"laptop\",\"cooling\",\"study\"]', '/images/150.png'),
(151, 12, 'Student Planner Notebook', 'Study Essentials', 199.00, 4.6, 180, '[\"student\",\"planner\",\"notes\"]', '/images/151.png'),
(152, 12, 'Desk Organizer Set', 'Study Essentials', 349.00, 4.5, 140, '[\"desk\",\"organizer\",\"study\"]', '/images/152.png'),
(153, 12, 'Rechargeable Desk Lamp', 'Study Essentials', 899.00, 4.7, 95, '[\"lamp\",\"study\",\"desk\"]', '/images/153.png'),
(154, 12, 'Scientific Calculator', 'Study Essentials', 799.00, 4.6, 85, '[\"calculator\",\"school\",\"study\"]', '/images/154.png'),
(155, 12, 'A4 Bond Paper Ream', 'Study Essentials', 289.00, 4.4, 160, '[\"paper\",\"school\",\"printing\"]', '/images/155.png'),
(156, 12, 'Printer Ink Refill Kit', 'Office & Productivity', 699.00, 4.3, 70, '[\"printer\",\"ink\",\"office\"]', '/images/156.png'),
(157, 12, 'Wireless Presenter Clicker', 'Office & Productivity', 599.00, 4.5, 60, '[\"presentation\",\"school\",\"office\"]', '/images/157.png'),
(158, 12, 'Laptop Sleeve 14 inch', 'Study Essentials', 499.00, 4.6, 100, '[\"laptop\",\"sleeve\",\"student\"]', '/images/158.png'),
(159, 13, 'RGB Gaming Speaker Bar', 'Gaming', 1399.00, 4.6, 55, '[\"gaming\",\"speaker\",\"rgb\"]', '/images/159.png'),
(160, 13, 'Controller Gamepad Wireless', 'Gaming', 1799.00, 4.7, 50, '[\"gaming\",\"controller\",\"wireless\"]', '/images/160.png'),
(161, 13, 'Gaming Desk 120cm', 'Gaming', 4999.00, 4.6, 18, '[\"gaming\",\"desk\",\"setup\"]', '/images/161.png'),
(162, 13, 'Monitor Riser Stand', 'Gaming', 899.00, 4.5, 70, '[\"monitor\",\"stand\",\"desk\"]', '/images/162.png'),
(163, 13, 'Headset Stand RGB', 'Gaming', 799.00, 4.4, 85, '[\"gaming\",\"headset\",\"stand\"]', '/images/163.png'),
(164, 13, '144Hz HDMI Cable', 'Gaming', 399.00, 4.3, 130, '[\"hdmi\",\"monitor\",\"gaming\"]', '/images/164.png'),
(165, 13, 'Thermal Paste Kit', 'Gaming', 349.00, 4.4, 90, '[\"pc\",\"thermal\",\"maintenance\"]', '/images/165.png'),
(166, 13, 'PC Cleaning Air Blower', 'Gaming', 1199.00, 4.5, 45, '[\"pc\",\"cleaning\",\"maintenance\"]', '/images/166.png'),
(167, 14, 'Smart LED Bulb 4-Pack', 'Smart Home', 1299.00, 4.6, 80, '[\"smart-home\",\"lighting\",\"wifi\"]', '/images/167.png'),
(168, 14, 'Smart Plug Mini', 'Smart Home', 499.00, 4.5, 110, '[\"smart-home\",\"plug\",\"wifi\"]', '/images/168.png'),
(169, 14, 'Door Sensor Alarm', 'Smart Home', 899.00, 4.4, 70, '[\"security\",\"sensor\",\"home\"]', '/images/169.png'),
(170, 14, 'WiFi Security Camera', 'Smart Home', 1899.00, 4.6, 45, '[\"camera\",\"security\",\"wifi\"]', '/images/170.png'),
(171, 14, 'Automatic Soap Dispenser', 'Home Essentials', 799.00, 4.3, 75, '[\"home\",\"hygiene\",\"dispenser\"]', '/images/171.png'),
(172, 14, 'Foldable Storage Box Set', 'Home Essentials', 599.00, 4.4, 120, '[\"storage\",\"home\",\"organizer\"]', '/images/172.png'),
(173, 14, 'Mini Air Purifier', 'Home Essentials', 1799.00, 4.5, 40, '[\"air\",\"purifier\",\"home\"]', '/images/173.png'),
(174, 14, 'Digital Room Thermometer', 'Home Essentials', 349.00, 4.2, 100, '[\"thermometer\",\"home\",\"room\"]', '/images/174.png'),
(175, 15, 'Smart Fitness Band', 'Fitness', 1699.00, 4.6, 65, '[\"fitness\",\"wearable\",\"health\"]', '/images/175.png'),
(176, 15, 'Yoga Mat Non-Slip', 'Fitness', 699.00, 4.5, 90, '[\"fitness\",\"yoga\",\"exercise\"]', '/images/176.png'),
(177, 15, 'Resistance Bands Set', 'Fitness', 499.00, 4.4, 110, '[\"fitness\",\"bands\",\"workout\"]', '/images/177.png'),
(178, 15, 'Adjustable Dumbbell Pair', 'Fitness', 2999.00, 4.7, 25, '[\"fitness\",\"dumbbell\",\"strength\"]', '/images/178.png'),
(179, 15, 'Insulated Water Bottle', 'Fitness', 499.00, 4.6, 120, '[\"water\",\"fitness\",\"bottle\"]', '/images/179.png'),
(180, 15, 'Running Waist Bag', 'Fitness', 399.00, 4.3, 100, '[\"running\",\"bag\",\"fitness\"]', '/images/180.png'),
(181, 15, 'Jump Rope Digital Counter', 'Fitness', 349.00, 4.4, 105, '[\"fitness\",\"jump-rope\",\"cardio\"]', '/images/181.png'),
(182, 15, 'Posture Corrector Brace', 'Fitness', 599.00, 4.2, 85, '[\"posture\",\"back\",\"health\"]', '/images/182.png'),
(183, 16, 'USB Condenser Microphone', 'Content Creation', 2499.00, 4.8, 40, '[\"creator\",\"microphone\",\"streaming\"]', '/images/183.png'),
(184, 16, 'LED Ring Light 12 inch', 'Content Creation', 1199.00, 4.6, 75, '[\"creator\",\"lighting\",\"video\"]', '/images/184.png'),
(185, 16, 'Phone Tripod Stand', 'Content Creation', 799.00, 4.5, 100, '[\"tripod\",\"phone\",\"creator\"]', '/images/185.png'),
(186, 16, 'Lavalier Microphone Wireless', 'Content Creation', 1899.00, 4.6, 55, '[\"microphone\",\"wireless\",\"creator\"]', '/images/186.png'),
(187, 16, 'Portable Photo Light Box', 'Content Creation', 1599.00, 4.5, 45, '[\"product-photo\",\"creator\",\"lighting\"]', '/images/187.png'),
(188, 16, 'Camera SD Card 128GB', 'Content Creation', 899.00, 4.7, 90, '[\"camera\",\"storage\",\"sd-card\"]', '/images/188.png'),
(189, 16, 'Video Editing Shortcut Keyboard', 'Content Creation', 2999.00, 4.6, 22, '[\"editing\",\"keyboard\",\"creator\"]', '/images/189.png'),
(190, 16, 'Acoustic Foam Panels 12pcs', 'Content Creation', 1299.00, 4.4, 60, '[\"audio\",\"foam\",\"studio\"]', '/images/190.png'),
(191, 17, 'Travel Neck Pillow', 'Travel', 399.00, 4.5, 130, '[\"travel\",\"comfort\",\"pillow\"]', '/images/191.png'),
(192, 17, 'Packing Cubes Set', 'Travel', 599.00, 4.6, 120, '[\"travel\",\"packing\",\"organizer\"]', '/images/192.png'),
(193, 17, 'Universal Travel Adapter', 'Travel', 799.00, 4.7, 80, '[\"travel\",\"adapter\",\"charger\"]', '/images/193.png'),
(194, 17, 'Anti-Theft Sling Bag', 'Travel', 1099.00, 4.5, 70, '[\"travel\",\"bag\",\"security\"]', '/images/194.png'),
(195, 17, 'Digital Luggage Scale', 'Travel', 499.00, 4.4, 95, '[\"travel\",\"luggage\",\"scale\"]', '/images/195.png'),
(196, 17, 'Rainproof Backpack Cover', 'Travel', 299.00, 4.3, 140, '[\"travel\",\"rain\",\"bag\"]', '/images/196.png'),
(197, 17, 'Vacuum Travel Bottle Set', 'Travel', 349.00, 4.2, 100, '[\"travel\",\"bottle\",\"toiletries\"]', '/images/197.png'),
(198, 17, 'Compact Umbrella Windproof', 'Travel', 499.00, 4.5, 110, '[\"umbrella\",\"travel\",\"rain\"]', '/images/198.png'),
(199, 18, 'Automatic Pet Feeder', 'Pet Supplies', 2299.00, 4.6, 35, '[\"pet\",\"feeder\",\"automatic\"]', '/images/199.png'),
(200, 18, 'Pet Water Fountain', 'Pet Supplies', 1699.00, 4.5, 45, '[\"pet\",\"water\",\"fountain\"]', '/images/200.png'),
(201, 18, 'Cat Scratching Post', 'Pet Supplies', 899.00, 4.4, 75, '[\"cat\",\"scratch\",\"pet\"]', '/images/201.png'),
(202, 18, 'Dog Harness Adjustable', 'Pet Supplies', 599.00, 4.5, 100, '[\"dog\",\"harness\",\"pet\"]', '/images/202.png'),
(203, 18, 'Pet Grooming Brush', 'Pet Supplies', 349.00, 4.4, 130, '[\"pet\",\"grooming\",\"brush\"]', '/images/203.png'),
(204, 18, 'Pet Carrier Bag', 'Pet Supplies', 1299.00, 4.6, 60, '[\"pet\",\"carrier\",\"travel\"]', '/images/204.png'),
(205, 18, 'Training Treat Pouch', 'Pet Supplies', 299.00, 4.3, 120, '[\"pet\",\"training\",\"dog\"]', '/images/205.png'),
(206, 18, 'Washable Pet Bed', 'Pet Supplies', 1199.00, 4.5, 55, '[\"pet\",\"bed\",\"comfort\"]', '/images/206.png'),
(207, 19, 'Air Fryer 4L', 'Kitchen', 3499.00, 4.8, 30, '[\"kitchen\",\"air-fryer\",\"cooking\"]', '/images/207.png'),
(208, 19, 'Rice Cooker 1.8L', 'Kitchen', 1899.00, 4.6, 50, '[\"kitchen\",\"rice-cooker\",\"home\"]', '/images/208.png'),
(209, 19, 'Electric Kettle Stainless', 'Kitchen', 999.00, 4.5, 80, '[\"kitchen\",\"kettle\",\"appliance\"]', '/images/209.png'),
(210, 19, 'Blender 1.5L', 'Kitchen', 1599.00, 4.6, 45, '[\"kitchen\",\"blender\",\"smoothie\"]', '/images/210.png'),
(211, 19, 'Non-Stick Pan Set', 'Kitchen', 1299.00, 4.5, 65, '[\"kitchen\",\"pan\",\"cooking\"]', '/images/211.png'),
(212, 19, 'Digital Kitchen Scale', 'Kitchen', 599.00, 4.4, 95, '[\"kitchen\",\"scale\",\"baking\"]', '/images/212.png'),
(213, 19, 'Meal Prep Containers 10pcs', 'Kitchen', 499.00, 4.5, 120, '[\"kitchen\",\"containers\",\"meal-prep\"]', '/images/213.png'),
(214, 19, 'Knife Set with Block', 'Kitchen', 1499.00, 4.6, 40, '[\"kitchen\",\"knife\",\"cooking\"]', '/images/214.png'),
(215, 20, 'Budget Earbuds Wired', 'Mobile Accessories', 199.00, 4.2, 220, '[\"earbuds\",\"budget\",\"audio\"]', '/images/215.png'),
(216, 20, 'Basic Phone Stand', 'Mobile Accessories', 149.00, 4.3, 200, '[\"phone\",\"stand\",\"desk\"]', '/images/216.png'),
(217, 20, 'Mini Bluetooth Speaker', 'Audio', 699.00, 4.4, 100, '[\"speaker\",\"bluetooth\",\"audio\"]', '/images/217.png'),
(218, 20, 'Rechargeable Flashlight', 'Home Essentials', 399.00, 4.5, 140, '[\"flashlight\",\"emergency\",\"home\"]', '/images/218.png'),
(219, 20, 'Extension Cord 4-Gang', 'Home Essentials', 499.00, 4.4, 150, '[\"extension\",\"power\",\"home\"]', '/images/219.png'),
(220, 20, 'Budget Backpack', 'Study Essentials', 699.00, 4.3, 120, '[\"bag\",\"student\",\"budget\"]', '/images/220.png'),
(221, 20, 'Reusable Eco Bag Set', 'Home Essentials', 199.00, 4.4, 180, '[\"eco\",\"bag\",\"shopping\"]', '/images/221.png'),
(222, 20, 'Mini Desk Fan USB', 'Office & Productivity', 399.00, 4.5, 130, '[\"fan\",\"desk\",\"usb\"]', '/images/222.png');

-- --------------------------------------------------------

--
-- Table structure for table `product_embeddings`
--

CREATE TABLE `product_embeddings` (
  `product_id` int(11) NOT NULL,
  `embedding` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`embedding`)),
  `embedding_model` varchar(100) DEFAULT 'text-embedding-3-small',
  `embedding_dimension` int(11) DEFAULT 1536,
  `generated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Table structure for table `product_relationships`
--

CREATE TABLE `product_relationships` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `related_product_id` int(11) NOT NULL,
  `relationship_type` enum('frequently_bought_together','accessory','replacement','premium_upgrade','budget_alternative','streaming_setup','gaming_setup','study_setup','travel_bundle','fitness_bundle','creator_bundle') NOT NULL,
  `strength_score` decimal(3,2) DEFAULT 0.50,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_reviews`
--

CREATE TABLE `product_reviews` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` between 1 and 5),
  `review_text` text DEFAULT NULL,
  `sentiment_label` enum('positive','neutral','negative') DEFAULT 'neutral',
  `sentiment_score` decimal(4,3) DEFAULT 0.000,
  `helpful_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `recommendation_feedback`
--

CREATE TABLE `recommendation_feedback` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `recommended_product_id` int(11) NOT NULL,
  `recommendation_source` enum('homepage','bundle_engine','similar_products','trending','ai_reranking','session_based') DEFAULT 'homepage',
  `was_clicked` tinyint(1) DEFAULT 0,
  `was_carted` tinyint(1) DEFAULT 0,
  `was_purchased` tinyint(1) DEFAULT 0,
  `feedback_score` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
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
-- Table structure for table `search_logs`
--

CREATE TABLE `search_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `query_text` varchar(255) NOT NULL,
  `results_count` int(11) DEFAULT 0,
  `clicked_product_id` int(11) DEFAULT NULL,
  `search_duration_ms` int(11) DEFAULT 0,
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
(4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', NULL, NULL, 'customer', '2026-05-18 13:35:51', '2026-05-18 13:38:23'),
(493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', NULL, NULL, 'customer', '2026-05-20 13:23:57', '2026-05-20 13:23:57');

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
(228, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-19 17:33:23'),
(229, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 14:31:51'),
(230, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 6300', 1, '2026-05-20 14:31:52'),
(231, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 6300', 1, '2026-05-20 14:31:52'),
(232, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 6300', 1, '2026-05-20 14:31:53'),
(233, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 6300', 1, '2026-05-20 14:31:53'),
(234, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 6300', 1, '2026-05-20 14:31:54'),
(235, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 6300', 1, '2026-05-20 14:31:54'),
(236, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 6300', 1, '2026-05-20 14:31:55'),
(237, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 6300', 1, '2026-05-20 14:31:55'),
(238, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 14:50:14'),
(239, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 14:50:14'),
(240, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 14:50:15'),
(241, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 14:50:15'),
(242, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 14:50:16'),
(243, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 16:25:29'),
(244, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 16:25:30'),
(245, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 16:25:30'),
(246, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 16:25:30'),
(247, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 16:25:31'),
(248, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 16:25:31'),
(249, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 16:25:32'),
(250, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 16:25:32'),
(251, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 16:25:33'),
(252, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 16:25:33'),
(253, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 16:25:34'),
(254, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 16:25:34'),
(255, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 16:26:08'),
(256, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 16:26:09'),
(257, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 16:26:09'),
(258, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 16:26:10'),
(259, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 16:26:10'),
(260, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 16:26:11'),
(261, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 16:26:11'),
(262, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 16:26:12'),
(263, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 16:26:12'),
(264, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 16:26:13'),
(265, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 16:26:13'),
(266, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 16:26:14'),
(267, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 16:26:14'),
(268, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 16:26:15'),
(269, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 16:26:15'),
(270, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 16:26:16'),
(271, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 16:26:16'),
(272, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 16:26:17'),
(273, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 16:26:17'),
(274, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 16:26:18'),
(275, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 16:26:18'),
(276, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 16:26:18'),
(277, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 16:26:19'),
(278, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-20 16:26:19'),
(279, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 17:55:33'),
(280, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 17:55:34'),
(281, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 17:55:34'),
(282, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 17:55:35'),
(283, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 17:55:35'),
(284, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 17:55:36'),
(285, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 17:55:36'),
(286, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 17:55:37'),
(287, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 17:55:37'),
(288, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 17:55:38'),
(289, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 17:55:38'),
(290, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 17:55:39'),
(291, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 17:55:39'),
(292, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 17:55:40'),
(293, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 17:55:40'),
(294, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 17:55:40'),
(295, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 17:55:41'),
(296, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 17:55:41'),
(297, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 17:55:42'),
(298, 493, 'user_3Dz85hGzSig97OrI7Khcj5qw9uL', 'search', NULL, NULL, 'Study Setup @ 5000', 1, '2026-05-20 17:55:42'),
(299, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-21 15:09:50'),
(300, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-21 15:09:50'),
(301, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-21 15:09:51'),
(302, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-21 15:09:51'),
(303, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-21 15:09:51'),
(304, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-21 15:09:52'),
(305, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-21 15:09:52'),
(306, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-21 15:09:53'),
(307, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-21 15:09:53'),
(308, 4, 'user_3DtpffhjkNZAkH3rQwRccYAfOCD', 'search', NULL, NULL, 'Study Setup @ 3800', 1, '2026-05-21 15:09:53');

-- --------------------------------------------------------

--
-- Table structure for table `user_interactions`
--

CREATE TABLE `user_interactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `interaction_type` enum('viewed','clicked','carted','purchased','wishlisted','compared','shared','searched') NOT NULL,
  `duration_seconds` int(11) DEFAULT 0,
  `session_id` varchar(100) DEFAULT NULL,
  `device_type` enum('mobile','desktop','tablet') DEFAULT 'mobile',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bundles`
--
ALTER TABLE `bundles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bundle_items`
--
ALTER TABLE `bundle_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_bi_bundle` (`bundle_id`),
  ADD KEY `idx_bi_product` (`product_id`);

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
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_oi_order` (`order_id`),
  ADD KEY `idx_oi_product` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `seller_id` (`seller_id`);

--
-- Indexes for table `product_embeddings`
--
ALTER TABLE `product_embeddings`
  ADD PRIMARY KEY (`product_id`);

--
-- Indexes for table `product_metadata`
--
ALTER TABLE `product_metadata`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_product_metadata_product_id` (`product_id`);

--
-- Indexes for table `product_relationships`
--
ALTER TABLE `product_relationships`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pr_product` (`product_id`),
  ADD KEY `idx_pr_related_product` (`related_product_id`),
  ADD KEY `idx_pr_relationship_type` (`relationship_type`);

--
-- Indexes for table `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_prv_user` (`user_id`),
  ADD KEY `idx_prv_product` (`product_id`),
  ADD KEY `idx_prv_sentiment` (`sentiment_label`);

--
-- Indexes for table `recommendation_feedback`
--
ALTER TABLE `recommendation_feedback`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_rf_user` (`user_id`),
  ADD KEY `idx_rf_product` (`recommended_product_id`);

--
-- Indexes for table `recommendation_logs`
--
ALTER TABLE `recommendation_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_recommendation_logs_clerk_user_id` (`clerk_user_id`),
  ADD KEY `idx_recommendation_logs_user_id` (`user_id`),
  ADD KEY `idx_recommendation_logs_source_product_id` (`source_product_id`);

--
-- Indexes for table `search_logs`
--
ALTER TABLE `search_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sl_clicked_product` (`clicked_product_id`),
  ADD KEY `idx_sl_user` (`user_id`),
  ADD KEY `idx_sl_query` (`query_text`),
  ADD KEY `idx_sl_created_at` (`created_at`);

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
-- Indexes for table `user_interactions`
--
ALTER TABLE `user_interactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ui_user` (`user_id`),
  ADD KEY `idx_ui_product` (`product_id`),
  ADD KEY `idx_ui_interaction_type` (`interaction_type`),
  ADD KEY `idx_ui_created_at` (`created_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bundles`
--
ALTER TABLE `bundles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bundle_items`
--
ALTER TABLE `bundle_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
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
-- AUTO_INCREMENT for table `product_relationships`
--
ALTER TABLE `product_relationships`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_reviews`
--
ALTER TABLE `product_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `recommendation_feedback`
--
ALTER TABLE `recommendation_feedback`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `recommendation_logs`
--
ALTER TABLE `recommendation_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `search_logs`
--
ALTER TABLE `search_logs`
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1021;

--
-- AUTO_INCREMENT for table `user_activity`
--
ALTER TABLE `user_activity`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=309;

--
-- AUTO_INCREMENT for table `user_interactions`
--
ALTER TABLE `user_interactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bundle_items`
--
ALTER TABLE `bundle_items`
  ADD CONSTRAINT `fk_bi_bundle` FOREIGN KEY (`bundle_id`) REFERENCES `bundles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_bi_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_oi_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_oi_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`id`);

--
-- Constraints for table `product_embeddings`
--
ALTER TABLE `product_embeddings`
  ADD CONSTRAINT `fk_pe_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_metadata`
--
ALTER TABLE `product_metadata`
  ADD CONSTRAINT `fk_product_metadata_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `product_relationships`
--
ALTER TABLE `product_relationships`
  ADD CONSTRAINT `fk_pr_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pr_related_product` FOREIGN KEY (`related_product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD CONSTRAINT `fk_prv_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_prv_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `recommendation_feedback`
--
ALTER TABLE `recommendation_feedback`
  ADD CONSTRAINT `fk_rf_product` FOREIGN KEY (`recommended_product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_rf_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `recommendation_logs`
--
ALTER TABLE `recommendation_logs`
  ADD CONSTRAINT `fk_recommendation_logs_product` FOREIGN KEY (`source_product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `fk_recommendation_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `search_logs`
--
ALTER TABLE `search_logs`
  ADD CONSTRAINT `fk_sl_clicked_product` FOREIGN KEY (`clicked_product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_sl_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_activity`
--
ALTER TABLE `user_activity`
  ADD CONSTRAINT `fk_user_activity_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `fk_user_activity_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `user_interactions`
--
ALTER TABLE `user_interactions`
  ADD CONSTRAINT `fk_ui_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ui_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
