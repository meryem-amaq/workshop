-- ====================================================================
-- Schéma MySQL - Le Village IoT des Schtroumpfs
-- Base de données pour le workshop d'innovation gamifié
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `smurf_iot_village` 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `smurf_iot_village`;

-- 1. Table des sessions de workshop
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL DEFAULT 'Workshop IoT des Schtroumpfs',
  `phase` VARCHAR(50) NOT NULL DEFAULT 'registration', -- 'registration', 'teams_formed', 'working', 'restitution', 'completed'
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table des équipes (Groupes homogènes par profil Schtroumpf)
CREATE TABLE IF NOT EXISTS `teams` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `session_id` VARCHAR(64) NOT NULL DEFAULT 'default',
  `name` VARCHAR(100) NOT NULL,
  `archetype` ENUM('Artiste', 'Professeur', 'Critique', 'Empathique', 'Sportif') NOT NULL,
  `color` VARCHAR(30) NOT NULL DEFAULT '#0284c7',
  `avatar` VARCHAR(255) NOT NULL DEFAULT 'professeur.jpg',
  `current_house` INT NOT NULL DEFAULT 1, -- 1 à 6
  `progress_percent` INT NOT NULL DEFAULT 16, -- 16, 33, 50, 66, 83, 100
  `scribe_participant_id` VARCHAR(64) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table des participants inscrits et leurs profils
CREATE TABLE IF NOT EXISTS `participants` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `session_id` VARCHAR(64) NOT NULL DEFAULT 'default',
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `archetype` ENUM('Artiste', 'Professeur', 'Critique', 'Empathique', 'Sportif') NOT NULL,
  `archetype_scores` JSON NOT NULL,
  `team_id` VARCHAR(64) NULL,
  `is_scribe` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_participant_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table des livrables pour chaque maison (M1 à M6)
CREATE TABLE IF NOT EXISTS `deliverables` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `team_id` VARCHAR(64) NOT NULL,
  `house_number` INT NOT NULL, -- 1: Besoin, 2: Idée, 3: Faisabilité, 4: Prototype, 5: Business, 6: Marché
  `house_title` VARCHAR(100) NOT NULL,
  `content` JSON NOT NULL, -- Contient les champs spécifiques de l'étape
  `status` ENUM('draft', 'submitted', 'validated') NOT NULL DEFAULT 'submitted',
  `submitted_by` VARCHAR(64) NULL,
  `submitted_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `validated_at` TIMESTAMP NULL,
  UNIQUE KEY `uk_team_house` (`team_id`, `house_number`),
  CONSTRAINT `fk_deliverable_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Table d'audit et journal d'activités
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `session_id` VARCHAR(64) NOT NULL DEFAULT 'default',
  `team_id` VARCHAR(64) NULL,
  `event_type` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `metadata` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Données initiales par défaut
INSERT IGNORE INTO `sessions` (`id`, `title`, `phase`) 
VALUES ('default', 'Workshop IoT des Schtroumpfs - Édition 2026', 'registration');
