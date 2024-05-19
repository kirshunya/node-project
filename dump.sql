-- MySQL dump 10.13  Distrib 8.0.36, for Linux (x86_64)
--
-- Host: localhost    Database: wiwi56
-- ------------------------------------------------------
-- Server version	8.0.36-0ubuntu0.20.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bots`
--

DROP TABLE IF EXISTS `bots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `gameLotoWon` int DEFAULT '0',
  `lotoTokens` float DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bots`
--

LOCK TABLES `bots` WRITE;
/*!40000 ALTER TABLE `bots` DISABLE KEYS */;
INSERT INTO `bots` VALUES (1,'Odell',0,10,'2024-02-24 17:04:22','2024-02-24 17:04:22'),(2,'Yuk',0,10,'2024-02-24 17:04:22','2024-02-24 17:04:22'),(3,'Harriett',0,10,'2024-02-24 17:04:22','2024-02-24 17:04:22'),(4,'Jane',0,10,'2024-02-24 17:04:22','2024-02-24 17:04:22'),(5,'Louis',0,10,'2024-02-24 17:04:22','2024-02-24 17:04:22'),(6,'Diedre',0,10,'2024-02-24 17:04:23','2024-02-24 17:04:23'),(7,'Dalton',0,10,'2024-02-24 17:04:23','2024-02-24 17:04:23'),(8,'Shakita',0,10,'2024-02-24 17:04:23','2024-02-24 17:04:23'),(9,'Lane',0,10,'2024-02-24 17:04:23','2024-02-24 17:04:23'),(10,'Norene',0,10,'2024-02-24 17:04:23','2024-02-24 17:04:23'),(11,'Milton',0,10,'2024-02-24 17:04:23','2024-02-24 17:04:23'),(12,'Krystyna',0,10,'2024-02-24 17:04:23','2024-02-24 17:04:23'),(13,'Janay',0,10,'2024-02-24 17:04:24','2024-02-24 17:04:24'),(14,'Ilona',0,10,'2024-02-24 17:04:24','2024-02-24 17:04:24'),(15,'Erasmo',0,10,'2024-02-24 17:04:24','2024-02-24 17:04:24'),(16,'Mitch',0,10,'2024-02-24 17:04:24','2024-02-24 17:04:24'),(17,'Earnestine',0,10,'2024-02-24 17:04:24','2024-02-24 17:04:24'),(18,'Hoa',0,10,'2024-02-24 17:04:24','2024-02-24 17:04:24'),(19,'Pat',0,10,'2024-02-24 17:04:24','2024-02-24 17:04:24'),(20,'Andrew',0,10,'2024-02-24 17:04:24','2024-02-24 17:04:24'),(21,'Samantha',0,10,'2024-02-24 17:04:25','2024-02-24 17:04:25'),(22,'Shoshana',0,10,'2024-02-24 17:04:25','2024-02-24 17:04:25'),(23,'Lissette',0,10,'2024-02-24 17:04:25','2024-02-24 17:04:25'),(24,'Lucille',0,10,'2024-02-24 17:04:25','2024-02-24 17:04:25'),(25,'Brittni',0,10,'2024-02-24 17:04:25','2024-02-24 17:04:25'),(26,'Brittney',0,10,'2024-02-24 17:04:25','2024-02-24 17:04:25'),(27,'Glynda',0,10,'2024-02-24 17:04:25','2024-02-24 17:04:25'),(28,'Zena',0,10,'2024-02-24 17:04:26','2024-02-24 17:04:26'),(29,'Marcelino',0,10,'2024-02-24 17:04:26','2024-02-24 17:04:26'),(30,'Shirely',0,10,'2024-02-24 17:04:26','2024-02-24 17:04:26');
/*!40000 ALTER TABLE `bots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `botstats`
--

DROP TABLE IF EXISTS `botstats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `botstats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `moneyLotoWon` float DEFAULT '0',
  `moneyDominoWon` float DEFAULT '0',
  `moneyNardsWon` float DEFAULT '0',
  `moneyLotoLost` float DEFAULT '0',
  `moneyDominoLost` float DEFAULT '0',
  `moneyNardsLost` float DEFAULT '0',
  `lotoRoomWins` json DEFAULT NULL,
  `dominoRoomWins` json DEFAULT NULL,
  `nardsRoomWins` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `botstats`
--

