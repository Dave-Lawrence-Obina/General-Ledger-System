-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 22, 2022 at 07:37 PM
-- Server version: 10.4.20-MariaDB
-- PHP Version: 8.0.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `general_ledger`
--

-- --------------------------------------------------------

--
-- Table structure for table `account_types`
--

CREATE TABLE `account_types` (
  `account_type_id` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` smallint(6) NOT NULL,
  `description` mediumtext DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `account_types`
--

INSERT INTO `account_types` (`account_type_id`, `name`, `code`, `description`, `status`, `created_at`, `updated_at`, `created_by`, `updated_by`) VALUES
('1a337fdb-ac04-49cb-8b29-a4a5b7df9f95', 'Equity', 300, '', 'Active', '2021-11-19 12:26:38', '2021-12-07 16:28:35', 'c7adf398-350a-43b4-a130-502051a0c1bf', 'c7adf398-350a-43b4-a130-502051a0c1bf'),
('262da420-3319-416b-a58d-67a9517c5d63', 'Asset', 100, '', 'Active', '2021-11-19 12:24:42', '2021-12-21 06:56:00', 'c7adf398-350a-43b4-a130-502051a0c1bf', 'c7adf398-350a-43b4-a130-502051a0c1bf'),
('36246b7e-6153-4eab-9a26-25b36c5518a1', 'Liability', 200, '', 'Active', '2021-11-19 12:26:30', '2021-12-07 16:30:36', 'c7adf398-350a-43b4-a130-502051a0c1bf', 'c7adf398-350a-43b4-a130-502051a0c1bf'),
('9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Expense', 500, '', 'Active', '2021-11-19 12:27:04', '2021-11-19 12:27:04', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('cb98dd05-849e-4c56-8019-1d02e84dfcad', 'Revenue', 400, '', 'Active', '2021-11-19 12:26:55', '2021-11-19 12:26:55', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('e5911e16-cab6-455e-a826-5153a5600b74', 'Contra Asset', 600, '', 'Active', '2021-11-19 12:27:53', '2021-11-19 12:27:53', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `chart_accounts`
--

CREATE TABLE `chart_accounts` (
  `chart_account_id` char(36) NOT NULL,
  `account_number` smallint(6) NOT NULL,
  `account_title` varchar(255) NOT NULL,
  `description` mediumtext DEFAULT NULL,
  `account_type` char(36) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `chart_accounts`
--

INSERT INTO `chart_accounts` (`chart_account_id`, `account_number`, `account_title`, `description`, `account_type`, `status`, `created_at`, `updated_at`, `created_by`, `updated_by`) VALUES
('0065acef-5c73-41d5-9a20-e2499498b6d8', 129, 'Land', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 17:03:41', '2021-12-05 19:39:43', 'c7adf398-350a-43b4-a130-502051a0c1bf', 'c7adf398-350a-43b4-a130-502051a0c1bf'),
('0081bbd3-27b4-4dbd-935a-775c20afd93a', 215, 'Long-Term Notes Payable', '', '36246b7e-6153-4eab-9a26-25b36c5518a1', 'Active', '2022-02-05 10:24:38', '2022-02-05 10:24:38', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('02ba031f-ee3c-4d93-82fa-832759e97e2e', 534, 'Benefits', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-12-03 20:05:58', '2021-12-03 20:05:58', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('03995a02-6f4b-46fd-9902-302b3c37995d', 103, 'Motor Vehicles', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:29:39', '2021-11-19 12:29:39', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('068b9005-5a7b-4279-9ee0-97d95bdc09c9', 501, 'Depreciation Expense – Land Improvements', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 12:55:25', '2021-11-19 12:55:25', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('081a1581-ee4d-4193-96a8-0b64d4869884', 199, 'Other Assets', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:43:51', '2021-12-05 19:39:24', 'c7adf398-350a-43b4-a130-502051a0c1bf', 'c7adf398-350a-43b4-a130-502051a0c1bf'),
('0a722165-3920-4103-b1e6-4b815cc08404', 530, 'Other Losses', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 13:09:06', '2021-11-19 13:09:06', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('0ac96d6a-9fc7-4b8a-93b1-2ef83b55c141', 606, 'Acc. Depreciation - Trees, Plants & Crops', '', 'e5911e16-cab6-455e-a826-5153a5600b74', 'Active', '2021-11-19 12:32:10', '2021-11-19 12:32:10', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('0b2350b9-be89-4c9f-8828-ffabf6149e9c', 505, 'Depreciation Expense - Machinery & Equipment', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 12:57:00', '2021-11-19 12:57:00', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('0b56402b-a1ac-445b-a4b9-7c6e6b6aafe3', 607, 'Acc. Amortization - Patents/Copyrights', '', 'e5911e16-cab6-455e-a826-5153a5600b74', 'Active', '2021-11-19 12:40:09', '2021-11-19 12:40:09', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('0b5782ba-4a84-4012-828f-296054a60570', 122, 'Softwares/Websites/Apps', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:40:20', '2021-11-19 12:40:20', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('0db60666-ed5c-4157-9835-db4e028149dc', 202, 'Notes Payable', '', '36246b7e-6153-4eab-9a26-25b36c5518a1', 'Active', '2021-11-19 12:48:38', '2021-11-19 12:48:38', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('0fc8d122-882e-42eb-88e1-323c33e5a459', 528, 'Loss On Sale Of Other Assets', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 13:08:07', '2021-11-19 13:08:07', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('10872bae-c649-4ecd-bd00-07b7e32ee968', 302, 'Homies, Withdrawal', '', '1a337fdb-ac04-49cb-8b29-a4a5b7df9f95', 'Active', '2021-11-19 12:51:08', '2022-02-05 10:37:54', 'c7adf398-350a-43b4-a130-502051a0c1bf', 'c7adf398-350a-43b4-a130-502051a0c1bf'),
('10c6fa40-38c2-4794-a463-13c48d33eb31', 108, 'Laboratory Supplies', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:33:31', '2021-11-19 12:33:31', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('14548dc2-659c-470e-8893-35d85f9b703f', 104, 'Furniture & Fixtures', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:30:12', '2021-11-19 12:30:12', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('1bd1ecc9-8c6b-48f4-b5d0-4beb3ca24a21', 116, 'Cash In Banks', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:37:30', '2021-11-19 12:37:30', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('1c08f9a5-e643-4ba8-b814-6f513d7ef3cc', 520, 'Bank Charges', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 13:03:19', '2021-11-19 13:03:19', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('1db97d29-be2b-4ef0-abe1-0179a2a74827', 412, 'Other Gains', '', 'cb98dd05-849e-4c56-8019-1d02e84dfcad', 'Active', '2021-11-19 13:15:51', '2021-11-19 13:15:51', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('1df98f20-cd39-4023-bf77-0f9ea42d3a17', 506, 'Depreciation Expense - Trees, Plants & Crops', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 12:57:24', '2021-11-19 12:57:24', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('1f7b4f63-c3bf-4092-96f9-2aef65b6ec6e', 518, 'Transportation & Delivery Expenses', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 13:02:40', '2021-11-19 13:02:40', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('203c05de-c46b-4ca3-acad-4c967be7ea68', 525, 'Other Discounts', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 13:04:22', '2021-11-19 13:06:26', 'c7adf398-350a-43b4-a130-502051a0c1bf', 'c7adf398-350a-43b4-a130-502051a0c1bf'),
('20fa46a2-8fee-47d8-aacb-8b371d8fb2db', 209, 'Awards & Rewards Payable', '', '36246b7e-6153-4eab-9a26-25b36c5518a1', 'Active', '2021-12-03 20:08:26', '2021-12-05 19:40:29', 'c7adf398-350a-43b4-a130-502051a0c1bf', 'c7adf398-350a-43b4-a130-502051a0c1bf'),
('265f3529-f1fe-495f-89fe-c27149fa4c27', 513, 'Other General Services Expense', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 12:59:53', '2021-11-19 12:59:53', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('26a40a2d-16af-4cec-bcfe-774cae4ee032', 114, 'Other Receivables', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:36:13', '2021-11-19 12:36:13', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('2713f5e5-1b29-464c-8293-2e93221b7c7d', 526, 'Loss On Sale Of Property & Equipment', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 13:07:23', '2021-11-19 13:07:23', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('28bd6626-4ae5-4419-afc8-3a962db6df2f', 523, 'Hospital Discount', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 13:03:53', '2021-11-19 13:05:39', 'c7adf398-350a-43b4-a130-502051a0c1bf', 'c7adf398-350a-43b4-a130-502051a0c1bf'),
('2bb06b2a-ebfb-458d-93f8-584e52b7fd30', 510, 'Environment/Sanitary Services Expense', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 12:58:51', '2021-11-19 12:58:51', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('3216c07a-d45f-4f11-8607-706899d13ec1', 109, 'Dental Supplies', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:34:06', '2021-11-19 12:34:06', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('3264cf6e-68ab-4249-8404-b58a0d9dde24', 118, 'Merch. Inventory - Supplies & Materials', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:38:22', '2021-11-19 12:38:22', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('34f81c60-bec2-4c28-a0d8-d35efe482d15', 511, 'Janitorial Services Expense', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 12:59:10', '2021-11-19 12:59:10', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('366b8674-7170-411a-9264-def6f682f5d5', 111, 'Other Supplies', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:35:29', '2021-11-19 12:35:29', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('36808b13-b25b-4d0c-b43e-0b031f435027', 102, 'Buildings & Other Structures', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:29:07', '2021-11-26 18:20:42', 'c7adf398-350a-43b4-a130-502051a0c1bf', 'c7adf398-350a-43b4-a130-502051a0c1bf'),
('3d06b16b-227e-492b-bd60-4c20204a6e82', 524, 'Sales Discount', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 13:04:10', '2021-11-19 13:06:09', 'c7adf398-350a-43b4-a130-502051a0c1bf', 'c7adf398-350a-43b4-a130-502051a0c1bf'),
('3d7c0efa-5b33-4b0f-a747-5e9d39f932ca', 125, 'Prepayment To Contractors', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:42:12', '2021-11-19 12:42:12', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('3ddda5cf-ef1e-4864-86f6-184bc1cdcbae', 406, 'Other Fees', '', 'cb98dd05-849e-4c56-8019-1d02e84dfcad', 'Active', '2021-11-19 13:13:39', '2021-11-19 13:13:39', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('3ea5ad09-ea04-4ea5-9765-44bd2f3a83ad', 105, 'Machinery & Equipment', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:31:02', '2021-11-19 12:31:02', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('3f4c8858-8f58-425c-967e-60455c0298eb', 117, 'Merch. Inventory - Drugs & Medicines', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:38:02', '2021-11-19 12:38:02', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('481e8f00-7391-451c-976e-dd75709a3f25', 504, 'Depreciation Expense - Furniture & Fixtures', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 12:56:40', '2021-11-19 12:56:40', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('4b6163f5-95f7-4d34-86ec-8d4ecd267e9f', 508, 'Supplies Expense', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 12:58:23', '2021-11-19 12:58:23', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('4b8529f8-0938-40c1-af1e-d1ff85bc2b9f', 115, 'Cash', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:36:43', '2021-12-09 11:42:48', 'c7adf398-350a-43b4-a130-502051a0c1bf', 'c7adf398-350a-43b4-a130-502051a0c1bf'),
('4f0c4e6b-f8f2-4a5d-9905-24f1f7338bf3', 519, 'Program Expense', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 13:02:54', '2021-11-19 13:02:54', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('50067c8d-b24c-42d8-8687-eae0b91ddc32', 533, 'Professional Services', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-12-03 20:04:47', '2021-12-03 20:04:47', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('50806b71-d7b9-40ab-8bc5-76e07000fe9e', 124, 'Prepayment For Operating Expenses', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:41:59', '2021-11-19 12:41:59', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('5318ba01-55fd-4612-b3dd-cd83ca6798ae', 299, 'Other Liabilities', '', '36246b7e-6153-4eab-9a26-25b36c5518a1', 'Active', '2021-11-19 12:50:17', '2021-12-05 19:40:08', 'c7adf398-350a-43b4-a130-502051a0c1bf', 'c7adf398-350a-43b4-a130-502051a0c1bf'),
('55421676-713a-457f-99ef-24dc1dba95cc', 512, 'Security Services Expense', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 12:59:25', '2021-11-19 12:59:25', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('5da8ccd2-b1f2-4361-8688-f1d6ee3ad6b7', 605, 'Acc. Depreciation - Machinery & Equipment', '', 'e5911e16-cab6-455e-a826-5153a5600b74', 'Active', '2021-11-19 12:31:28', '2021-11-19 12:31:28', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('5e232117-8fe7-4a48-b2f4-a0d6f5c8869c', 409, 'Gain On Sale Of Property & Equipment', '', 'cb98dd05-849e-4c56-8019-1d02e84dfcad', 'Active', '2021-11-19 13:14:32', '2021-11-19 13:14:32', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('60d97201-aa49-4f20-874d-2aafc16bfc6d', 516, 'Printing Expense', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 13:01:50', '2021-11-19 13:01:50', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('6553c33b-078f-4a31-a19b-3221177635f5', 206, 'Bonds Payable', '', '36246b7e-6153-4eab-9a26-25b36c5518a1', 'Active', '2021-11-19 12:49:40', '2021-11-19 12:49:40', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('66f6e33c-fee5-446c-b991-03a30155e3ba', 410, 'Gain On Sale Of Intangible Assets', '', 'cb98dd05-849e-4c56-8019-1d02e84dfcad', 'Active', '2021-11-19 13:14:54', '2021-11-19 13:14:54', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('6963e52a-2a2f-49a3-9ea6-1bd20299c5e0', 603, 'Acc. Depreciation - Motor Vehicles', '', 'e5911e16-cab6-455e-a826-5153a5600b74', 'Active', '2021-11-19 12:29:55', '2021-11-19 12:29:55', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('6beecaa7-b54d-4515-b67f-37ec6be20320', 538, 'Depreciation Expense – Land', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2022-02-05 09:46:18', '2022-02-05 09:46:18', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('6cb1b7c8-7e4b-4bd2-a295-e8f5c5d47115', 399, 'Other Equity', '', '1a337fdb-ac04-49cb-8b29-a4a5b7df9f95', 'Active', '2021-11-19 12:51:39', '2021-12-05 19:40:49', 'c7adf398-350a-43b4-a130-502051a0c1bf', 'c7adf398-350a-43b4-a130-502051a0c1bf'),
('6ddb7974-1e5c-45e7-a57a-ff754d7a1377', 499, 'Other Revenues', '', 'cb98dd05-849e-4c56-8019-1d02e84dfcad', 'Active', '2021-11-19 13:16:04', '2021-12-05 19:41:28', 'c7adf398-350a-43b4-a130-502051a0c1bf', 'c7adf398-350a-43b4-a130-502051a0c1bf'),
('7009ae91-5db5-4ac6-ba52-1d8e929b91c7', 205, 'Taxes & Licenses Payable', '', '36246b7e-6153-4eab-9a26-25b36c5518a1', 'Active', '2021-11-19 12:49:25', '2022-02-05 10:21:18', 'c7adf398-350a-43b4-a130-502051a0c1bf', 'c7adf398-350a-43b4-a130-502051a0c1bf'),
('760364f2-e373-499a-9b87-f89f080f7e32', 515, 'Taxes, Duties & Licenses Expenses', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 13:01:35', '2021-11-19 13:01:35', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('77cc8b5b-9bbe-49fc-a7c6-a510eab7cf29', 210, 'Salaries Payable', '', '36246b7e-6153-4eab-9a26-25b36c5518a1', 'Active', '2021-12-03 20:03:11', '2021-12-03 20:03:11', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('7a06154c-26a0-4be3-895d-82edda57b6e4', 127, 'Prepaid Interest', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:42:35', '2021-11-19 12:42:35', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('7b38452c-bb8b-446e-86ab-67def61cb14a', 537, 'Bad Debts Expense', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2022-02-05 09:38:05', '2022-02-05 09:38:05', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('7c87b5b5-fb7f-4c79-85ee-896ca484afc8', 610, 'Allowance For Bad Debts', '', 'e5911e16-cab6-455e-a826-5153a5600b74', 'Active', '2022-02-05 09:40:28', '2022-02-05 09:40:28', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('7d0c61fc-d44e-4d64-9055-37aef41e1a9f', 110, 'Office Supplies', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:34:51', '2021-11-19 12:34:51', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('7d7bec1c-2ee1-483d-b674-a7532db39393', 531, 'Awards/Rewards, Prizes & Indemnities', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-12-03 20:08:02', '2021-12-05 19:43:25', 'c7adf398-350a-43b4-a130-502051a0c1bf', 'c7adf398-350a-43b4-a130-502051a0c1bf'),
('7f18f3cf-155d-45e8-bab6-b1f8d9d36bba', 502, 'Depreciation Expense - Buildings & Other Structures', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 12:55:52', '2021-11-19 12:55:52', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('81404a5b-661a-48fb-abe5-db6c6764f84d', 522, 'Interest Expense', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 13:03:42', '2021-11-19 13:03:42', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('82e4429f-fe5d-461e-adb1-f5b565d3a60b', 126, 'Prepaid Insurance', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:42:24', '2021-11-19 12:42:24', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('842937ce-6ed8-449d-88a2-f0bf928f7348', 207, 'Mortgage Payable', '', '36246b7e-6153-4eab-9a26-25b36c5518a1', 'Active', '2021-11-19 12:49:54', '2021-11-19 12:49:54', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('84fac523-9287-4676-94e4-5a3dccbab3be', 403, 'Medical Record Fee', '', 'cb98dd05-849e-4c56-8019-1d02e84dfcad', 'Active', '2021-11-19 13:12:56', '2021-11-19 13:12:56', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('87de21e6-0c84-4b76-bb05-445b27311b53', 599, 'Other Expenses', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 13:09:22', '2021-12-05 19:41:56', 'c7adf398-350a-43b4-a130-502051a0c1bf', 'c7adf398-350a-43b4-a130-502051a0c1bf'),
('8c272932-0cbf-4d90-ae78-f7255555e484', 204, 'Utilities Payable', '', '36246b7e-6153-4eab-9a26-25b36c5518a1', 'Active', '2021-11-19 12:49:11', '2021-11-19 12:49:11', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('9021547c-78af-4483-a785-5fab819dc72e', 203, 'Deferred Revenue', '', '36246b7e-6153-4eab-9a26-25b36c5518a1', 'Active', '2021-11-19 12:49:01', '2021-11-19 12:49:01', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('90b82c34-b838-4dbb-bc1e-4eb8af7210e1', 509, 'Utilities Expense', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 12:58:39', '2021-11-19 12:58:39', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('9198c76e-2833-4dfd-af00-1be8f395a607', 608, 'Acc. Amortization - Softwares/Websites/Apps', '', 'e5911e16-cab6-455e-a826-5153a5600b74', 'Active', '2021-11-19 12:40:40', '2021-11-19 12:40:40', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('957260f3-82cf-4a90-baab-8b0a8df65af1', 514, 'Repairs & Maintenance Expenses', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 13:00:33', '2021-11-19 13:00:49', 'c7adf398-350a-43b4-a130-502051a0c1bf', 'c7adf398-350a-43b4-a130-502051a0c1bf'),
('97148e0f-3483-4272-a56c-6b1c2c50e4a3', 101, 'Land Improvements', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:28:26', '2021-12-21 10:30:26', 'c7adf398-350a-43b4-a130-502051a0c1bf', 'c7adf398-350a-43b4-a130-502051a0c1bf'),
('9b229f9b-2792-48fe-a9cf-e1800d56f1bf', 601, 'Acc. Depreciation – Land Improvements', '', 'e5911e16-cab6-455e-a826-5153a5600b74', 'Active', '2021-11-19 12:28:43', '2021-11-19 12:28:43', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('9e7d4532-b677-47bf-9012-9b2257310491', 535, 'Compensations', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-12-03 20:06:47', '2021-12-03 20:06:47', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('9f9cfda3-03f9-42ff-96fe-b81251842982', 404, 'Clearance & Certification Fee', '', 'cb98dd05-849e-4c56-8019-1d02e84dfcad', 'Active', '2021-11-19 13:13:14', '2021-11-19 13:13:14', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('a4b06a3f-9b6a-4f58-8120-987625b4b3f8', 521, 'Insurance Expense', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 13:03:30', '2021-11-19 13:03:30', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('a5d20096-360c-4024-b896-708355433f67', 532, 'Salaries Expense', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-12-03 20:03:45', '2021-12-03 20:03:45', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('ac31f265-e227-4978-84e9-7a7ba59fe992', 529, 'Loss Of Assets', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 13:08:22', '2021-11-19 13:08:22', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('ac957bf3-551e-42fa-a930-0ef1b4a78410', 527, 'Loss On Sale Of Intangible Assets', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 13:07:35', '2021-11-19 13:07:35', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('ae71803f-a7e6-4fa1-b513-ecb590199576', 303, 'Income Summary', '', '1a337fdb-ac04-49cb-8b29-a4a5b7df9f95', 'Inactive', '2021-11-19 12:51:27', '2021-12-07 16:51:18', 'c7adf398-350a-43b4-a130-502051a0c1bf', 'c7adf398-350a-43b4-a130-502051a0c1bf'),
('afbdb10e-35c8-47eb-a0ac-69d6226c084a', 407, 'Assistance & Subsidy', '', 'cb98dd05-849e-4c56-8019-1d02e84dfcad', 'Active', '2021-11-19 13:13:56', '2021-11-19 13:13:56', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('b117cfaf-8db3-428e-ac1b-b0b8cca8f56d', 213, 'Benefit Contributions Payable', '', '36246b7e-6153-4eab-9a26-25b36c5518a1', 'Active', '2021-12-03 20:07:13', '2021-12-03 20:07:13', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('b2a38de1-591e-4adf-b1b4-8542a89e11a2', 214, 'Loans Payable', '', '36246b7e-6153-4eab-9a26-25b36c5518a1', 'Active', '2022-02-05 10:19:27', '2022-02-05 10:19:27', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('b41870d0-47aa-4cb9-8eaf-bf3b5833e5f9', 112, 'Accounts Receivable', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:35:46', '2021-11-19 12:35:46', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('b847721e-ec9a-4727-bd61-69c8b4ed0951', 301, 'Homies, Capital', '', '1a337fdb-ac04-49cb-8b29-a4a5b7df9f95', 'Active', '2021-11-19 12:50:52', '2021-11-19 12:50:52', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('b912e09f-2107-4dc6-9d30-7e9fac25c69d', 604, 'Acc. Depreciation - Furniture & Fixtures', '', 'e5911e16-cab6-455e-a826-5153a5600b74', 'Active', '2021-11-19 12:30:34', '2021-11-19 12:30:34', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('baa944de-5a17-48f2-9dbe-f218f6586106', 402, 'Professional Fee', '', 'cb98dd05-849e-4c56-8019-1d02e84dfcad', 'Active', '2021-11-19 13:12:46', '2021-11-19 13:12:46', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('baac87d5-3c65-4628-b668-1818f1501160', 507, 'Amortization - Intangible Assets', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 12:57:59', '2021-11-19 12:57:59', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('be74f2a7-3509-43b3-bb9d-1919d6eedbe8', 401, 'Sales Revenue', '', 'cb98dd05-849e-4c56-8019-1d02e84dfcad', 'Active', '2021-11-19 13:10:52', '2021-11-19 13:10:52', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('c5f325ca-864b-4565-ba5d-e62083849697', 113, 'Notes Receivable', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:36:01', '2021-11-19 12:36:01', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('c698a078-0b8b-443f-8154-b94ab0da201f', 121, 'Patents/Copyrights', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:39:53', '2021-11-19 12:39:53', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('ca2ec5ce-a344-4e90-b100-8e2273dfe30b', 405, 'Processing Fee', '', 'cb98dd05-849e-4c56-8019-1d02e84dfcad', 'Active', '2021-11-19 13:13:24', '2021-11-19 13:13:24', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('cc060e27-301c-4757-ad7c-fb1f4b02c900', 120, 'Other Merchandise Inventories', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:39:35', '2021-11-19 12:39:35', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('d4df43b4-509d-4d10-be5b-ffab271ec603', 503, 'Depreciation Expense - Motor Vehicles', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 12:56:19', '2021-11-19 12:56:19', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('d6de043a-efcc-40d6-aaa9-58c2fdabdab1', 201, 'Accounts Payable', '', '36246b7e-6153-4eab-9a26-25b36c5518a1', 'Active', '2021-11-19 12:48:15', '2021-11-19 12:48:15', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('d84fdbd6-92d1-492f-b574-ac6cf5856fc7', 211, 'Benefits Payable', '', '36246b7e-6153-4eab-9a26-25b36c5518a1', 'Active', '2021-12-03 20:05:45', '2021-12-03 20:05:45', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('d8959b3a-8ff0-4ef9-bdad-6f32a79c4db6', 609, 'Acc. Amortization - Other Intangible Assets', '', 'e5911e16-cab6-455e-a826-5153a5600b74', 'Active', '2021-11-19 12:41:32', '2021-11-19 12:41:32', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('dcc57633-6cfe-4ee3-a757-761fd71135f0', 123, 'Other Intangible Assets', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:40:59', '2021-11-19 12:40:59', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('dff363da-3bd1-4c4e-a581-c145ff6cd05e', 107, 'Medical Supplies', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:33:03', '2021-11-19 12:33:03', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('e16f38d3-ba20-42ba-bb86-51828b6dd531', 408, 'Grants & Donations', '', 'cb98dd05-849e-4c56-8019-1d02e84dfcad', 'Active', '2021-11-19 13:14:10', '2021-11-19 13:14:10', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('e2d277e6-e264-4e8f-a4f7-04b356825037', 517, 'Advertising, Promotional & Marketing Expenses', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-11-19 13:02:08', '2021-11-19 13:02:08', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('e77aa1f2-01ad-44a6-941f-488148e855d9', 119, 'Merch. Inventory - Food Supplies', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:39:18', '2021-11-19 12:39:18', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('e8830d47-1958-4db8-9370-02d125768cda', 212, 'Compensations Payable', '', '36246b7e-6153-4eab-9a26-25b36c5518a1', 'Active', '2021-12-03 20:06:14', '2021-12-03 20:06:14', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('e8a17577-c866-4dec-a399-03177b66fede', 602, 'Acc. Depreciation - Buildings & Other Structures', '', 'e5911e16-cab6-455e-a826-5153a5600b74', 'Active', '2021-11-19 12:29:27', '2021-11-19 12:29:27', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('e929ef52-680b-405b-9f30-7b31f233bf5f', 536, 'Benefit Contributions', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2021-12-03 20:07:31', '2021-12-03 20:07:31', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('ee135919-3f67-486e-b419-0e3a18f40f23', 699, 'Acc. Depreciation - Land', '', 'e5911e16-cab6-455e-a826-5153a5600b74', 'Active', '2021-11-19 17:04:27', '2022-01-30 18:35:15', 'c7adf398-350a-43b4-a130-502051a0c1bf', 'c7adf398-350a-43b4-a130-502051a0c1bf'),
('efbf8f6b-6893-4505-9fd3-9e1387132144', 208, 'Interest Payable', '', '36246b7e-6153-4eab-9a26-25b36c5518a1', 'Active', '2021-11-19 12:50:06', '2021-11-19 12:50:06', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('f0ad62c9-f75f-411c-83f7-4d9aa2958bea', 106, 'Trees, Plants & Crops', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:31:47', '2021-11-19 12:31:47', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('f8a25a2e-fd4d-4959-bdcc-fdefaed0a5c4', 539, 'Cost Of Sales', '', '9448c100-bb2c-470f-bcd7-b0c8b61f40f6', 'Active', '2022-02-05 10:31:09', '2022-02-05 10:33:38', 'c7adf398-350a-43b4-a130-502051a0c1bf', 'c7adf398-350a-43b4-a130-502051a0c1bf'),
('fd75a4ba-2f9e-4286-9152-80d267e1793f', 128, 'Other Prepayments', '', '262da420-3319-416b-a58d-67a9517c5d63', 'Active', '2021-11-19 12:42:51', '2021-11-19 12:42:51', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL),
('fe5d1ace-12f2-4a15-8f0f-1eae3d551223', 411, 'Gain On Sale Of Other Assets', '', 'cb98dd05-849e-4c56-8019-1d02e84dfcad', 'Active', '2021-11-19 13:15:12', '2021-11-19 13:15:12', 'c7adf398-350a-43b4-a130-502051a0c1bf', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `journal_accounts`
--

CREATE TABLE `journal_accounts` (
  `id` char(36) NOT NULL,
  `debit` decimal(13,2) NOT NULL DEFAULT 0.00,
  `credit` decimal(13,2) NOT NULL DEFAULT 0.00,
  `pr` smallint(6) NOT NULL,
  `account_title` char(36) DEFAULT NULL,
  `journal_entry` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `journal_entries`
--

CREATE TABLE `journal_entries` (
  `id` char(36) NOT NULL,
  `entry_type` varchar(50) NOT NULL DEFAULT 'Initial',
  `date` char(10) NOT NULL,
  `explanation` mediumtext DEFAULT NULL,
  `adjustable` tinyint(1) NOT NULL DEFAULT 0,
  `method` varchar(50) DEFAULT NULL,
  `balance` decimal(13,2) NOT NULL DEFAULT 0.00,
  `originating_entry` char(36) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Journalized',
  `journalized_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `posted_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `journalized_by` char(36) DEFAULT NULL,
  `posted_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` char(36) NOT NULL,
  `profile_pic_url` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `mobile` varchar(50) NOT NULL,
  `landline` varchar(50) DEFAULT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `user_type` varchar(50) NOT NULL DEFAULT 'Admin',
  `status` varchar(50) NOT NULL DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `profile_pic_url`, `email`, `password`, `mobile`, `landline`, `first_name`, `last_name`, `middle_name`, `user_type`, `status`, `created_at`, `updated_at`, `created_by`, `updated_by`) VALUES
('08a558e1-cc02-48f2-a851-e839ad984e74', 'static/images/profile_pics/96ae44555c8dfe37561c.png', 'admin@gmail.com', '$2b$12$gExKUpR97DOWRE2WxlYFQ.FOM6E2dg2sq1KdofTbIFcTsuyLH768a', '09122106503', NULL, 'Tito', 'Range', NULL, 'System Administrator', 'Active', '2021-11-05 00:46:17', NULL, NULL, NULL),
('11384227-67a9-4c1e-a1e8-6c84070baa47', 'static/images/profile_pics/96ae44555c8dfe37561d.png', 'internal_user@gmail.com', '$2b$12$ecsh.VUAk2nJvVDC4/cYtuT1sQ9VuoUTRrS3Io2cqvy2wCXLPPebq', '09122106504', NULL, 'Leila', 'Fetey', NULL, 'Internal User', 'Active', '2021-11-05 03:41:54', NULL, NULL, NULL),
('c7adf398-350a-43b4-a130-502051a0c1bf', 'static/images/profile_pics/96ae44555c8dfe37561b.png', 'accountant@gmail.com', '$2b$12$QNciCDXDrnePCdteUbnE.uwcG/NIkwZS23WMTfgIhJXKhWdp4Slly', '09122106502', NULL, 'test', 'test', NULL, 'Accountant', 'Active', '2021-09-28 06:12:40', NULL, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account_types`
--
ALTER TABLE `account_types`
  ADD PRIMARY KEY (`account_type_id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `ix_account_types_name` (`name`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `chart_accounts`
--
ALTER TABLE `chart_accounts`
  ADD PRIMARY KEY (`chart_account_id`),
  ADD UNIQUE KEY `account_number` (`account_number`),
  ADD UNIQUE KEY `ix_chart_accounts_account_title` (`account_title`),
  ADD KEY `account_type` (`account_type`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `journal_accounts`
--
ALTER TABLE `journal_accounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `account_title` (`account_title`),
  ADD KEY `journal_entry` (`journal_entry`);

--
-- Indexes for table `journal_entries`
--
ALTER TABLE `journal_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `originating_entry` (`originating_entry`),
  ADD KEY `journalized_by` (`journalized_by`),
  ADD KEY `posted_by` (`posted_by`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `mobile` (`mobile`),
  ADD UNIQUE KEY `ix_users_email` (`email`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `account_types`
--
ALTER TABLE `account_types`
  ADD CONSTRAINT `account_types_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `account_types_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `chart_accounts`
--
ALTER TABLE `chart_accounts`
  ADD CONSTRAINT `chart_accounts_ibfk_1` FOREIGN KEY (`account_type`) REFERENCES `account_types` (`account_type_id`),
  ADD CONSTRAINT `chart_accounts_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `chart_accounts_ibfk_3` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `journal_accounts`
--
ALTER TABLE `journal_accounts`
  ADD CONSTRAINT `journal_accounts_ibfk_1` FOREIGN KEY (`account_title`) REFERENCES `chart_accounts` (`chart_account_id`),
  ADD CONSTRAINT `journal_accounts_ibfk_2` FOREIGN KEY (`journal_entry`) REFERENCES `journal_entries` (`id`);

--
-- Constraints for table `journal_entries`
--
ALTER TABLE `journal_entries`
  ADD CONSTRAINT `journal_entries_ibfk_1` FOREIGN KEY (`originating_entry`) REFERENCES `journal_entries` (`id`),
  ADD CONSTRAINT `journal_entries_ibfk_2` FOREIGN KEY (`journalized_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `journal_entries_ibfk_3` FOREIGN KEY (`posted_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `journal_entries_ibfk_4` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
