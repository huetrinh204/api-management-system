-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: api_doc_management
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `api_docs`
--

DROP TABLE IF EXISTS `api_docs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `api_docs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `method` enum('GET','POST','PUT','PATCH','DELETE') NOT NULL,
  `endpoint` varchar(500) NOT NULL,
  `description` text NOT NULL,
  `request_sample` text,
  `response_sample` text,
  `status` enum('Draft','Active','Deprecated') NOT NULL DEFAULT 'Draft',
  `created_by` int NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_api_docs_name` (`name`),
  KEY `idx_api_docs_endpoint` (`endpoint`),
  KEY `idx_api_docs_deleted_at` (`deletedAt`),
  KEY `idx_api_docs_status` (`status`),
  KEY `idx_api_docs_project_id` (`project_id`),
  CONSTRAINT `api_docs_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_api_docs_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `api_docs`
--

LOCK TABLES `api_docs` WRITE;
/*!40000 ALTER TABLE `api_docs` DISABLE KEYS */;
INSERT INTO `api_docs` VALUES (1,NULL,'Get Users','GET','/api/users','Lấy danh sách người dùng',NULL,NULL,'Active',1,'2026-10-15 11:09:09','2026-10-17 10:03:21','2026-10-17 10:03:21'),(2,1,'Get User Profile','GET','/api/v1/users/:id','Truy vấn thông tin chi tiết của một người dùng dựa vào ID định danh trên hệ thống.',NULL,'{\n  \"success\": true,\n  \"status\": 200,\n  \"message\": \"Lấy thông tin người dùng thành công\",\n  \"data\": {\n    \"id\": 1,\n    \"name\": \"Nguyễn Văn A\",\n    \"email\": \"nguyenvana@example.com\",\n    \"role\": \"Developer\",\n    \"status\": \"active\",\n    \"created_at\": \"2026-10-17T08:00:00.000Z\"\n  }\n}','Active',1,'2026-10-17 10:06:12','2026-10-17 10:06:12',NULL),(3,1,'Create New User','POST','/api/users','Tạo mới một người dùng vào hệ thống với các thông tin cơ bản được truyền qua request body.','{\n  \"name\": \"Nguyễn Văn A\",\n  \"email\": \"nguyenvana@example.com\",\n  \"role\": \"Developer\",\n  \"status\": \"active\"\n}','{\n  \"success\": true,\n  \"status\": 201,\n  \"message\": \"Tạo người dùng thành công\",\n  \"data\": {\n    \"id\": 3,\n    \"name\": \"Nguyễn Văn A\",\n    \"email\": \"nguyenvana@example.com\",\n    \"role\": \"Developer\",\n    \"status\": \"active\",\n    \"created_at\": \"2026-10-17T17:10:00.000Z\"\n  }\n}','Active',1,'2026-10-17 10:08:07','2026-10-17 10:08:07',NULL),(4,1,'Update User Information','PUT','/api/users/:id','Cập nhật thông tin chi tiết của một người dùng dựa vào ID định danh.','{\n  \"name\": \"Nguyễn Văn A (Updated)\",\n  \"role\": \"Senior Developer\",\n  \"status\": \"active\"\n}','{\n  \"success\": true,\n  \"status\": 200,\n  \"message\": \"Cập nhật người dùng thành công\",\n  \"data\": {\n    \"id\": 1,\n    \"name\": \"Nguyễn Văn A (Updated)\",\n    \"email\": \"nguyenvana@example.com\",\n    \"role\": \"Senior Developer\",\n    \"status\": \"active\",\n    \"updated_at\": \"2026-10-17T17:15:00.000Z\"\n  }\n}','Active',1,'2026-10-17 10:09:05','2026-10-17 10:09:05',NULL),(5,1,'Delete User','DELETE','/api/users/:id','Xóa mềm hoặc xóa vĩnh viễn một người dùng khỏi hệ thống dựa vào ID định danh.',NULL,'{\n  \"success\": true,\n  \"status\": 200,\n  \"message\": \"Xóa người dùng thành công\",\n  \"data\": {\n    \"id\": 1\n  }\n}','Active',1,'2026-10-17 10:09:56','2026-10-17 10:09:56',NULL),(6,1,'Update User Status','PATCH','/api/users/:id/status','Cập nhật nhanh trạng thái hoạt động (active/inactive) của người dùng.','{\n  \"status\": \"inactive\"\n}','{\n  \"success\": true,\n  \"status\": 200,\n  \"message\": \"Cập nhật trạng thái người dùng thành công\",\n  \"data\": {\n    \"id\": 1,\n    \"status\": \"inactive\",\n    \"updated_at\": \"2026-10-17T17:20:00.000Z\"\n  }\n}','Active',1,'2026-10-17 10:10:44','2026-10-17 10:10:44',NULL),(7,2,'Create New Order','POST','/api/v1/orders','Tạo mới một đơn hàng trực tuyến dựa trên giỏ hàng và thông tin thanh toán của khách hàng.','{\n  \"customer_id\": 1024,\n  \"items\": [\n    {\n      \"product_id\": \"PROD-001\",\n      \"quantity\": 2,\n      \"price\": 150000\n    }\n  ],\n  \"shipping_address\": \"123 Đường Hòa Thuận, Vĩnh Long\",\n  \"payment_method\": \"COD\"\n}','{\n  \"success\": true,\n  \"status\": 201,\n  \"message\": \"Tạo đơn hàng thành công\",\n  \"data\": {\n    \"order_id\": \"ORD-2026-9988\",\n    \"total_amount\": 300000,\n    \"status\": \"pending\",\n    \"created_at\": \"2026-10-17T17:13:00.000Z\"\n  }\n}','Active',1,'2026-10-17 10:13:48','2026-10-17 10:13:48',NULL),(8,2,'Get Order List','GET','/api/v1/orders','Lấy danh sách tất cả các đơn hàng có hỗ trợ phân trang và lọc theo trạng thái đơn hàng.',NULL,'{\n  \"success\": true,\n  \"status\": 200,\n  \"message\": \"Lấy danh sách đơn hàng thành công\",\n  \"data\": {\n    \"total\": 12,\n    \"page\": 1,\n    \"limit\": 10,\n    \"items\": [\n      {\n        \"order_id\": \"ORD-2026-9988\",\n        \"customer_id\": 1024,\n        \"total_amount\": 300000,\n        \"status\": \"pending\",\n        \"created_at\": \"2026-10-17T17:13:00.000Z\"\n      }\n    ]\n  }\n}','Active',1,'2026-10-17 10:14:53','2026-10-17 10:14:53',NULL),(9,2,'Update Order Details','PUT','/api/v1/orders/:id','Cập nhật thông tin giao hàng hoặc chi tiết sản phẩm của một đơn hàng dựa trên mã định danh.','{\n  \"shipping_address\": \"456 Đường Nguyễn Huệ, Vĩnh Long\",\n  \"payment_method\": \"Banking\"\n}','{\n  \"success\": true,\n  \"status\": 200,\n  \"message\": \"Cập nhật đơn hàng thành công\",\n  \"data\": {\n    \"order_id\": \"ORD-2026-9988\",\n    \"shipping_address\": \"456 Đường Nguyễn Huệ, Vĩnh Long\",\n    \"payment_method\": \"Banking\",\n    \"updated_at\": \"2026-10-17T17:25:00.000Z\"\n  }\n}','Active',1,'2026-10-17 10:16:04','2026-10-17 10:16:04',NULL),(10,2,'Delete Order','DELETE','/api/v1/orders/:id','Hủy hoặc xóa một đơn hàng khỏi hệ thống dựa trên mã định danh đơn hàng.',NULL,'{\n  \"success\": true,\n  \"status\": 200,\n  \"message\": \"Xóa đơn hàng thành công\",\n  \"data\": {\n    \"order_id\": \"ORD-2026-9988\"\n  }\n}','Active',1,'2026-10-17 10:16:50','2026-10-17 10:16:50',NULL),(11,2,'Get Order Details by ID','GET','/api/v1/orders/:id','Truy vấn toàn bộ thông tin chi tiết và danh sách sản phẩm của một đơn hàng dựa trên mã định danh.',NULL,'{\n  \"success\": true,\n  \"status\": 200,\n  \"message\": \"Lấy chi tiết đơn hàng thành công\",\n  \"data\": {\n    \"order_id\": \"ORD-2026-9988\",\n    \"customer_id\": 1024,\n    \"items\": [\n      {\n        \"product_id\": \"PROD-001\",\n        \"product_name\": \"Tai nghe Bluetooth\",\n        \"quantity\": 2,\n        \"price\": 150000\n      }\n    ],\n    \"total_amount\": 300000,\n    \"shipping_address\": \"123 Đường Hòa Thuận, Vĩnh Long\",\n    \"payment_method\": \"COD\",\n    \"status\": \"pending\",\n    \"created_at\": \"2026-10-17T17:13:00.000Z\"\n  }\n}','Active',1,'2026-10-17 10:17:35','2026-10-17 10:17:35',NULL);
/*!40000 ALTER TABLE `api_docs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL,
  `user_id` int NOT NULL,
  `api_doc_id` int DEFAULT NULL,
  `issue_id` int DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_comments_api_doc_id` (`api_doc_id`),
  KEY `idx_comments_issue_id` (`issue_id`),
  KEY `idx_comments_user_id` (`user_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`api_doc_id`) REFERENCES `api_docs` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `comments_ibfk_3` FOREIGN KEY (`issue_id`) REFERENCES `issues` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,'Cần chỉnh sửa gì không?',2,10,NULL,'2026-10-18 08:47:01','2026-10-18 08:47:01'),(2,'Chỉnh sửa gì không ạ?',6,11,NULL,'2026-10-18 08:48:32','2026-10-18 08:48:32'),(3,'Hiện tại chưa có gì cần chỉnh sửa',2,11,NULL,'2026-10-18 08:50:09','2026-10-18 08:50:09');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `issues`
--

DROP TABLE IF EXISTS `issues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `issues` (
  `id` int NOT NULL AUTO_INCREMENT,
  `api_doc_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `priority` enum('Low','Medium','High') NOT NULL,
  `status` enum('Open','In Progress','Resolved','Closed','Reopened') NOT NULL DEFAULT 'Open',
  `created_by` int NOT NULL,
  `assigned_to` int DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_issues_api_doc_id` (`api_doc_id`),
  KEY `idx_issues_status` (`status`),
  KEY `idx_issues_priority` (`priority`),
  KEY `idx_issues_created_by` (`created_by`),
  KEY `idx_issues_assigned_to` (`assigned_to`),
  CONSTRAINT `issues_ibfk_1` FOREIGN KEY (`api_doc_id`) REFERENCES `api_docs` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `issues_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `issues_ibfk_3` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `issues`
--

LOCK TABLES `issues` WRITE;
/*!40000 ALTER TABLE `issues` DISABLE KEYS */;
INSERT INTO `issues` VALUES (1,1,'Bug test','Mo ta bug','High','Closed',4,NULL,'2026-10-15 11:39:23','2026-10-15 11:39:26'),(2,1,'Bug test','Mo ta bug','High','Closed',4,NULL,'2026-10-15 11:46:47','2026-10-15 11:47:27'),(3,7,'Thiếu validation trường quantity khi tạo order','Mô tả chi tiết:\n- Gửi request POST đến endpoint tạo đơn hàng nhưng bỏ trống trường \"quantity\" thì server bị lỗi 500 thay vì trả về 400 Bad Request.','Medium','Closed',4,NULL,'2026-10-17 11:16:27','2026-10-17 11:17:41');
/*!40000 ALTER TABLE `issues` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` text,
  `color` varchar(7) DEFAULT NULL,
  `status` enum('Active','Archived') NOT NULL DEFAULT 'Active',
  `created_by` int NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `idx_projects_code` (`code`),
  KEY `created_by` (`created_by`),
  KEY `idx_projects_name` (`name`),
  KEY `idx_projects_status` (`status`),
  KEY `idx_projects_deleted_at` (`deletedAt`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (1,'API Management System','AMS','Hệ thống quản lý tài liệu API tập trung hỗ trợ cộng tác giữa các nhóm phát triển, BA và kiểm thử viên.','#3B82F6','Active',1,'2026-10-17 10:04:16','2026-10-17 10:04:16',NULL),(2,'E-Commerce Order Service','ECO','Hệ thống API vi dịch vụ quản lý giỏ hàng, đơn hàng và tích hợp cổng thanh toán trực tuyến.','#F59E0B','Active',1,'2026-10-17 10:12:47','2026-10-17 10:12:47',NULL),(3,'demo','DEMO','demo','#EF4444','Archived',6,'2026-10-18 08:51:53','2026-10-18 08:52:07','2026-10-18 08:52:07'),(4,'j','J',NULL,'#3B82F6','Active',6,'2026-10-18 09:52:10','2026-10-18 09:52:16','2026-10-18 09:52:16'),(5,'s','S',NULL,'#3B82F6','Active',6,'2026-10-18 10:04:38','2026-10-18 10:04:43','2026-10-18 10:04:43');
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sequelizemeta`
--

DROP TABLE IF EXISTS `sequelizemeta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sequelizemeta` (
  `name` varchar(255) COLLATE utf8mb3_unicode_ci NOT NULL,
  PRIMARY KEY (`name`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sequelizemeta`
--

LOCK TABLES `sequelizemeta` WRITE;
/*!40000 ALTER TABLE `sequelizemeta` DISABLE KEYS */;
INSERT INTO `sequelizemeta` VALUES ('20241001000001-create-users.js'),('20241001000002-create-api-docs.js'),('20241001000003-create-issues.js'),('20241001000004-create-comments.js'),('20241218000001-create-projects.js'),('20241218000002-add-project-id-to-api-docs.js'),('20241219000001-add-admin-role-and-status.js'),('20241220000001-add-avatar-to-users.js');
/*!40000 ALTER TABLE `sequelizemeta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('Admin','BA','Backend Developer','Frontend Developer','Tester') NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `avatar_url` varchar(500) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Alice (BA)','ba@example.com','$2a$10$itbLsb0TXMGMJG2.KK4s0O2z2/I.HVCievFj5ll6Qp3Ct9qE3uD/y','BA',1,NULL,'2026-10-15 10:17:54','2026-10-15 10:17:54'),(2,'Bob (Backend Dev)','backend@example.com','$2a$10$p1Ex9AfeynNJa1UgXHMKtOyRskmE.swF3j62zhJtpk1XWclzCx1HG','Backend Developer',1,NULL,'2026-10-15 10:17:55','2026-10-15 10:17:55'),(3,'Carol (Frontend Dev)','frontend@example.com','$2a$10$cdJ4QSA1O2HOBE6vfr0WqeeLqGJxnsXdmZ/UVQPWjAorwVlKSAupe','Frontend Developer',1,NULL,'2026-10-15 10:17:55','2026-10-15 10:17:55'),(4,'Dave (Tester)','tester@example.com','$2a$10$Lg0HRLILPUc/pEhwZji.Eu9zec2duXi.mbfu19VJ4Qo66gR2wv4Fu','Tester',1,NULL,'2026-10-15 10:17:55','2026-10-15 10:17:55'),(5,'System Administrator','admin@apihub.com','$2a$10$Qn1uGL.jH2smexi8WlzgrOK/TbQkb/NAg9GyVfIyPPm9BDUdpp/9K','Admin',1,NULL,'2026-10-18 07:56:03','2026-10-18 07:56:03'),(6,'Lý Minh Hà','lyminhha@gmail.com','$2a$10$xmbhN2SKxZUoI9aOH8LiVOWvCgpiup8d5CVbtN84zBBUDsz3FByqO','BA',1,NULL,'2026-10-18 08:11:15','2026-10-18 10:20:55');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-18 17:43:50
