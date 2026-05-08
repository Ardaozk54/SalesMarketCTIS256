-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Anamakine: mysql:3306
-- Üretim Zamanı: 08 May 2026, 09:02:40
-- Sunucu sürümü: 8.0.45
-- PHP Sürümü: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Veritabanı: `test`
--

-- --------------------------------------------------------
-- Önce ilişkili alt tabloları (Foreign Key bağımlılığı olanları) siliyoruz
-- --------------------------------------------------------
DROP TABLE IF EXISTS `cart_items`;
DROP TABLE IF EXISTS `verification_codes`;
DROP TABLE IF EXISTS `products`;

-- --------------------------------------------------------
-- Son olarak hiçbir bağımlılığı kalmayan ana tabloyu siliyoruz
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;


-- --------------------------------------------------------
-- Tablo yapısı: `users` (Ana Tablo)
-- --------------------------------------------------------
CREATE TABLE `users` (
  `id` int NOT NULL,
  `role` enum('market','consumer') NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `city` varchar(50) NOT NULL,
  `district` varchar(50) NOT NULL,
  `is_verified` tinyint DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Users Verileri
INSERT INTO `users` (`id`, `role`, `email`, `password_hash`, `name`, `city`, `district`, `is_verified`, `created_at`) VALUES
(1, 'market', 'cons1@hotmail.com', '$2b$10$zCPqJdKNjdILOihFXTqc8.ItMV94Z2.0DZiNVJD01bxLbYYJAYFb.', 'Cons1', 'Ankara', 'Ankara', 0, '2026-05-08 07:54:45'),
(5, 'market', 'ismail.akkurt@ug.bilkent.edu.tr', '$2b$10$JIp.EsZ5LZ/hO6xn1AhR5OLwqBnEwNNGZ4ZeMvK70ooWay2kAnjeu', 'Et Urunleri Market', 'Ankara', 'Altındag', 1, '2026-05-08 08:53:52'),
(6, 'market', 'arda.ozkan@ug.bilkent.edu.tr', '$2b$10$JIp.EsZ5LZ/hO6xn1AhR5OLwqBnEwNNGZ4ZeMvK70ooWay2kAnjeu', 'Manav Market', 'Ankara', 'Cankaya', 1, '2026-05-08 08:53:52'),
(7, 'market', 'alper.duru@ug.bilkent.edu.tr', '$2b$10$JIp.EsZ5LZ/hO6xn1AhR5OLwqBnEwNNGZ4ZeMvK70ooWay2kAnjeu', 'Sut Urunleri Market', 'Istanbul', 'Kadikoy', 1, '2026-05-08 08:53:52'),
(8, 'consumer', 'cons2@hotmail.com', '$2b$10$T7lYDLMMK47bGKmG4lhbXOcXVqThIjg0lz8Le8McfhUGkVtNOMjZC', '123', 'Ankara', 'cankaya', 1, '2026-05-08 09:00:04');


-- --------------------------------------------------------
-- Tablo yapısı: `products` (Ana Tablo - Users'a bağlı)
-- --------------------------------------------------------
CREATE TABLE `products` (
  `id` int NOT NULL,
  `market_id` int NOT NULL,
  `title` varchar(100) NOT NULL,
  `stock` int NOT NULL,
  `normal_price` decimal(10,2) NOT NULL,
  `discounted_price` decimal(10,2) NOT NULL,
  `expiration_date` date NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Products Verileri
INSERT INTO `products` (`id`, `market_id`, `title`, `stock`, `normal_price`, `discounted_price`, `expiration_date`, `image`, `created_at`) VALUES
(30, 5, 'Tavuk Gogsu Schnitzel', 18, 165.00, 119.90, '2026-05-15', '/uploads/1777925527489-Chicken Breast Schnitzel.avif', '2026-05-08 08:54:40'),
(31, 5, 'Taze Tavuk Gogsu', 24, 155.00, 109.90, '2026-05-16', '/uploads/1777925591542-Chicken Breasts.webp', '2026-05-08 08:54:40'),
(32, 5, 'Butun Tavuk', 12, 145.00, 104.90, '2026-05-14', '/uploads/1777925664214-Chicken.jpg', '2026-05-08 08:54:40'),
(33, 5, 'Tavuk Nugget', 20, 130.00, 89.90, '2026-05-20', '/uploads/1777925711756-Chicken_Nuggets.webp', '2026-05-08 08:54:40'),
(34, 5, 'Tavuk But', 16, 125.00, 84.90, '2026-05-13', '/uploads/1777925772621-Chicken But.jpg', '2026-05-08 08:54:40'),
(35, 5, 'Dana Biftek', 10, 420.00, 319.90, '2026-05-17', '/uploads/1777925816115-raw steak.jpg', '2026-05-08 08:54:40'),
(36, 5, 'Dana Kiyma', 15, 360.00, 269.90, '2026-04-03', '/uploads/1777925850951-ground beef.jpg', '2026-05-08 08:54:40'),
(37, 5, 'Dana Eti', 9, 390.00, 299.90, '2026-05-19', '/uploads/1777925878604-beef.jpg', '2026-05-08 08:54:40'),
(38, 5, 'Kuzu Pirzola', 8, 480.00, 369.90, '2026-05-16', '/uploads/1777925906578-lamb chop meat.webp', '2026-05-08 08:54:40'),
(39, 5, 'Kasap Ozel Et Paketi', 7, 410.00, 309.90, '2026-05-15', '/uploads/1777925816069-indir.jpg', '2026-05-08 08:54:40'),
(40, 6, 'Muz', 35, 62.50, 44.90, '2026-05-19', '/uploads/1777925486833-Banana.jpg', '2026-05-08 08:54:40'),
(41, 6, 'Yaban Mersini', 18, 95.00, 69.90, '2026-05-16', '/uploads/1777925515774-blueberry.jpg', '2026-05-08 08:54:40'),
(42, 6, 'Avokado', 22, 75.00, 54.90, '2026-05-18', '/uploads/1777925557925-avacado.jpg', '2026-05-08 08:54:40'),
(43, 6, 'Taze Sebze Paketi', 16, 80.00, 57.90, '2026-05-14', '/uploads/1777925586252-images.jpg', '2026-05-08 08:54:40'),
(44, 6, 'Brokoli', 20, 55.00, 39.90, '2026-05-17', '/uploads/1777925615477-broccoli.jpg', '2026-05-08 08:54:40'),
(45, 6, 'Salatalik Paketi', 28, 48.00, 34.90, '2026-05-15', '/uploads/1777925639141-cucumber pack.jpg', '2026-05-08 08:54:40'),
(46, 6, 'Karisik Sebze', 19, 70.00, 49.90, '2026-05-16', '/uploads/1777925671990-images (4).jpg', '2026-05-08 08:54:40'),
(47, 6, 'Ispanak', 26, 42.00, 29.90, '2026-05-14', '/uploads/1777925705398-spinach.jpg', '2026-05-08 08:54:40'),
(48, 6, 'Portakal', 30, 58.00, 41.90, '2026-04-02', '/uploads/1777925731230-orange.jpg', '2026-05-08 08:54:40'),
(49, 6, 'Kirmizi Uzum Kutusu', 14, 88.00, 64.90, '2026-05-17', '/uploads/1777925759789-red grape box.jpg', '2026-05-08 08:54:40'),
(50, 7, 'Gouda Peyniri', 14, 145.00, 109.90, '2026-05-28', '/uploads/1777925142815-gouda-cheese-making-recipe-sweet-237462.jpg', '2026-05-08 08:54:40'),
(51, 7, 'Cheddar Peynir Dilimleri', 18, 132.00, 94.90, '2026-05-25', '/uploads/1777925186502-sharp-cheddar-slices_1.jpg.webp', '2026-05-08 08:54:40'),
(52, 7, 'Sutlu Tatli', 16, 90.00, 64.90, '2026-05-18', '/uploads/1777925238613-842486e7.jpg', '2026-05-08 08:54:40'),
(53, 7, 'Tam Yagli Sut', 25, 52.00, 37.90, '2026-05-22', '/uploads/1777925290425-Great-Value-Whole-Vitamin-D-Milk-Gallon-Plastic-Jug-128-Fl-Oz_6a7b09b4-f51d-4bea-a01c-85767f1b481a.86876244397d83ce6cdedb030abe6e4a.jpeg.webp', '2026-05-08 08:54:40'),
(54, 7, 'Yogurt', 20, 68.00, 49.90, '2026-05-21', '/uploads/1777925377633-images.jpeg', '2026-05-08 08:54:40'),
(55, 7, 'Cikolatali Sut', 24, 58.00, 39.90, '2026-05-24', '/uploads/1777925482906-Great-Value-1-Low-fat-Chocolate-Milk-Gallon-Plastic-Jug-128-Fl-Oz_addfd6e0-ef78-44cc-a103-7fc0552934d6.6e1af96b00d0eff2172e9543b25149b4.jpeg.webp', '2026-05-08 08:54:40'),
(56, 7, 'Cilekli Milkshake', 18, 72.00, 51.90, '2026-05-19', '/uploads/1777925627910-StrawberryMilkshake_RECIPE_053123_3599.jpg.webp', '2026-05-08 08:54:40'),
(57, 7, 'Yaban Mersinli Quark Yogurt', 15, 76.00, 54.90, '2026-05-20', '/uploads/1777925733951-sek-quark-meyveli-yogurt-yaban-mersini-1-b8f9.jpg.webp', '2026-05-08 08:54:40'),
(58, 7, 'Krem Peynir', 12, 85.00, 61.90, '2026-05-23', '/uploads/1777925869481-1281-2.jpg', '2026-05-08 08:54:40');


-- --------------------------------------------------------
-- Tablo yapısı: `cart_items` (Bağlı Alt Tablo)
-- --------------------------------------------------------
CREATE TABLE `cart_items` (
  `id` int NOT NULL,
  `consumer_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- --------------------------------------------------------
-- Tablo yapısı: `verification_codes` (Bağlı Alt Tablo)
-- --------------------------------------------------------
CREATE TABLE `verification_codes` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `code` varchar(6) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Verification Codes Verileri
INSERT INTO `verification_codes` (`id`, `user_id`, `code`, `created_at`) VALUES
(1, 1, '260336', '2026-05-08 07:54:45');


-- --------------------------------------------------------
-- İndekslerin Eklenmesi
-- --------------------------------------------------------

ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `consumer_id` (`consumer_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `market_id` (`market_id`);

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

ALTER TABLE `verification_codes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);


-- --------------------------------------------------------
-- AUTO_INCREMENT Ayarları
-- --------------------------------------------------------

ALTER TABLE `cart_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

ALTER TABLE `products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

ALTER TABLE `verification_codes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;


-- --------------------------------------------------------
-- Kısıtlamaların (Foreign Key) Tanımlanması
-- --------------------------------------------------------

ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`consumer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`market_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `verification_codes`
  ADD CONSTRAINT `verification_codes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