LOCK TABLES `botstats` WRITE;
/*!40000 ALTER TABLE `botstats` DISABLE KEYS */;
INSERT INTO `botstats` VALUES (1,0,0,0,0,0,0,'\"{\\\"room1\\\":0,\\\"room2\\\":0,\\\"room3\\\":0,\\\"room4\\\":0,\\\"room5\\\":0}\"','\"{\\\"room1\\\":0,\\\"room2\\\":0,\\\"room3\\\":0,\\\"room4\\\":0,\\\"room5\\\":0}\"','\"{\\\"room1\\\":0,\\\"room2\\\":0,\\\"room3\\\":0,\\\"room4\\\":0,\\\"room5\\\":0}\"','2024-02-24 17:04:19','2024-02-24 17:04:19');
/*!40000 ALTER TABLE `botstats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cards`
--

DROP TABLE IF EXISTS `cards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cards` (
  `id` varchar(255) NOT NULL,
  `gameLevel` int NOT NULL,
  `card` json NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `cards_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cards`
--

LOCK TABLES `cards` WRITE;
/*!40000 ALTER TABLE `cards` DISABLE KEYS */;
/*!40000 ALTER TABLE `cards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `currencyrates`
--

DROP TABLE IF EXISTS `currencyrates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `currencyrates` (
  `id` int NOT NULL,
  `rate` float DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `currencyrates`
--

LOCK TABLES `currencyrates` WRITE;
/*!40000 ALTER TABLE `currencyrates` DISABLE KEYS */;
INSERT INTO `currencyrates` VALUES (1,1.705,'2024-02-24 17:04:19','2024-04-15 06:53:19');
/*!40000 ALTER TABLE `currencyrates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deposits`
--

DROP TABLE IF EXISTS `deposits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deposits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `depositAmount` float DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `deposits_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deposits`
--

LOCK TABLES `deposits` WRITE;
/*!40000 ALTER TABLE `deposits` DISABLE KEYS */;
INSERT INTO `deposits` VALUES (1,25,'2024-02-25 11:44:56','2024-02-25 11:44:56',5),(2,5,'2024-04-11 15:21:33','2024-04-11 15:21:33',1);
/*!40000 ALTER TABLE `deposits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dominoGamePlayers`
--

DROP TABLE IF EXISTS `dominoGamePlayers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dominoGamePlayers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tiles` json DEFAULT NULL,
  `points` int DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `dominoGameId` int DEFAULT NULL,
  `userId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `dominoGameId` (`dominoGameId`),
  KEY `userId` (`userId`),
  CONSTRAINT `dominoGamePlayers_ibfk_1` FOREIGN KEY (`dominoGameId`) REFERENCES `dominoGames` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `dominoGamePlayers_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dominoGamePlayers`
--

LOCK TABLES `dominoGamePlayers` WRITE;
/*!40000 ALTER TABLE `dominoGamePlayers` DISABLE KEYS */;
/*!40000 ALTER TABLE `dominoGamePlayers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dominoGames`
--

DROP TABLE IF EXISTS `dominoGames`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dominoGames` (
  `id` int NOT NULL AUTO_INCREMENT,
  `startedAt` datetime DEFAULT NULL,
  `startedWaitingAt` datetime DEFAULT NULL,
  `isStarted` tinyint(1) DEFAULT '0',
  `isFinished` tinyint(1) DEFAULT '0',
  `roomId` int NOT NULL,
  `tableId` int NOT NULL,
  `playerMode` int NOT NULL,
  `gameMode` varchar(255) NOT NULL,
  `continued` tinyint(1) DEFAULT '0',
  `turn` varchar(255) DEFAULT '',
  `turnTime` datetime DEFAULT NULL,
  `turnQueue` json DEFAULT NULL,
  `scene` json DEFAULT NULL,
  `market` json DEFAULT NULL,
  `isAvailable` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15895 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dominoGames`
--

LOCK TABLES `dominoGames` WRITE;
/*!40000 ALTER TABLE `dominoGames` DISABLE KEYS */;
INSERT INTO `dominoGames` VALUES (15755,NULL,NULL,0,0,1,1,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:44','2024-04-12 12:05:44'),(15756,NULL,NULL,0,0,1,2,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:44','2024-04-12 12:05:44'),(15757,NULL,NULL,0,0,1,3,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:44','2024-04-12 12:05:44'),(15758,NULL,NULL,0,0,1,4,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:44','2024-04-12 12:05:44'),(15759,NULL,NULL,0,0,1,5,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:45','2024-04-12 12:05:45'),(15760,NULL,NULL,0,0,1,6,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:45','2024-04-12 12:05:45'),(15761,NULL,NULL,0,0,1,7,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:45','2024-04-12 12:05:45'),(15762,NULL,NULL,0,0,2,1,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:45','2024-04-12 12:05:45'),(15763,NULL,NULL,0,0,2,2,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:45','2024-04-12 12:05:45'),(15764,NULL,NULL,0,0,2,3,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:45','2024-04-12 12:05:45'),(15765,NULL,NULL,0,0,2,4,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:45','2024-04-12 12:05:45'),(15766,NULL,NULL,0,0,2,5,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:45','2024-04-12 12:05:45'),(15767,NULL,NULL,0,0,2,6,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:45','2024-04-12 12:05:45'),(15768,NULL,NULL,0,0,2,7,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:45','2024-04-12 12:05:45'),(15769,NULL,NULL,0,0,3,1,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:45','2024-04-12 12:05:45'),(15770,NULL,NULL,0,0,3,2,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:45','2024-04-12 12:05:45'),(15771,NULL,NULL,0,0,3,3,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:45','2024-04-12 12:05:45'),(15772,NULL,NULL,0,0,3,4,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:45','2024-04-12 12:05:45'),(15773,NULL,NULL,0,0,3,5,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:45','2024-04-12 12:05:45'),(15774,NULL,NULL,0,0,3,6,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:45','2024-04-12 12:05:45'),(15775,NULL,NULL,0,0,3,7,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:45','2024-04-12 12:05:45'),(15776,NULL,NULL,0,0,4,1,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15777,NULL,NULL,0,0,4,2,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15778,NULL,NULL,0,0,4,3,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15779,NULL,NULL,0,0,4,4,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15780,NULL,NULL,0,0,4,5,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15781,NULL,NULL,0,0,4,6,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15782,NULL,NULL,0,0,4,7,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15783,NULL,NULL,0,0,5,1,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15784,NULL,NULL,0,0,5,2,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15785,NULL,NULL,0,0,5,3,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15786,NULL,NULL,0,0,5,4,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15787,NULL,NULL,0,0,5,5,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15788,NULL,NULL,0,0,5,6,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15789,NULL,NULL,0,0,5,7,2,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15790,NULL,NULL,0,0,1,1,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15791,NULL,NULL,0,0,1,2,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15792,NULL,NULL,0,0,1,3,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15793,NULL,NULL,0,0,1,4,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15794,NULL,NULL,0,0,1,5,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15795,NULL,NULL,0,0,1,6,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15796,NULL,NULL,0,0,1,7,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15797,NULL,NULL,0,0,2,1,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15798,NULL,NULL,0,0,2,2,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15799,NULL,NULL,0,0,2,3,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15800,NULL,NULL,0,0,2,4,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15801,NULL,NULL,0,0,2,5,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15802,NULL,NULL,0,0,2,6,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15803,NULL,NULL,0,0,2,7,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15804,NULL,NULL,0,0,3,1,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15805,NULL,NULL,0,0,3,2,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15806,NULL,NULL,0,0,3,3,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15807,NULL,NULL,0,0,3,4,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15808,NULL,NULL,0,0,3,5,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15809,NULL,NULL,0,0,3,6,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15810,NULL,NULL,0,0,3,7,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15811,NULL,NULL,0,0,4,1,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15812,NULL,NULL,0,0,4,2,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15813,NULL,NULL,0,0,4,3,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15814,NULL,NULL,0,0,4,4,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15815,NULL,NULL,0,0,4,5,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15816,NULL,NULL,0,0,4,6,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15817,NULL,NULL,0,0,4,7,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15818,NULL,NULL,0,0,5,1,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15819,NULL,NULL,0,0,5,2,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15820,NULL,NULL,0,0,5,3,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15821,NULL,NULL,0,0,5,4,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15822,NULL,NULL,0,0,5,5,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15823,NULL,NULL,0,0,5,6,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15824,NULL,NULL,0,0,5,7,4,'CLASSIC',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15825,NULL,NULL,0,0,1,1,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15826,NULL,NULL,0,0,1,2,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15827,NULL,NULL,0,0,1,3,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15828,NULL,NULL,0,0,1,4,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:46','2024-04-12 12:05:46'),(15829,NULL,NULL,0,0,1,5,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15830,NULL,NULL,0,0,1,6,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15831,NULL,NULL,0,0,1,7,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15832,NULL,NULL,0,0,2,1,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15833,NULL,NULL,0,0,2,2,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15834,NULL,NULL,0,0,2,3,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15835,NULL,NULL,0,0,2,4,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15836,NULL,NULL,0,0,2,5,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15837,NULL,NULL,0,0,2,6,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15838,NULL,NULL,0,0,2,7,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15839,NULL,NULL,0,0,3,1,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15840,NULL,NULL,0,0,3,2,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15841,NULL,NULL,0,0,3,3,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15842,NULL,NULL,0,0,3,4,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15843,NULL,NULL,0,0,3,5,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15844,NULL,NULL,0,0,3,6,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15845,NULL,NULL,0,0,3,7,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15846,NULL,NULL,0,0,4,1,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15847,NULL,NULL,0,0,4,2,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15848,NULL,NULL,0,0,4,3,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15849,NULL,NULL,0,0,4,4,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15850,NULL,NULL,0,0,4,5,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15851,NULL,NULL,0,0,4,6,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15852,NULL,NULL,0,0,4,7,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15853,NULL,NULL,0,0,5,1,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15854,NULL,NULL,0,0,5,2,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15855,NULL,NULL,0,0,5,3,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15856,NULL,NULL,0,0,5,4,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15857,NULL,NULL,0,0,5,5,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15858,NULL,NULL,0,0,5,6,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15859,NULL,NULL,0,0,5,7,2,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15860,NULL,NULL,0,0,1,1,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15861,NULL,NULL,0,0,1,2,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15862,NULL,NULL,0,0,1,3,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15863,NULL,NULL,0,0,1,4,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15864,NULL,NULL,0,0,1,5,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15865,NULL,NULL,0,0,1,6,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15866,NULL,NULL,0,0,1,7,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15867,NULL,NULL,0,0,2,1,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15868,NULL,NULL,0,0,2,2,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15869,NULL,NULL,0,0,2,3,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15870,NULL,NULL,0,0,2,4,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15871,NULL,NULL,0,0,2,5,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15872,NULL,NULL,0,0,2,6,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15873,NULL,NULL,0,0,2,7,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15874,NULL,NULL,0,0,3,1,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15875,NULL,NULL,0,0,3,2,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15876,NULL,NULL,0,0,3,3,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15877,NULL,NULL,0,0,3,4,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15878,NULL,NULL,0,0,3,5,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15879,NULL,NULL,0,0,3,6,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15880,NULL,NULL,0,0,3,7,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15881,NULL,NULL,0,0,4,1,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15882,NULL,NULL,0,0,4,2,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15883,NULL,NULL,0,0,4,3,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15884,NULL,NULL,0,0,4,4,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15885,NULL,NULL,0,0,4,5,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15886,NULL,NULL,0,0,4,6,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15887,NULL,NULL,0,0,4,7,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15888,NULL,NULL,0,0,5,1,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15889,NULL,NULL,0,0,5,2,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:47','2024-04-12 12:05:47'),(15890,NULL,NULL,0,0,5,3,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:48','2024-04-12 12:05:48'),(15891,NULL,NULL,0,0,5,4,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:48','2024-04-12 12:05:48'),(15892,NULL,NULL,0,0,5,5,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:48','2024-04-12 12:05:48'),(15893,NULL,NULL,0,0,5,6,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:48','2024-04-12 12:05:48'),(15894,NULL,NULL,0,0,5,7,4,'TELEPHONE',0,'',NULL,'\"[]\"','\"[]\"','\"[]\"',1,'2024-04-12 12:05:48','2024-04-12 12:05:48');
/*!40000 ALTER TABLE `dominoGames` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dominoUserGames`
--

DROP TABLE IF EXISTS `dominoUserGames`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dominoUserGames` (
  `id` int NOT NULL AUTO_INCREMENT,
  `isWinner` tinyint(1) DEFAULT '0',
  `winSum` float DEFAULT '0',
  `scene` json DEFAULT NULL,
  `roomId` int NOT NULL,
  `tableId` int NOT NULL,
  `playerMode` int NOT NULL,
  `gameMode` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `dominoUserGames_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dominoUserGames`
--

LOCK TABLES `dominoUserGames` WRITE;
/*!40000 ALTER TABLE `dominoUserGames` DISABLE KEYS */;
/*!40000 ALTER TABLE `dominoUserGames` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lotoGames`
--

DROP TABLE IF EXISTS `lotoGames`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lotoGames` (
  `id` int NOT NULL AUTO_INCREMENT,
  `startedAt` datetime DEFAULT NULL,
  `finishesAt` datetime DEFAULT NULL,
  `isStarted` tinyint(1) DEFAULT '0',
  `isWaiting` tinyint(1) DEFAULT '0',
  `gameLevel` int NOT NULL,
  `bots` int DEFAULT '0',
  `botsTickets` json DEFAULT NULL,
  `prevBank` float DEFAULT '0',
  `jackpot` float DEFAULT '0',
  `isAvailable` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `gameLevel` (`gameLevel`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lotoGames`
--

LOCK TABLES `lotoGames` WRITE;
/*!40000 ALTER TABLE `lotoGames` DISABLE KEYS */;
INSERT INTO `lotoGames` VALUES (1,NULL,NULL,0,0,1,0,'\"[]\"',0,0,1,'2024-02-24 17:04:19','2024-04-12 12:05:43'),(2,NULL,NULL,0,0,2,0,'\"[]\"',0,0,1,'2024-02-24 17:04:19','2024-04-12 12:05:43'),(3,NULL,NULL,0,0,3,0,'\"[]\"',0,0,1,'2024-02-24 17:04:19','2024-04-12 12:05:43'),(4,NULL,NULL,0,0,4,0,'\"[]\"',0,0,1,'2024-02-24 17:04:19','2024-04-12 12:05:43'),(5,NULL,NULL,0,0,5,0,'\"[]\"',0,0,1,'2024-02-24 17:04:19','2024-04-12 12:05:43');
/*!40000 ALTER TABLE `lotoGames` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lotosettings`
--

DROP TABLE IF EXISTS `lotosettings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lotosettings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `gameLevel` int NOT NULL,
  `allowBots` tinyint(1) DEFAULT '0',
  `maxBots` int DEFAULT '0',
  `maxTickets` int DEFAULT '0',
  `winChance` float DEFAULT '0',
  `maxCasksJackpot` int DEFAULT '60',
  `minJackpotSum` float DEFAULT '0',
  `canBotWinJackpot` tinyint(1) DEFAULT '1',
  `jackpotWinChance` float DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `gameLevel` (`gameLevel`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lotosettings`
--

LOCK TABLES `lotosettings` WRITE;
/*!40000 ALTER TABLE `lotosettings` DISABLE KEYS */;
INSERT INTO `lotosettings` VALUES (1,1,1,4,6,20,60,200,1,20,'2024-02-24 17:04:26','2024-02-24 17:04:26'),(2,2,1,4,6,20,60,200,1,20,'2024-02-24 17:04:26','2024-02-24 17:04:26'),(3,3,1,4,6,20,60,200,1,20,'2024-02-24 17:04:26','2024-02-24 17:04:26'),(4,4,1,4,6,20,60,200,1,20,'2024-02-24 17:04:26','2024-02-24 17:04:26'),(5,5,1,4,6,20,60,200,1,20,'2024-02-24 17:04:26','2024-02-24 17:04:26');
/*!40000 ALTER TABLE `lotosettings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pages`
--

DROP TABLE IF EXISTS `pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `page` varchar(255) NOT NULL,
  `isAvailable` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pages`
--

LOCK TABLES `pages` WRITE;
/*!40000 ALTER TABLE `pages` DISABLE KEYS */;
INSERT INTO `pages` VALUES (1,'loto',1,'2024-02-24 17:04:19','2024-02-24 17:04:19'),(2,'dominoClassic',1,'2024-02-24 17:04:19','2024-02-24 17:04:19'),(3,'dominoTelephone',1,'2024-02-24 17:04:19','2024-02-24 17:04:19');
/*!40000 ALTER TABLE `pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payouts`
--

DROP TABLE IF EXISTS `payouts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payouts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `withdrawAmount` float DEFAULT NULL,
  `cardNumber` varchar(255) DEFAULT NULL,
  `cardHolder` varchar(255) DEFAULT NULL,
  `validity` varchar(255) DEFAULT NULL,
  `checked` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `payouts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payouts`
--

LOCK TABLES `payouts` WRITE;
/*!40000 ALTER TABLE `payouts` DISABLE KEYS */;
/*!40000 ALTER TABLE `payouts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `playedgames`
--

DROP TABLE IF EXISTS `playedgames`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `playedgames` (
  `id` int NOT NULL AUTO_INCREMENT,
  `roomId` int NOT NULL,
  `lotoBotTickets` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `playedgames`
--

LOCK TABLES `playedgames` WRITE;
/*!40000 ALTER TABLE `playedgames` DISABLE KEYS */;
/*!40000 ALTER TABLE `playedgames` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stats`
--

DROP TABLE IF EXISTS `stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `moneyLotoWon` float DEFAULT '0',
  `moneyLotoLost` float DEFAULT '0',
  `lotoTokens` float DEFAULT '0',
  `lotoTokensBalance` float DEFAULT '0',
  `gameLotoPlayed` int DEFAULT '0',
  `moneyDominoWon` float DEFAULT '0',
  `moneyDominoLost` float DEFAULT '0',
  `gameDominoPlayed` int DEFAULT '0',
  `dominoTokens` float DEFAULT '0',
  `moneyNardsWon` float DEFAULT '0',
  `NardsWon` float DEFAULT '0',
  `NardsLost` float DEFAULT '0',
  `moneyNardsLost` float DEFAULT '0',
  `nardsTokens` float DEFAULT '0',
  `gameNardsPlayed` int DEFAULT '0',
  `deposited` float DEFAULT '0',
  `withdrawn` float DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `stats_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stats`
--

LOCK TABLES `stats` WRITE;
/*!40000 ALTER TABLE `stats` DISABLE KEYS */;
INSERT INTO `stats` VALUES (1,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,'2024-02-24 17:04:57','2024-04-11 15:21:34',1),(2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2024-02-24 17:06:30','2024-02-24 17:06:30',2),(3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2024-02-24 17:07:24','2024-02-24 17:07:24',3),(4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2024-02-24 17:10:02','2024-02-24 17:10:02',4),(5,0,0,0,0,0,0,0,0,0,0,0,0,0,25,0,'2024-02-24 19:33:51','2024-02-25 11:44:56',5),(6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2024-02-24 20:40:59','2024-02-24 20:40:59',6),(7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2024-02-25 09:26:01','2024-02-25 09:26:01',7),(8,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2024-04-07 18:27:09','2024-04-07 18:27:09',8),(9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2024-04-07 18:27:37','2024-04-07 18:27:37',9),(10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2024-04-07 18:47:10','2024-04-07 18:47:10',10),(11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'2024-04-15 06:56:09','2024-04-15 06:56:09',11);
/*!40000 ALTER TABLE `stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tokens`
--

DROP TABLE IF EXISTS `tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
-- ALTER TABLE e24loto.tokens MODIFY COLUMN refreshToken VARCHAR(500);
CREATE TABLE `tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int DEFAULT NULL,
  `refreshToken` varchar(1024) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `tokens_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tokens`
--

LOCK TABLES `tokens` WRITE;
/*!40000 ALTER TABLE `tokens` DISABLE KEYS */;
INSERT INTO `tokens` VALUES (1,NULL,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImthbWFsQHlhbmRleC5ydSIsImlkIjo1LCJuYW1lIjoiS2FtYWwiLCJ1c2VybmFtZSI6IkthbWFsIiwiYmFsYW5jZSI6MjUsImlzQWRtaW4iOnRydWUsImlhdCI6MTcxMzE4MzI2MSwiZXhwIjoxNzE1Nzc1MjYxfQ.kgfEaMnBta7jWl6zpb0RAY8dZT97ZZiKi8bRBAs07UM','2024-02-24 17:04:57','2024-04-15 12:14:21');
/*!40000 ALTER TABLE `tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usergames`
--

DROP TABLE IF EXISTS `usergames`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usergames` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tickets` json DEFAULT NULL,
  `casks` json DEFAULT NULL,
  `isWinner` tinyint(1) DEFAULT '0',
  `winIndex` int DEFAULT '0',
  `winSum` float DEFAULT '0',
  `bet` float DEFAULT '0',
  `bank` float DEFAULT '0',
  `isJackpotWon` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `playedgameId` int DEFAULT NULL,
  `userId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `playedgameId` (`playedgameId`),
  KEY `userId` (`userId`),
  CONSTRAINT `usergames_ibfk_1` FOREIGN KEY (`playedgameId`) REFERENCES `playedgames` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `usergames_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usergames`
--

LOCK TABLES `usergames` WRITE;
/*!40000 ALTER TABLE `usergames` DISABLE KEYS */;
/*!40000 ALTER TABLE `usergames` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `resetToken` varchar(255) DEFAULT '',
  `resetTokenExp` datetime DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `isAdmin` tinyint(1) DEFAULT '0',
  `seeDominoClassic` tinyint(1) DEFAULT '0',
  `seeDominoTelephone` tinyint(1) DEFAULT '0',
  `balance` float DEFAULT '0',
  `wins` int DEFAULT '0',
  `losses` int DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `password` (`password`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Natiq@gmail.com','$2b$04$KVHGWrL3V/mAIRIMOrYSu.NlBu.yWRi3h/4.7Zp9VGcpF8KaLqaWu','Natiq','Natiq','',NULL,NULL,0,0,0,5,0,0,'2024-02-24 17:04:57','2024-04-11 15:21:58'),(2,'Natiq2@gmail.com','$2b$04$KLaPpkZTE49./idjqvZRR.efUAo8Nvxe0eYBeIfBV0UcGIzJ1Kmz.','Natiq2','Natiq2','',NULL,NULL,0,0,0,0,0,0,'2024-02-24 17:06:30','2024-02-24 17:06:30'),(3,'Natiq3@gmail.com','$2b$04$K4gEN12C5B37v7m152tdxufhNBKezBSjhLW5bEhZCXTS5QU93zZPK','Natiq3','Natiq3','',NULL,NULL,0,0,0,0,0,0,'2024-02-24 17:07:24','2024-02-24 17:07:24'),(4,'n@s.com','$2b$04$cY6gcja0NiK5difK.by6Z.tLoXcNw3xNSoBQmgs3493Kv8xDF1M0C','Natiq4','Natiq4','',NULL,NULL,0,0,0,0,0,0,'2024-02-24 17:10:02','2024-02-24 17:10:02'),(5,'kamal@yandex.ru','$2b$04$6K9duizC4Hw6HpsY0uG5B.NM.HxZJql8a15K6Uzk..ZZRQxsGLZue','Kamal','Kamal','',NULL,NULL,1,1,1,25,0,0,'2024-02-24 19:33:51','2024-04-15 12:15:55'),(6,'natiq@yandex.ru','$2b$04$wMnmpTZGUWknIyvctFiKs.C2.zgefhif1DQkjxjdRuY8oHztL7qaG','natiq1','Natiq1','',NULL,NULL,0,0,0,0,0,0,'2024-02-24 20:40:59','2024-02-24 20:40:59'),(7,'andrejsmolak068@gmail.com','$2b$04$IUWirrtLOTn5n/sN8ncb2O7zLGyE8/4fnZxzLpmXkxNtiWuHy2UI6','Andrey','nnnn','',NULL,NULL,0,0,0,0,0,0,'2024-02-25 09:26:01','2024-02-25 09:26:01'),(8,'yayaya@g.com','$2b$04$OYtb/Zf.P27J8vYXABfHN.bfq4401z/iH8NmmE.RUt7Hyu6XfZhTq','yayaya','yayaya','',NULL,NULL,0,0,0,0,0,0,'2024-04-07 18:27:09','2024-04-07 18:27:09'),(9,'wooowtika@gmail.com','$2b$04$.Mc4K21Lj/Sv8feMNKL.POKP6r5GLOJTtjhO91P8uXdZA5tJdsnjO','Wowtika','Wowtika','',NULL,NULL,0,0,0,0,0,0,'2024-04-07 18:27:37','2024-04-07 18:27:37'),(10,'yayaya2@yayaya2.com','$2b$04$gqv.HiWmwA6m2PuwqF3hZOvCRDhW9Ka9ttlqZRiT8BCxhak9evWA6','yayaya2','yayaya2','',NULL,NULL,0,0,0,0,0,0,'2024-04-07 18:47:10','2024-04-07 18:47:10'),(11,'Хуепочта@gmail.com','$2b$04$UHDG44qBpI83EnWeSfB04.qL2g2ow2miRg/8Ly9DNL8ONIXvu3JTO','Хуимя','Хуимя','',NULL,NULL,0,0,0,0,0,0,'2024-04-15 06:56:09','2024-04-15 06:56:09');
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

-- Dump completed on 2024-04-15 13:49:41