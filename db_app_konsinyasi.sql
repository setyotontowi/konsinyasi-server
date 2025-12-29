-- MySQL dump 10.13  Distrib 8.0.43, for Linux (x86_64)
--
-- Host: localhost    Database: db_app_konsinyasi
-- ------------------------------------------------------
-- Server version	8.0.43-0ubuntu0.22.04.2

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
-- Table structure for table `bg_barang_unit`
--

DROP TABLE IF EXISTS `bg_barang_unit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bg_barang_unit` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_barang` int NOT NULL,
  `id_unit` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `bg_barang_unit_md_barang_FK` (`id_barang`),
  KEY `bg_barang_unit_md_unit_FK` (`id_unit`),
  CONSTRAINT `bg_barang_unit_md_barang_FK` FOREIGN KEY (`id_barang`) REFERENCES `md_barang` (`barang_id`),
  CONSTRAINT `bg_barang_unit_md_unit_FK` FOREIGN KEY (`id_unit`) REFERENCES `md_unit` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Bridge table untuk md_barang dan md_unit UNUSED';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bg_barang_unit`
--

LOCK TABLES `bg_barang_unit` WRITE;
/*!40000 ALTER TABLE `bg_barang_unit` DISABLE KEYS */;
/*!40000 ALTER TABLE `bg_barang_unit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ch_serial_number`
--

DROP TABLE IF EXISTS `ch_serial_number`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ch_serial_number` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_barang` int NOT NULL,
  `ed` date NOT NULL,
  `nobatch` varchar(100) NOT NULL,
  `serial_number` varchar(100) NOT NULL,
  `is_used` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `id_stok_opname_detail` int NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ch_serial_number_md_barang_FK` (`id_barang`),
  CONSTRAINT `ch_serial_number_md_barang_FK` FOREIGN KEY (`id_barang`) REFERENCES `md_barang` (`barang_id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ch_serial_number`
--

LOCK TABLES `ch_serial_number` WRITE;
/*!40000 ALTER TABLE `ch_serial_number` DISABLE KEYS */;
/*!40000 ALTER TABLE `ch_serial_number` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ch_stok_live`
--

DROP TABLE IF EXISTS `ch_stok_live`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ch_stok_live` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_barang` int NOT NULL,
  `ed` date DEFAULT NULL,
  `nobatch` varchar(100) DEFAULT NULL,
  `sisa` decimal(18,2) NOT NULL DEFAULT '0.00',
  `is_sync` tinyint(1) NOT NULL DEFAULT '0',
  `is_valid` tinyint(1) NOT NULL DEFAULT '1',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_barang_batch_ed` (`id_barang`,`nobatch`,`ed`),
  KEY `idx_barang` (`id_barang`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ch_stok_live`
--

LOCK TABLES `ch_stok_live` WRITE;
/*!40000 ALTER TABLE `ch_stok_live` DISABLE KEYS */;
/*!40000 ALTER TABLE `ch_stok_live` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dt_permintaan_distribusi_detail`
--

DROP TABLE IF EXISTS `dt_permintaan_distribusi_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dt_permintaan_distribusi_detail` (
  `pdd_id` int NOT NULL AUTO_INCREMENT,
  `pd_id` int NOT NULL,
  `id_master_barang` int NOT NULL,
  `id_master_satuan` int NOT NULL,
  `qty` double NOT NULL,
  `waktu_input` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'dipake untuk croscek data apakah ada edit permintaan atau tidak',
  `qty_real` double DEFAULT NULL COMMENT 'Akan terisi setelah dilakukan tindakan ke pasien, jadi tahu selisih antara kolom qty dan qty_real(digunakan)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`pdd_id`),
  KEY `pd_id` (`pd_id`),
  KEY `id_master_barang` (`id_master_barang`),
  KEY `id_master_satuan` (`id_master_satuan`),
  CONSTRAINT `dt_permintaan_distribusi_detail_ibfk_1` FOREIGN KEY (`pd_id`) REFERENCES `hd_permintaan_distribusi` (`pd_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `dt_permintaan_distribusi_detail_ibfk_2` FOREIGN KEY (`id_master_barang`) REFERENCES `md_barang` (`barang_id`) ON UPDATE CASCADE,
  CONSTRAINT `dt_permintaan_distribusi_detail_ibfk_3` FOREIGN KEY (`id_master_satuan`) REFERENCES `md_satuan` (`mst_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb3 COMMENT='Detail dari hd_permintaan_distribusi';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dt_permintaan_distribusi_detail`
--

LOCK TABLES `dt_permintaan_distribusi_detail` WRITE;
/*!40000 ALTER TABLE `dt_permintaan_distribusi_detail` DISABLE KEYS */;
/*!40000 ALTER TABLE `dt_permintaan_distribusi_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dt_purchase_order_detail`
--

DROP TABLE IF EXISTS `dt_purchase_order_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dt_purchase_order_detail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_po` varchar(14) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `id_barang` int NOT NULL,
  `baik` double DEFAULT '0',
  `permintaan` double NOT NULL,
  `harga_satuan` double NOT NULL,
  `id_permintaan_pemesanan_detail` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `id_permintaan_distribusi` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_pemesanan` (`id_po`),
  KEY `id_barang` (`id_barang`),
  KEY `id_permintaan_pemesanan` (`id_permintaan_pemesanan_detail`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=latin1 COMMENT='Detail dari hd_purchase_order';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dt_purchase_order_detail`
--

LOCK TABLES `dt_purchase_order_detail` WRITE;
/*!40000 ALTER TABLE `dt_purchase_order_detail` DISABLE KEYS */;
/*!40000 ALTER TABLE `dt_purchase_order_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dt_stok_opname_detail`
--

DROP TABLE IF EXISTS `dt_stok_opname_detail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dt_stok_opname_detail` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_stok_opname` int DEFAULT NULL,
  `id_master_barang` int NOT NULL,
  `id_master_unit` int NOT NULL,
  `nobatch` varchar(15) DEFAULT NULL,
  `awal` double NOT NULL COMMENT 'Sepertinya tidak butuh',
  `masuk` double NOT NULL COMMENT 'Sepertinya tidak butuh',
  `keluar` double NOT NULL COMMENT 'Sepertinya tidak butuh',
  `sisa` double NOT NULL,
  `ed` date DEFAULT NULL,
  `hpp` double NOT NULL,
  `bulan` date NOT NULL COMMENT 'yang dipakai sebagai acuan hanya Y-m saja',
  `tanggal_update` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `kondisi_barang` enum('Baik','Rusak') DEFAULT NULL,
  `keterangan` text,
  `id_users` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `opname_barang_unit_ed_bulan` (`id_stok_opname`,`id_master_barang`,`id_master_unit`,`ed`,`tanggal_update`) USING BTREE,
  KEY `id_barang_unit` (`id_master_barang`),
  KEY `id_users` (`id_users`),
  KEY `id_unit` (`id_master_unit`),
  KEY `ed` (`ed`),
  KEY `id_stok_opname` (`id_stok_opname`),
  CONSTRAINT `dt_stok_opname_detail_ibfk_1` FOREIGN KEY (`id_master_barang`) REFERENCES `md_barang` (`barang_id`) ON UPDATE CASCADE,
  CONSTRAINT `dt_stok_opname_detail_ibfk_2` FOREIGN KEY (`id_master_unit`) REFERENCES `md_unit` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `dt_stok_opname_detail_ibfk_3` FOREIGN KEY (`id_stok_opname`) REFERENCES `hd_stok_opname` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=latin1 COMMENT='Detail dari hd_stok_opname';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dt_stok_opname_detail`
--

LOCK TABLES `dt_stok_opname_detail` WRITE;
/*!40000 ALTER TABLE `dt_stok_opname_detail` DISABLE KEYS */;
/*!40000 ALTER TABLE `dt_stok_opname_detail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hd_permintaan_distribusi`
--

DROP TABLE IF EXISTS `hd_permintaan_distribusi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hd_permintaan_distribusi` (
  `pd_id` int NOT NULL AUTO_INCREMENT,
  `waktu` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_master_unit` int NOT NULL COMMENT 'Unit yang meminta barang sesuai session login',
  `id_users` int NOT NULL,
  `id_master_unit_tujuan` int NOT NULL COMMENT 'Unit / Vendor tujuan yang dimintai barang',
  `nomor_rm` varchar(10) NOT NULL,
  `nama_pasien` varchar(100) NOT NULL,
  `nama_ruang` varchar(100) NOT NULL,
  `diagnosa` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `sudah_dipakai` tinyint(1) DEFAULT NULL COMMENT 'Ketika qty real sudah terisi, maka sudah_dipakai jadi 1',
  PRIMARY KEY (`pd_id`),
  KEY `id_master_unit` (`id_master_unit`),
  KEY `id_users` (`id_users`),
  KEY `id_master_unit_tujuan` (`id_master_unit_tujuan`),
  CONSTRAINT `hd_permintaan_distribusi_ibfk_1` FOREIGN KEY (`id_master_unit`) REFERENCES `md_unit` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `hd_permintaan_distribusi_ibfk_2` FOREIGN KEY (`id_users`) REFERENCES `md_users` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `hd_permintaan_distribusi_ibfk_3` FOREIGN KEY (`id_master_unit_tujuan`) REFERENCES `md_unit` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb3 COMMENT='Header transaksi permintaan distribusi';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hd_permintaan_distribusi`
--

LOCK TABLES `hd_permintaan_distribusi` WRITE;
/*!40000 ALTER TABLE `hd_permintaan_distribusi` DISABLE KEYS */;
/*!40000 ALTER TABLE `hd_permintaan_distribusi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hd_purchase_order`
--

DROP TABLE IF EXISTS `hd_purchase_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hd_purchase_order` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tanggal` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tanggal_datang` timestamp NULL DEFAULT NULL,
  `tanggal_entri` timestamp NULL DEFAULT NULL COMMENT 'Tanggal user memasukkan pemesanan ke sistem',
  `id_permintaan_distribusi` int DEFAULT NULL,
  `ppn` double NOT NULL,
  `subtotal` double NOT NULL,
  `cetak` enum('Belum','Sudah') NOT NULL,
  `id_master_unit_supplier` int DEFAULT NULL,
  `id_users` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `print_path` varchar(100) DEFAULT NULL,
  `vendor_confirmation_at` timestamp NULL DEFAULT NULL,
  `simrs_sync` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `supplier` (`id_master_unit_supplier`),
  KEY `id_users` (`id_users`),
  CONSTRAINT `hd_purchase_order_ibfk_1` FOREIGN KEY (`id_master_unit_supplier`) REFERENCES `md_unit` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `hd_purchase_order_ibfk_2` FOREIGN KEY (`id_users`) REFERENCES `md_users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=latin1 COMMENT='Header transaksi purchase order';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hd_purchase_order`
--

LOCK TABLES `hd_purchase_order` WRITE;
/*!40000 ALTER TABLE `hd_purchase_order` DISABLE KEYS */;
/*!40000 ALTER TABLE `hd_purchase_order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hd_stok_opname`
--

DROP TABLE IF EXISTS `hd_stok_opname`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hd_stok_opname` (
  `id` int NOT NULL AUTO_INCREMENT,
  `waktu_input` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `bulan` date NOT NULL,
  `id_master_unit` int NOT NULL,
  `id_users` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_unit` (`id_master_unit`),
  KEY `id_users` (`id_users`),
  CONSTRAINT `hd_stok_opname_ibfk_1` FOREIGN KEY (`id_master_unit`) REFERENCES `md_unit` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `hd_stok_opname_ibfk_2` FOREIGN KEY (`id_users`) REFERENCES `md_users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb3 COMMENT='Header transaksi stok opname dari supplier atau vendor';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hd_stok_opname`
--

LOCK TABLES `hd_stok_opname` WRITE;
/*!40000 ALTER TABLE `hd_stok_opname` DISABLE KEYS */;
/*!40000 ALTER TABLE `hd_stok_opname` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `md_barang`
--

DROP TABLE IF EXISTS `md_barang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `md_barang` (
  `barang_id` int NOT NULL AUTO_INCREMENT,
  `serial_number` varchar(32) DEFAULT NULL,
  `barang_nama` varchar(255) NOT NULL,
  `id_satuan_kecil` int NOT NULL,
  `id_pabrik` int DEFAULT NULL,
  `barang_hpp` double DEFAULT NULL,
  `barang_is_aktif` enum('Ya','Tidak') NOT NULL,
  `barang_id_simrs` varchar(10) DEFAULT NULL COMMENT 'kode barang mapping harus sama dengan di SIMRS',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`barang_id`),
  UNIQUE KEY `barang_barcode` (`serial_number`),
  KEY `id_satuan_kecil` (`id_satuan_kecil`),
  KEY `md_barang_md_unit_FK` (`id_pabrik`),
  CONSTRAINT `md_barang_ibfk_2` FOREIGN KEY (`id_satuan_kecil`) REFERENCES `md_satuan` (`mst_id`) ON UPDATE CASCADE,
  CONSTRAINT `md_barang_md_unit_FK` FOREIGN KEY (`id_pabrik`) REFERENCES `md_unit` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb3 COMMENT='Masterdata Barang';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `md_barang`
--

LOCK TABLES `md_barang` WRITE;
/*!40000 ALTER TABLE `md_barang` DISABLE KEYS */;
/*!40000 ALTER TABLE `md_barang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `md_menu`
--

DROP TABLE IF EXISTS `md_menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `md_menu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `path` varchar(100) NOT NULL,
  `id_parent` int DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `order` int DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Masterdata menu';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `md_menu`
--

LOCK TABLES `md_menu` WRITE;
/*!40000 ALTER TABLE `md_menu` DISABLE KEYS */;
INSERT INTO `md_menu` VALUES (1,'Masterdata','/masterdata',NULL,'FolderIcon',1,1,'2025-11-02 00:07:19','2025-11-02 02:42:29',NULL),(2,'User','/masterdata/users',1,'UserIcon',2,1,'2025-11-02 00:07:19','2025-11-02 02:42:29',NULL),(3,'Unit','/masterdata/units',1,'RectangleGroupIcon',3,1,'2025-11-02 00:07:19','2025-11-02 02:43:55',NULL),(4,'Akses Menu','/masterdata/privileges',1,'UserGroupIcon',4,1,'2025-11-02 00:07:19','2025-11-02 02:43:55',NULL),(5,'Barang','/masterdata/barang',1,'Square3Stack3DIcon',5,1,'2025-11-04 14:44:33','2025-11-04 14:44:33',NULL),(6,'Satuan','/masterdata/satuan',1,'SwatchIcon',6,1,'2025-11-04 23:02:47','2025-11-04 23:02:47',NULL),(7,'Mutasi','/distribusi/',NULL,'FolderIcon',7,1,'2025-11-07 12:36:36','2025-12-10 16:05:23',NULL),(8,'Permintaan Mutasi','/distribusi/permintaan',7,'ArrowLeftEndOnRectangleIcon',8,1,'2025-11-07 12:36:36','2025-12-10 16:05:23',NULL),(9,'Mutasi','/distribusi/distribusi',7,'ArrowRightStartOnRectangleIcon',9,1,'2025-11-08 07:10:29','2025-12-10 16:05:23',NULL),(10,'Inventory','/inventory',NULL,'FolderIcon',10,1,'2025-11-09 08:44:31','2025-11-09 08:44:38',NULL),(11,'Stok Opname','/inventory/stok-opname',10,'CircleStackIcon',11,1,'2025-11-09 08:45:09','2025-11-09 08:45:09',NULL),(12,'Jurnal Transaksi','/inventory/journal',10,'BookOpenIcon',12,1,'2025-11-11 21:29:16','2025-11-11 21:29:16',NULL),(13,'Penggunaan Barang','/distribusi/penggunaan',7,'BeakerIcon',13,1,'2025-11-12 23:27:18','2025-11-12 23:27:18',NULL),(14,'Stok Barang','/inventory/stok-barang',10,'CubeIcon',14,1,'2025-11-17 01:39:41','2025-11-17 01:39:41',NULL),(15,'Penjualan','/penjualan',NULL,'FolderIcon',15,1,'2025-11-22 06:20:03','2025-11-22 06:20:03',NULL),(16,'Purchase Order','/penjualan/order',15,'PrinterIcon',16,1,'2025-11-22 06:20:03','2025-11-22 06:20:03',NULL),(17,'Daftar Penjualan','/penjualan/purchase',15,'BanknotesIcon',17,1,'2025-11-22 06:20:03','2025-11-22 06:29:20',NULL);
/*!40000 ALTER TABLE `md_menu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `md_satuan`
--

DROP TABLE IF EXISTS `md_satuan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `md_satuan` (
  `mst_id` int NOT NULL AUTO_INCREMENT,
  `mst_nama` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`mst_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb3 COMMENT='Masterdata nilai satuan dari barang';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `md_satuan`
--

LOCK TABLES `md_satuan` WRITE;
/*!40000 ALTER TABLE `md_satuan` DISABLE KEYS */;
/*!40000 ALTER TABLE `md_satuan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `md_unit`
--

DROP TABLE IF EXISTS `md_unit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `md_unit` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `keterangan` text NOT NULL,
  `is_pbf` enum('Tidak','Ya') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `unit_id_simrs` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb3 COMMENT='Masterdata unit rumah sakit atau unit supplier';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `md_unit`
--

LOCK TABLES `md_unit` WRITE;
/*!40000 ALTER TABLE `md_unit` DISABLE KEYS */;
/*!40000 ALTER TABLE `md_unit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `md_users`
--

DROP TABLE IF EXISTS `md_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `md_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(100) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `show_password` varchar(100) NOT NULL,
  `nama` varchar(200) NOT NULL,
  `nip` varchar(50) NOT NULL,
  `id_users_group` int NOT NULL,
  `id_master_unit` int DEFAULT NULL COMMENT 'Untuk merelasikan bahwa user ini dari PT apa. dan jika user adalah user RS maka dia ada di unit apa.',
  `status_active` enum('Ya','Tidak') NOT NULL,
  `keterangan` text NOT NULL COMMENT 'pegawai, FC',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `users_id_simrs` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_user_group` (`id_users_group`),
  KEY `id_master_unit` (`id_master_unit`),
  CONSTRAINT `md_users_ibfk_1` FOREIGN KEY (`id_users_group`) REFERENCES `md_users_group` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `md_users_ibfk_2` FOREIGN KEY (`id_master_unit`) REFERENCES `md_unit` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=latin1 COMMENT='Masterdata user';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `md_users`
--

LOCK TABLES `md_users` WRITE;
/*!40000 ALTER TABLE `md_users` DISABLE KEYS */;
INSERT INTO `md_users` VALUES (4,'admin','$2b$10$XVhG6w1awCzT37MDzsX/genAouWg7U56RJ8pRYohx4r6M4ir58CfG','','Administrator','',1,NULL,'Ya','','2025-10-31 12:43:09','2025-11-01 03:03:56',NULL);
/*!40000 ALTER TABLE `md_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `md_users_group`
--

DROP TABLE IF EXISTS `md_users_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `md_users_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `group_nama` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1 COMMENT='Mastedata user group';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `md_users_group`
--

LOCK TABLES `md_users_group` WRITE;
/*!40000 ALTER TABLE `md_users_group` DISABLE KEYS */;
INSERT INTO `md_users_group` VALUES (1,'Administrator','2025-10-30 13:31:41','2025-10-30 13:31:41'),(2,'Apoteker','2025-10-30 13:31:41','2025-10-30 13:31:41'),(3,'Vendor / Supplier','2025-10-30 13:31:41','2025-10-30 13:31:41'),(6,'PBF','2025-11-07 17:17:51','2025-11-07 17:17:51');
/*!40000 ALTER TABLE `md_users_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `st_users_group_privilege`
--

DROP TABLE IF EXISTS `st_users_group_privilege`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `st_users_group_privilege` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_group_id` int NOT NULL,
  `menu_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_group_id` (`user_group_id`),
  KEY `menu_id` (`menu_id`)
) ENGINE=InnoDB AUTO_INCREMENT=146 DEFAULT CHARSET=latin1 COMMENT='Setting untuk menentukan menu yang tampil untuk grup tertentu';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `st_users_group_privilege`
--

LOCK TABLES `st_users_group_privilege` WRITE;
/*!40000 ALTER TABLE `st_users_group_privilege` DISABLE KEYS */;
INSERT INTO `st_users_group_privilege` VALUES (9,2,2,'2025-11-03 23:13:18','2025-11-03 23:13:18'),(10,2,1,'2025-11-03 23:13:18','2025-11-03 23:13:18'),(94,1,1,'2025-11-22 06:20:27','2025-11-22 06:20:27'),(95,1,2,'2025-11-22 06:20:27','2025-11-22 06:20:27'),(96,1,3,'2025-11-22 06:20:27','2025-11-22 06:20:27'),(97,1,4,'2025-11-22 06:20:27','2025-11-22 06:20:27'),(98,1,5,'2025-11-22 06:20:27','2025-11-22 06:20:27'),(99,1,6,'2025-11-22 06:20:27','2025-11-22 06:20:27'),(100,1,7,'2025-11-22 06:20:27','2025-11-22 06:20:27'),(101,1,8,'2025-11-22 06:20:27','2025-11-22 06:20:27'),(102,1,9,'2025-11-22 06:20:27','2025-11-22 06:20:27'),(103,1,10,'2025-11-22 06:20:27','2025-11-22 06:20:27'),(104,1,11,'2025-11-22 06:20:27','2025-11-22 06:20:27'),(105,1,12,'2025-11-22 06:20:27','2025-11-22 06:20:27'),(106,1,13,'2025-11-22 06:20:27','2025-11-22 06:20:27'),(107,1,14,'2025-11-22 06:20:27','2025-11-22 06:20:27'),(108,1,15,'2025-11-22 06:20:27','2025-11-22 06:20:27'),(109,1,16,'2025-11-22 06:20:27','2025-11-22 06:20:27'),(110,1,17,'2025-11-22 06:20:27','2025-11-22 06:20:27'),(137,3,14,'2025-12-02 14:29:04','2025-12-02 14:29:04'),(138,3,10,'2025-12-02 14:29:04','2025-12-02 14:29:04'),(139,3,11,'2025-12-02 14:29:04','2025-12-02 14:29:04'),(140,3,2,'2025-12-02 14:29:04','2025-12-02 14:29:04'),(141,3,3,'2025-12-02 14:29:04','2025-12-02 14:29:04'),(142,3,15,'2025-12-02 14:29:04','2025-12-02 14:29:04'),(143,3,17,'2025-12-02 14:29:04','2025-12-02 14:29:04'),(144,3,9,'2025-12-02 14:29:04','2025-12-02 14:29:04'),(145,3,7,'2025-12-02 14:29:04','2025-12-02 14:29:04');
/*!40000 ALTER TABLE `st_users_group_privilege` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ts_distribusi`
--

DROP TABLE IF EXISTS `ts_distribusi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ts_distribusi` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_permintaan_distribusi` int NOT NULL,
  `waktu_kirim` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_master_unit` int NOT NULL,
  `id_users` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_permintaan_distribusi` (`id_permintaan_distribusi`),
  KEY `id_master_unit` (`id_master_unit`),
  KEY `id_users` (`id_users`),
  CONSTRAINT `ts_distribusi_ibfk_1` FOREIGN KEY (`id_permintaan_distribusi`) REFERENCES `hd_permintaan_distribusi` (`pd_id`) ON UPDATE CASCADE,
  CONSTRAINT `ts_distribusi_ibfk_2` FOREIGN KEY (`id_master_unit`) REFERENCES `md_unit` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `ts_distribusi_ibfk_3` FOREIGN KEY (`id_users`) REFERENCES `md_users` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb3 COMMENT='List transaksi distribusi';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ts_distribusi`
--

LOCK TABLES `ts_distribusi` WRITE;
/*!40000 ALTER TABLE `ts_distribusi` DISABLE KEYS */;
/*!40000 ALTER TABLE `ts_distribusi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ts_history_stok`
--

DROP TABLE IF EXISTS `ts_history_stok`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ts_history_stok` (
  `id` int NOT NULL AUTO_INCREMENT,
  `waktu` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `transaksi` enum('Stok Opname','Penerimaan','Distribusi','Penerimaan Distribusi','Pemakaian') CHARACTER SET latin1 COLLATE latin1_swedish_ci DEFAULT NULL,
  `nobatch` varchar(15) DEFAULT NULL,
  `id_barang` int DEFAULT NULL,
  `ed` date DEFAULT NULL,
  `stok_sebelum` decimal(14,2) DEFAULT NULL,
  `masuk` decimal(14,2) NOT NULL DEFAULT '0.00',
  `keluar` decimal(14,2) NOT NULL DEFAULT '0.00',
  `stok_sesudah` decimal(14,2) DEFAULT NULL,
  `keterangan` text,
  `id_penerimaan` int DEFAULT NULL COMMENT 'Kelihatannya tidak dipakai',
  `id_distribusi` int DEFAULT NULL COMMENT 'Kelihatannya tidak dipakai',
  `id_penerimaan_distribusi` int DEFAULT NULL COMMENT 'Setelah dilakukan perhitungan qty real',
  `id_stok_opname_detail` int DEFAULT NULL,
  `id_unit` int DEFAULT NULL,
  `id_users` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_barang` (`id_barang`),
  KEY `id_users` (`id_users`),
  KEY `id_unit` (`id_unit`),
  KEY `id_penerimaan` (`id_penerimaan`),
  KEY `id_distribusi` (`id_distribusi`),
  KEY `id_penerimaan_distribusi` (`id_penerimaan_distribusi`),
  KEY `waktu` (`waktu`,`id_unit`),
  KEY `waktu_2` (`waktu`,`id_barang`,`ed`,`id_unit`),
  KEY `waktu_3` (`waktu`),
  KEY `id_barang_2` (`id_barang`,`ed`,`id_unit`),
  KEY `id_barang_3` (`id_barang`,`id_unit`),
  KEY `transaksi` (`transaksi`,`id_unit`),
  KEY `waktu_4` (`waktu`,`transaksi`,`id_barang`),
  KEY `id_transaksi` (`transaksi`),
  KEY `id_stok_opname_detail` (`id_stok_opname_detail`)
) ENGINE=InnoDB AUTO_INCREMENT=174 DEFAULT CHARSET=latin1 COMMENT='Jurnal transaksi keluar dan masuk barang';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ts_history_stok`
--

LOCK TABLES `ts_history_stok` WRITE;
/*!40000 ALTER TABLE `ts_history_stok` DISABLE KEYS */;
/*!40000 ALTER TABLE `ts_history_stok` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-29 12:55:44
