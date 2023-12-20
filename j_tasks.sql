-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Erstellungszeit: 20. Dez 2023 um 09:13
-- Server-Version: 8.0.31
-- PHP-Version: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `j_tasks`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `category`
--

CREATE TABLE `category` (
  `ID` int NOT NULL,
  `Bezeichnung` text NOT NULL,
  `color` text,
  `display` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `cron-jobs`
--

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
-- Tabellenstruktur für Tabelle `habits`
--

CREATE TABLE `habits` (
  `ID` int NOT NULL,
  `name` text NOT NULL,
  `type` enum('daily','weekly','monthly') NOT NULL DEFAULT 'daily',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `habits_tracker`
--

CREATE TABLE `habits_tracker` (
  `habitID` int NOT NULL,
  `done` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `entered` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `m_health`
--

CREATE TABLE `m_health` (
  `ID` int NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ampel` tinyint NOT NULL,
  `note` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `nfcLocations`
--

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
-- Tabellenstruktur für Tabelle `project_tasks`
--

CREATE TABLE `project_tasks` (
  `ID` int NOT NULL,
  `name` varchar(128) NOT NULL,
  `description` text NOT NULL,
  `deadline` datetime DEFAULT NULL,
  `done` datetime DEFAULT NULL,
  `time_estimate` int DEFAULT NULL,
  `child_of` int DEFAULT NULL,
  `depends_on` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `repeatingTasks`
--

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
-- Tabellenstruktur für Tabelle `tasks`
--

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
  `location` text NOT NULL,
  `deleted` tinyint(1) NOT NULL DEFAULT '0',
  `autogen` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `task_associations`
--

CREATE TABLE `task_associations` (
  `ID` int NOT NULL,
  `taskID` int NOT NULL,
  `type` enum('child_of','depends_on') NOT NULL,
  `foreignID` int NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `task_history`
--

CREATE TABLE `task_history` (
  `ID` int NOT NULL,
  `taskID` int NOT NULL,
  `start_time` datetime NOT NULL,
  `stop_time` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `task_notes`
--

CREATE TABLE `task_notes` (
  `taskID` int NOT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `note` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `wakeup_times`
--

CREATE TABLE `wakeup_times` (
  `ID` int NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `wake_up` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`ID`);

--
-- Indizes für die Tabelle `cron-jobs`
--
ALTER TABLE `cron-jobs`
  ADD PRIMARY KEY (`ID`);

--
-- Indizes für die Tabelle `habits`
--
ALTER TABLE `habits`
  ADD PRIMARY KEY (`ID`);

--
-- Indizes für die Tabelle `habits_tracker`
--
ALTER TABLE `habits_tracker`
  ADD PRIMARY KEY (`habitID`,`done`);

--
-- Indizes für die Tabelle `m_health`
--
ALTER TABLE `m_health`
  ADD PRIMARY KEY (`ID`);

--
-- Indizes für die Tabelle `nfcLocations`
--
ALTER TABLE `nfcLocations`
  ADD PRIMARY KEY (`ID`);

--
-- Indizes für die Tabelle `project_tasks`
--
ALTER TABLE `project_tasks`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `child_of` (`child_of`),
  ADD KEY `depends_on` (`depends_on`);

--
-- Indizes für die Tabelle `repeatingTasks`
--
ALTER TABLE `repeatingTasks`
  ADD PRIMARY KEY (`ID`);

--
-- Indizes für die Tabelle `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `category` (`category`);

--
-- Indizes für die Tabelle `task_associations`
--
ALTER TABLE `task_associations`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `taskID` (`taskID`),
  ADD KEY `foreignID` (`foreignID`);

--
-- Indizes für die Tabelle `task_history`
--
ALTER TABLE `task_history`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `taskID` (`taskID`);

--
-- Indizes für die Tabelle `task_notes`
--
ALTER TABLE `task_notes`
  ADD PRIMARY KEY (`taskID`,`created`);

--
-- Indizes für die Tabelle `wakeup_times`
--
ALTER TABLE `wakeup_times`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `category`
--
ALTER TABLE `category`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `cron-jobs`
--
ALTER TABLE `cron-jobs`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `habits`
--
ALTER TABLE `habits`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `m_health`
--
ALTER TABLE `m_health`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `nfcLocations`
--
ALTER TABLE `nfcLocations`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `project_tasks`
--
ALTER TABLE `project_tasks`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `repeatingTasks`
--
ALTER TABLE `repeatingTasks`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `tasks`
--
ALTER TABLE `tasks`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `task_associations`
--
ALTER TABLE `task_associations`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `task_history`
--
ALTER TABLE `task_history`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `wakeup_times`
--
ALTER TABLE `wakeup_times`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT;

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `habits_tracker`
--
ALTER TABLE `habits_tracker`
  ADD CONSTRAINT `habits_tracker_ibfk_1` FOREIGN KEY (`habitID`) REFERENCES `habits` (`ID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints der Tabelle `project_tasks`
--
ALTER TABLE `project_tasks`
  ADD CONSTRAINT `project_tasks_ibfk_1` FOREIGN KEY (`child_of`) REFERENCES `project_tasks` (`ID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `project_tasks_ibfk_2` FOREIGN KEY (`depends_on`) REFERENCES `project_tasks` (`ID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints der Tabelle `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`category`) REFERENCES `category` (`ID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints der Tabelle `task_associations`
--
ALTER TABLE `task_associations`
  ADD CONSTRAINT `task_associations_ibfk_1` FOREIGN KEY (`taskID`) REFERENCES `tasks` (`ID`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `task_associations_ibfk_2` FOREIGN KEY (`foreignID`) REFERENCES `tasks` (`ID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints der Tabelle `task_history`
--
ALTER TABLE `task_history`
  ADD CONSTRAINT `task_history_ibfk_1` FOREIGN KEY (`taskID`) REFERENCES `tasks` (`ID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints der Tabelle `task_notes`
--
ALTER TABLE `task_notes`
  ADD CONSTRAINT `task_notes_ibfk_1` FOREIGN KEY (`taskID`) REFERENCES `tasks` (`ID`) ON DELETE RESTRICT ON UPDATE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
