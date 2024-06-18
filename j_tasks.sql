-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jan 13, 2024 at 06:26 PM
-- Server version: 8.0.31
-- PHP Version: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `j_tasks`
--
CREATE DATABASE IF NOT EXISTS `j_tasks` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `j_tasks`;

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
  `ID` int NOT NULL,
  `Bezeichnung` text NOT NULL,
  `color` text,
  `display` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `cron-jobs`
--

DROP TABLE IF EXISTS `cron-jobs`;
CREATE TABLE `cron-jobs` (
  `ID` int NOT NULL,
  `enabled` tinyint(1) NOT NULL,
  `time` text NOT NULL,
  `description` text CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
  `action` text NOT NULL,
  `last_executed` timestamp NULL DEFAULT NULL,
  `next_execution` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `habits`
--

DROP TABLE IF EXISTS `habits`;
CREATE TABLE `habits` (
  `ID` int NOT NULL,
  `name` text NOT NULL,
  `type` enum('daily','weekly','monthly') NOT NULL DEFAULT 'daily',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `habits_tracker`
--

DROP TABLE IF EXISTS `habits_tracker`;
CREATE TABLE `habits_tracker` (
  `habitID` int NOT NULL,
  `done` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `entered` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `habit_groups`
--

DROP TABLE IF EXISTS `habit_groups`;
CREATE TABLE `habit_groups` (
  `ID` int NOT NULL,
  `name` text NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `habit_group_members`
--

DROP TABLE IF EXISTS `habit_group_members`;
CREATE TABLE `habit_group_members` (
  `groupID` int NOT NULL,
  `habitID` int NOT NULL,
  `added` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `m_health`
--

DROP TABLE IF EXISTS `m_health`;
CREATE TABLE `m_health` (
  `ID` int NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ampel` tinyint NOT NULL,
  `note` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `nfcLocations`
--

DROP TABLE IF EXISTS `nfcLocations`;
CREATE TABLE `nfcLocations` (
  `ID` int NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `location` text,
  `deviceOwner` text,
  `nfcID` varchar(20) NOT NULL,
  `deviceID` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `project_tasks`
--

DROP TABLE IF EXISTS `project_tasks`;
CREATE TABLE `project_tasks` (
  `ID` int NOT NULL,
  `name` varchar(128) NOT NULL,
  `description` text NOT NULL,
  `deadline` datetime DEFAULT NULL,
  `done` datetime DEFAULT NULL,
  `time_estimate` int DEFAULT NULL,
  `child_of` int DEFAULT NULL,
  `depends_on` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `repeatingTasks`
--

DROP TABLE IF EXISTS `repeatingTasks`;
CREATE TABLE `repeatingTasks` (
  `ID` int NOT NULL,
  `Name` text NOT NULL,
  `description` text,
  `startingDate` date NOT NULL,
  `endingDate` date DEFAULT NULL,
  `due_time` time DEFAULT NULL,
  `duration` time DEFAULT NULL,
  `priority` int NOT NULL,
  `created` datetime NOT NULL,
  `repeatingInterval` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
CREATE TABLE `tasks` (
  `ID` int NOT NULL,
  `Name` text NOT NULL,
  `description` text NOT NULL,
  `due` date NOT NULL,
  `due_time` time DEFAULT NULL,
  `done` timestamp NULL DEFAULT NULL,
  `duration` time DEFAULT NULL,
  `priority` int NOT NULL,
  `difficulty` int NOT NULL DEFAULT '1',
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `category` int NOT NULL,
  `location` text NOT NULL DEFAULT '',
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `autogen` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `task_associations`
--

DROP TABLE IF EXISTS `task_associations`;
CREATE TABLE `task_associations` (
  `ID` int NOT NULL,
  `taskID` int NOT NULL,
  `type` enum('child_of','depends_on') NOT NULL,
  `foreignID` int NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `task_history`
--

DROP TABLE IF EXISTS `task_history`;
CREATE TABLE `task_history` (
  `ID` int NOT NULL,
  `taskID` int NOT NULL,
  `start_time` datetime NOT NULL,
  `stop_time` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `task_notes`
--

DROP TABLE IF EXISTS `task_notes`;
CREATE TABLE `task_notes` (
  `taskID` int NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `note` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wakeup_times`
--

DROP TABLE IF EXISTS `wakeup_times`;
CREATE TABLE `wakeup_times` (
  `ID` int NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `wake_up` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Tabellenstruktur für Tabelle `settings`
--

CREATE TABLE `settings` (
  `key` varchar(128) NOT NULL,
  `value` text NOT NULL,
  `access` varchar(64) NOT NULL,
  `updated` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `cron-jobs`
--
ALTER TABLE `cron-jobs`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `habits`
--
ALTER TABLE `habits`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `habits_tracker`
--
ALTER TABLE `habits_tracker`
  ADD PRIMARY KEY (`habitID`,`done`);

--
-- Indexes for table `habit_groups`
--
ALTER TABLE `habit_groups`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `habit_group_members`
--
ALTER TABLE `habit_group_members`
  ADD PRIMARY KEY (`groupID`,`habitID`),
  ADD KEY `habitID` (`habitID`);

--
-- Indexes for table `m_health`
--
ALTER TABLE `m_health`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `nfcLocations`
--
ALTER TABLE `nfcLocations`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `project_tasks`
--
ALTER TABLE `project_tasks`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `child_of` (`child_of`),
  ADD KEY `depends_on` (`depends_on`);

--
-- Indexes for table `repeatingTasks`
--
ALTER TABLE `repeatingTasks`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `category` (`category`);

--
-- Indexes for table `task_associations`
--
ALTER TABLE `task_associations`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `taskID` (`taskID`),
  ADD KEY `foreignID` (`foreignID`);

--
-- Indexes for table `task_history`
--
ALTER TABLE `task_history`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `taskID` (`taskID`);

--
-- Indexes for table `task_notes`
--
ALTER TABLE `task_notes`
  ADD PRIMARY KEY (`taskID`,`created`);

--
-- Indexes for table `wakeup_times`
--
ALTER TABLE `wakeup_times`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cron-jobs`
--
ALTER TABLE `cron-jobs`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `habits`
--
ALTER TABLE `habits`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `habit_groups`
--
ALTER TABLE `habit_groups`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `m_health`
--
ALTER TABLE `m_health`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `nfcLocations`
--
ALTER TABLE `nfcLocations`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_tasks`
--
ALTER TABLE `project_tasks`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `repeatingTasks`
--
ALTER TABLE `repeatingTasks`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `task_associations`
--
ALTER TABLE `task_associations`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `task_history`
--
ALTER TABLE `task_history`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wakeup_times`
--
ALTER TABLE `wakeup_times`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- Indizes für die Tabelle `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`key`);
COMMIT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `habits_tracker`
--
ALTER TABLE `habits_tracker`
  ADD CONSTRAINT `habits_tracker_ibfk_1` FOREIGN KEY (`habitID`) REFERENCES `habits` (`ID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `habit_group_members`
--
ALTER TABLE `habit_group_members`
  ADD CONSTRAINT `habit_group_members_ibfk_1` FOREIGN KEY (`groupID`) REFERENCES `habit_groups` (`ID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `habit_group_members_ibfk_2` FOREIGN KEY (`habitID`) REFERENCES `habits` (`ID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `project_tasks`
--
ALTER TABLE `project_tasks`
  ADD CONSTRAINT `project_tasks_ibfk_1` FOREIGN KEY (`child_of`) REFERENCES `project_tasks` (`ID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `project_tasks_ibfk_2` FOREIGN KEY (`depends_on`) REFERENCES `project_tasks` (`ID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`category`) REFERENCES `category` (`ID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `task_associations`
--
ALTER TABLE `task_associations`
  ADD CONSTRAINT `task_associations_ibfk_1` FOREIGN KEY (`taskID`) REFERENCES `tasks` (`ID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `task_associations_ibfk_2` FOREIGN KEY (`foreignID`) REFERENCES `tasks` (`ID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `task_history`
--
ALTER TABLE `task_history`
  ADD CONSTRAINT `task_history_ibfk_1` FOREIGN KEY (`taskID`) REFERENCES `tasks` (`ID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `task_notes`
--
ALTER TABLE `task_notes`
  ADD CONSTRAINT `task_notes_ibfk_1` FOREIGN KEY (`taskID`) REFERENCES `tasks` (`ID`) ON DELETE RESTRICT ON UPDATE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

INSERT INTO `category` (`ID`, `Bezeichnung`, `color`, `display`) VALUES ('0', 'null', NULL, '1');
INSERT INTO `tasks` (`ID`, `Name`, `description`, `due`, `due_time`, `done`, `duration`, `priority`, `difficulty`, `created`, `category`, `location`, `deleted`, `autogen`) VALUES (NULL, 'Setup Task', 'This is a hidden task for you to see, when this system was initially started as it gets created on the first startup :)', CURRENT_DATE(), NULL, NULL, NULL, '5', '1', current_timestamp(), '0', '', '1', '1');
INSERT INTO `tasks` (`ID`, `Name`, `description`, `due`, `due_time`, `done`, `duration`, `priority`, `difficulty`, `created`, `category`, `location`, `deleted`, `autogen`) VALUES (NULL, 'First Task', '', CURRENT_DATE(), NULL, NULL, NULL, '5', '1', current_timestamp(), '0', '', '0', '0');