CREATE DATABASE IF NOT EXISTS `startup_muslim_directory_local_v312`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `startup_muslim_directory_local_v312`;

CREATE TABLE IF NOT EXISTS schema_migrations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  version VARCHAR(50) NOT NULL UNIQUE,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('Admin','Founder','Investor','Ecosystem Partner','General User') NOT NULL DEFAULT 'General User',
  country VARCHAR(120) NULL,
  status ENUM('Active','Blocked','Pending') NOT NULL DEFAULT 'Active',
  verified TINYINT(1) NOT NULL DEFAULT 0,
  joined_at DATE NULL,
  profile JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categories (
  record_key VARCHAR(191) PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Active',
  display_order INT NOT NULL DEFAULT 0,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  data JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_categories_status_order (status, display_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS startups (
  record_key VARCHAR(191) PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Pending',
  owner_id VARCHAR(64) NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  verified TINYINT(1) NOT NULL DEFAULT 0,
  category VARCHAR(120) NULL,
  country VARCHAR(120) NULL,
  stage VARCHAR(80) NULL,
  total_raised DECIMAL(18,2) NOT NULL DEFAULT 0,
  views INT UNSIGNED NOT NULL DEFAULT 0,
  data JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_startups_status (status),
  INDEX idx_startups_owner (owner_id),
  INDEX idx_startups_category (category),
  INDEX idx_startups_country (country),
  INDEX idx_startups_featured (featured)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS founders (
  record_key VARCHAR(191) PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Published',
  owner_id VARCHAR(64) NULL,
  verified TINYINT(1) NOT NULL DEFAULT 0,
  startup_slug VARCHAR(191) NULL,
  country VARCHAR(120) NULL,
  industry VARCHAR(120) NULL,
  data JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_founders_status (status),
  INDEX idx_founders_startup (startup_slug),
  INDEX idx_founders_country (country)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS investors (
  record_key VARCHAR(191) PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Published',
  owner_id VARCHAR(64) NULL,
  verified TINYINT(1) NOT NULL DEFAULT 0,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  investor_type VARCHAR(120) NULL,
  country VARCHAR(120) NULL,
  data JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_investors_status (status),
  INDEX idx_investors_type (investor_type),
  INDEX idx_investors_country (country),
  INDEX idx_investors_featured (featured)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS funding_rounds (
  record_key VARCHAR(191) PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Published',
  startup_slug VARCHAR(191) NULL,
  amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  valuation DECIMAL(18,2) NOT NULL DEFAULT 0,
  round_date DATE NULL,
  data JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_rounds_status (status),
  INDEX idx_rounds_startup (startup_slug),
  INDEX idx_rounds_date (round_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pitches (
  record_key VARCHAR(191) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Active',
  review_status VARCHAR(40) NOT NULL DEFAULT 'Pending',
  visibility VARCHAR(40) NOT NULL DEFAULT 'Private',
  owner_id VARCHAR(64) NULL,
  startup_slug VARCHAR(191) NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  requested DECIMAL(18,2) NOT NULL DEFAULT 0,
  views INT UNSIGNED NOT NULL DEFAULT 0,
  data JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pitches_review (review_status),
  INDEX idx_pitches_owner (owner_id),
  INDEX idx_pitches_startup (startup_slug),
  INDEX idx_pitches_visibility (visibility)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS jobs (
  record_key VARCHAR(191) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Published',
  startup_slug VARCHAR(191) NULL,
  location VARCHAR(190) NULL,
  arrangement VARCHAR(50) NULL,
  job_type VARCHAR(80) NULL,
  data JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_jobs_status (status),
  INDEX idx_jobs_startup (startup_slug),
  INDEX idx_jobs_type (job_type)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS opportunities (
  record_key VARCHAR(191) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Published',
  opportunity_type VARCHAR(100) NULL,
  organization VARCHAR(190) NULL,
  country VARCHAR(120) NULL,
  deadline DATE NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  data JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_opportunities_status (status),
  INDEX idx_opportunities_type (opportunity_type),
  INDEX idx_opportunities_deadline (deadline),
  INDEX idx_opportunities_featured (featured)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS claim_requests (
  record_key VARCHAR(191) PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Pending',
  owner_id VARCHAR(64) NULL,
  startup_slug VARCHAR(191) NULL,
  requester_email VARCHAR(190) NULL,
  data JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_claims_status (status),
  INDEX idx_claims_owner (owner_id),
  INDEX idx_claims_startup (startup_slug)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS contact_messages (
  record_key VARCHAR(191) PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  email VARCHAR(190) NULL,
  topic VARCHAR(190) NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Unread',
  data JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_messages_status (status),
  INDEX idx_messages_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  record_key VARCHAR(191) PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  status VARCHAR(40) NOT NULL DEFAULT 'Subscribed',
  source VARCHAR(100) NULL,
  data JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_subscribers_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pages (
  record_key VARCHAR(191) PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Draft',
  seo_title VARCHAR(255) NULL,
  data JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pages_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS media (
  record_key VARCHAR(191) PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  media_type VARCHAR(80) NULL,
  media_url LONGTEXT NULL,
  data JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_media_type (media_type)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS site_settings (
  id TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
  settings JSON NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS activity_logs (
  record_key VARCHAR(191) PRIMARY KEY,
  action VARCHAR(190) NOT NULL,
  actor VARCHAR(190) NULL,
  detail TEXT NULL,
  data JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_activity_created (created_at),
  INDEX idx_activity_actor (actor)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS saved_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  item_type VARCHAR(40) NOT NULL,
  item_key VARCHAR(191) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_saved_item (user_id, item_type, item_key),
  CONSTRAINT fk_saved_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_saved_user_type (user_id, item_type)
) ENGINE=InnoDB;

INSERT IGNORE INTO schema_migrations (version) VALUES ('3.0.0');

INSERT IGNORE INTO schema_migrations (version) VALUES ('3.1.0');

INSERT IGNORE INTO schema_migrations (version) VALUES ('3.1.2');
