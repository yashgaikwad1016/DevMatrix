CREATE DATABASE IF NOT EXISTS devmatrix
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE devmatrix;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS payment_webhook_events;
DROP TABLE IF EXISTS receipts;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS quotation_items;
DROP TABLE IF EXISTS quotations;
DROP TABLE IF EXISTS change_requests;
DROP TABLE IF EXISTS project_reviews;
DROP TABLE IF EXISTS deployments;
DROP TABLE IF EXISTS github_integrations;
DROP TABLE IF EXISTS deliverables;
DROP TABLE IF EXISTS message_attachments;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS referrals;
DROP TABLE IF EXISTS referral_settings;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS project_milestones;
DROP TABLE IF EXISTS project_files;
DROP TABLE IF EXISTS project_ai_features;
DROP TABLE IF EXISTS functional_requirements;
DROP TABLE IF EXISTS project_technologies;
DROP TABLE IF EXISTS project_designs;
DROP TABLE IF EXISTS project_requirements;
DROP TABLE IF EXISTS project_members;
DROP TABLE IF EXISTS developer_profiles;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS email_verification_tokens;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS auth_accounts;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS system_settings;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- 1. USERS
-- =========================================================
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NULL,
    mobile VARCHAR(25) NULL,
    college VARCHAR(190) NULL,
    university VARCHAR(190) NULL,
    user_type ENUM('student','employee','other') NOT NULL DEFAULT 'student',
    role ENUM('client','admin','developer') NOT NULL DEFAULT 'client',
    profile_image_url VARCHAR(500) NULL,
    referral_code VARCHAR(50) NULL UNIQUE,
    referred_by BIGINT UNSIGNED NULL,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_referred_by
        FOREIGN KEY (referred_by) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_users_role (role),
    INDEX idx_users_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 2. AUTH ACCOUNTS
-- =========================================================
CREATE TABLE auth_accounts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    provider ENUM('local','google','github') NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    provider_email VARCHAR(190) NULL,
    access_token_encrypted TEXT NULL,
    refresh_token_encrypted TEXT NULL,
    token_expires_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_auth_provider_account (provider, provider_account_id),
    INDEX idx_auth_user_id (user_id),
    CONSTRAINT fk_auth_accounts_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 3. USER SESSIONS / REFRESH TOKENS
-- =========================================================
CREATE TABLE user_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    refresh_token_hash VARCHAR(255) NOT NULL UNIQUE,
    user_agent VARCHAR(500) NULL,
    ip_address VARCHAR(45) NULL,
    expires_at DATETIME NOT NULL,
    revoked_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_expires (expires_at),
    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 4. EMAIL VERIFICATION TOKENS
-- =========================================================
CREATE TABLE email_verification_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email_verify_user (user_id),
    CONSTRAINT fk_email_verify_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 5. PASSWORD RESET TOKENS
-- =========================================================
CREATE TABLE password_reset_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_password_reset_user (user_id),
    CONSTRAINT fk_password_reset_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 6. DEVELOPER PROFILE
-- =========================================================
CREATE TABLE developer_profiles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    bio TEXT NULL,
    skills JSON NULL,
    experience_years DECIMAL(4,1) NULL,
    availability_status ENUM('available','busy','inactive') NOT NULL DEFAULT 'available',
    timezone VARCHAR(100) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_developer_profile_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 7. PROJECTS
-- =========================================================
CREATE TABLE projects (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_number VARCHAR(50) NOT NULL UNIQUE,
    client_id BIGINT UNSIGNED NOT NULL,
    project_name VARCHAR(200) NOT NULL,
    short_description TEXT NULL,
    domain VARCHAR(120) NULL,
    project_type ENUM('web','mobile','desktop','ai_ml','data_science','iot','blockchain','cybersecurity','other') NULL,
    priority ENUM('normal','urgent') NOT NULL DEFAULT 'normal',
    status ENUM(
        'draft',
        'requirements_submitted',
        'under_review',
        'quotation_sent',
        'awaiting_advance',
        'advance_paid',
        'in_development',
        'under_client_review',
        'changes_requested',
        'project_completed',
        'awaiting_final_payment',
        'fully_paid',
        'delivered',
        'cancelled'
    ) NOT NULL DEFAULT 'draft',
    deadline DATE NULL,
    assigned_developer_id BIGINT UNSIGNED NULL,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    advance_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    remaining_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_paid DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    payment_status ENUM('unpaid','partially_paid','fully_paid','refunded') NOT NULL DEFAULT 'unpaid',
    progress TINYINT UNSIGNED NOT NULL DEFAULT 0,
    started_at DATETIME NULL,
    completed_at DATETIME NULL,
    delivered_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_projects_client
        FOREIGN KEY (client_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_projects_developer
        FOREIGN KEY (assigned_developer_id) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_projects_client (client_id),
    INDEX idx_projects_status (status),
    INDEX idx_projects_developer (assigned_developer_id),
    INDEX idx_projects_deadline (deadline),
    INDEX idx_projects_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 8. PROJECT MEMBERS
-- =========================================================
CREATE TABLE project_members (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    member_role ENUM('owner','member','viewer') NOT NULL DEFAULT 'member',
    status ENUM('invited','active','removed') NOT NULL DEFAULT 'invited',
    invited_by BIGINT UNSIGNED NULL,
    joined_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_project_member (project_id, user_id),
    INDEX idx_project_members_user (user_id),
    CONSTRAINT fk_project_members_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_project_members_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_project_members_invited_by
        FOREIGN KEY (invited_by) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 9. PROJECT REQUIREMENTS
-- =========================================================
CREATE TABLE project_requirements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    version INT NOT NULL DEFAULT 1,
    description TEXT NULL,
    client_deadline DATE NULL,
    additional_requirements TEXT NULL,
    client_wants_tech_recommendation BOOLEAN NOT NULL DEFAULT FALSE,
    status ENUM('draft','submitted','under_review','approved','revision_required') NOT NULL DEFAULT 'draft',
    submitted_by BIGINT UNSIGNED NULL,
    approved_by BIGINT UNSIGNED NULL,
    submitted_at DATETIME NULL,
    approved_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_requirement_version (project_id, version),
    INDEX idx_requirements_project (project_id),
    INDEX idx_requirements_status (status),
    CONSTRAINT fk_requirements_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_requirements_submitted_by
        FOREIGN KEY (submitted_by) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_requirements_approved_by
        FOREIGN KEY (approved_by) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 10. PROJECT TECHNOLOGIES
-- =========================================================
CREATE TABLE project_technologies (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_requirement_id BIGINT UNSIGNED NOT NULL,
    category ENUM('frontend','backend','database','language','framework','devops','other') NOT NULL,
    technology_name VARCHAR(120) NOT NULL,
    is_client_requested BOOLEAN NOT NULL DEFAULT TRUE,
    recommendation_note TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_technologies_requirement (project_requirement_id),
    CONSTRAINT fk_project_technologies_requirement
        FOREIGN KEY (project_requirement_id) REFERENCES project_requirements(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 11. FUNCTIONAL REQUIREMENTS
-- =========================================================
CREATE TABLE functional_requirements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_requirement_id BIGINT UNSIGNED NOT NULL,
    requirement_code VARCHAR(50) NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    priority ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
    acceptance_criteria TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_functional_requirements_requirement (project_requirement_id),
    CONSTRAINT fk_functional_requirements_requirement
        FOREIGN KEY (project_requirement_id) REFERENCES project_requirements(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 12. AI FEATURES
-- =========================================================
CREATE TABLE project_ai_features (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_requirement_id BIGINT UNSIGNED NOT NULL,
    feature_name VARCHAR(180) NOT NULL,
    description TEXT NULL,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ai_features_requirement (project_requirement_id),
    CONSTRAINT fk_ai_features_requirement
        FOREIGN KEY (project_requirement_id) REFERENCES project_requirements(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 13. PROJECT DESIGN
-- =========================================================
CREATE TABLE project_designs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_requirement_id BIGINT UNSIGNED NOT NULL UNIQUE,
    font_family VARCHAR(120) NULL,
    primary_color VARCHAR(20) NULL,
    secondary_color VARCHAR(20) NULL,
    accent_color VARCHAR(20) NULL,
    background_color VARCHAR(20) NULL,
    text_color VARCHAR(20) NULL,
    design_style ENUM('modern','minimal','professional','corporate','dark','glassmorphism','academic','custom') NULL,
    reference_url VARCHAR(500) NULL,
    custom_instructions TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_project_designs_requirement
        FOREIGN KEY (project_requirement_id) REFERENCES project_requirements(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 14. PROJECT FILES
-- =========================================================
CREATE TABLE project_files (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    uploaded_by BIGINT UNSIGNED NULL,
    name VARCHAR(255) NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    file_url VARCHAR(1000) NULL,
    file_type VARCHAR(120) NULL,
    file_size BIGINT UNSIGNED NULL,
    category ENUM('requirement','design','reference','document','deliverable_support','other') NOT NULL DEFAULT 'other',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_project_files_project (project_id),
    INDEX idx_project_files_category (category),
    CONSTRAINT fk_project_files_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_project_files_uploaded_by
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 15. PROJECT MILESTONES
-- =========================================================
CREATE TABLE project_milestones (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    milestone_key VARCHAR(60) NOT NULL,
    name VARCHAR(150) NOT NULL,
    sequence_no INT NOT NULL,
    status ENUM('pending','in_progress','completed','skipped') NOT NULL DEFAULT 'pending',
    progress TINYINT UNSIGNED NOT NULL DEFAULT 0,
    planned_start DATE NULL,
    planned_end DATE NULL,
    actual_start DATE NULL,
    actual_end DATE NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_milestone_sequence (project_id, sequence_no),
    UNIQUE KEY uq_milestone_key (project_id, milestone_key),
    INDEX idx_milestones_project (project_id),
    CONSTRAINT fk_milestones_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 16. TASKS
-- =========================================================
CREATE TABLE tasks (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    milestone_id BIGINT UNSIGNED NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    assigned_to BIGINT UNSIGNED NULL,
    status ENUM('todo','in_progress','review','completed','cancelled') NOT NULL DEFAULT 'todo',
    priority ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
    estimated_hours DECIMAL(7,2) NULL,
    actual_hours DECIMAL(7,2) NULL,
    due_date DATE NULL,
    completed_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tasks_project (project_id),
    INDEX idx_tasks_milestone (milestone_id),
    INDEX idx_tasks_status (status),
    INDEX idx_tasks_assigned_to (assigned_to),
    CONSTRAINT fk_tasks_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_tasks_milestone
        FOREIGN KEY (milestone_id) REFERENCES project_milestones(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_tasks_assigned_to
        FOREIGN KEY (assigned_to) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 17. QUOTATIONS
-- =========================================================
CREATE TABLE quotations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    quotation_number VARCHAR(60) NOT NULL UNIQUE,
    quotation_type ENUM('initial','change_request','revision') NOT NULL DEFAULT 'initial',
    parent_quotation_id BIGINT UNSIGNED NULL,
    change_request_id BIGINT UNSIGNED NULL,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    referral_discount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    urgent_fee DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    tax DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    advance_percentage DECIMAL(5,2) NOT NULL DEFAULT 40.00,
    advance_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    remaining_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    valid_until DATE NULL,
    notes TEXT NULL,
    terms TEXT NULL,
    status ENUM('draft','sent','accepted','rejected','expired','cancelled') NOT NULL DEFAULT 'draft',
    created_by BIGINT UNSIGNED NOT NULL,
    accepted_by BIGINT UNSIGNED NULL,
    accepted_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_quotations_project (project_id),
    INDEX idx_quotations_status (status),
    CONSTRAINT fk_quotations_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_quotations_parent
        FOREIGN KEY (parent_quotation_id) REFERENCES quotations(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_quotations_created_by
        FOREIGN KEY (created_by) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_quotations_accepted_by
        FOREIGN KEY (accepted_by) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 18. QUOTATION ITEMS
-- =========================================================
CREATE TABLE quotation_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    quotation_id BIGINT UNSIGNED NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    description TEXT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_quotation_items_quotation (quotation_id),
    CONSTRAINT fk_quotation_items_quotation
        FOREIGN KEY (quotation_id) REFERENCES quotations(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 19. CHANGE REQUESTS
-- =========================================================
CREATE TABLE change_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    requested_by BIGINT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    estimated_cost DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    estimated_days INT NOT NULL DEFAULT 0,
    status ENUM('submitted','under_review','quotation_sent','approved','rejected','in_progress','completed','cancelled') NOT NULL DEFAULT 'submitted',
    approved_by BIGINT UNSIGNED NULL,
    approved_at DATETIME NULL,
    completed_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_change_requests_project (project_id),
    INDEX idx_change_requests_status (status),
    CONSTRAINT fk_change_requests_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_change_requests_requested_by
        FOREIGN KEY (requested_by) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_change_requests_approved_by
        FOREIGN KEY (approved_by) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE quotations
    ADD CONSTRAINT fk_quotations_change_request
        FOREIGN KEY (change_request_id) REFERENCES change_requests(id)
        ON DELETE SET NULL ON UPDATE CASCADE;

-- =========================================================
-- 20. PAYMENTS
-- =========================================================
CREATE TABLE payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    client_id BIGINT UNSIGNED NOT NULL,
    quotation_id BIGINT UNSIGNED NULL,
    payment_number VARCHAR(60) NOT NULL UNIQUE,
    payment_type ENUM('advance','milestone','final','change_request','refund') NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    razorpay_order_id VARCHAR(150) NULL UNIQUE,
    razorpay_payment_id VARCHAR(150) NULL UNIQUE,
    razorpay_signature VARCHAR(255) NULL,
    status ENUM('created','pending','paid','failed','refunded','partially_refunded') NOT NULL DEFAULT 'created',
    failure_reason TEXT NULL,
    paid_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_payments_project (project_id),
    INDEX idx_payments_client (client_id),
    INDEX idx_payments_quotation (quotation_id),
    INDEX idx_payments_status (status),
    INDEX idx_payments_type (payment_type),
    CONSTRAINT fk_payments_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_payments_client
        FOREIGN KEY (client_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_payments_quotation
        FOREIGN KEY (quotation_id) REFERENCES quotations(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 21. RECEIPTS
-- =========================================================
CREATE TABLE receipts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    payment_id BIGINT UNSIGNED NOT NULL UNIQUE,
    receipt_number VARCHAR(80) NOT NULL UNIQUE,
    receipt_type ENUM('advance','milestone','final','refund') NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    file_url VARCHAR(1000) NULL,
    storage_key VARCHAR(500) NULL,
    issued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_receipts_payment
        FOREIGN KEY (payment_id) REFERENCES payments(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 22. PAYMENT WEBHOOK EVENTS
-- =========================================================
CREATE TABLE payment_webhook_events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    provider ENUM('razorpay') NOT NULL DEFAULT 'razorpay',
    event_id VARCHAR(190) NOT NULL UNIQUE,
    event_type VARCHAR(120) NOT NULL,
    payload JSON NOT NULL,
    signature VARCHAR(255) NULL,
    status ENUM('received','processed','failed','ignored') NOT NULL DEFAULT 'received',
    processed_at DATETIME NULL,
    error_message TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_webhook_type (event_type),
    INDEX idx_webhook_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 23. PROJECT REVIEWS / APPROVALS
-- =========================================================
CREATE TABLE project_reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    reviewer_id BIGINT UNSIGNED NOT NULL,
    review_type ENUM('preview','final') NOT NULL,
    decision ENUM('approved','changes_requested') NOT NULL,
    comments TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_project_reviews_project (project_id),
    CONSTRAINT fk_project_reviews_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_project_reviews_reviewer
        FOREIGN KEY (reviewer_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 24. GITHUB INTEGRATIONS
-- =========================================================
CREATE TABLE github_integrations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL UNIQUE,
    installation_id VARCHAR(150) NULL,
    repository_id VARCHAR(100) NULL,
    repository_name VARCHAR(200) NULL,
    repository_url VARCHAR(1000) NULL,
    owner VARCHAR(190) NULL,
    default_branch VARCHAR(100) NULL,
    development_branch VARCHAR(100) NULL,
    webhook_id VARCHAR(150) NULL,
    last_commit_sha VARCHAR(100) NULL,
    last_commit_message TEXT NULL,
    last_commit_author VARCHAR(190) NULL,
    last_commit_at DATETIME NULL,
    connected_by BIGINT UNSIGNED NULL,
    connected_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_github_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_github_connected_by
        FOREIGN KEY (connected_by) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 25. DEPLOYMENTS / LIVE PREVIEWS
-- =========================================================
CREATE TABLE deployments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    branch VARCHAR(120) NULL,
    commit_sha VARCHAR(100) NULL,
    environment ENUM('development','staging','production') NOT NULL DEFAULT 'staging',
    deployment_provider VARCHAR(120) NULL,
    deployment_id VARCHAR(250) NULL,
    preview_url VARCHAR(1000) NULL,
    status ENUM('queued','building','ready','failed','stopped') NOT NULL DEFAULT 'queued',
    build_logs_url VARCHAR(1000) NULL,
    started_at DATETIME NULL,
    finished_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_deployments_project (project_id),
    INDEX idx_deployments_status (status),
    CONSTRAINT fk_deployments_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 26. DELIVERABLES
-- =========================================================
CREATE TABLE deliverables (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    uploaded_by BIGINT UNSIGNED NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('source_code','documentation','srs','report','ppt','demo_video','database','apk','exe','other') NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    file_url VARCHAR(1000) NULL,
    file_size BIGINT UNSIGNED NULL,
    version VARCHAR(50) NULL,
    is_final BOOLEAN NOT NULL DEFAULT FALSE,
    requires_full_payment BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_deliverables_project (project_id),
    INDEX idx_deliverables_final (is_final),
    CONSTRAINT fk_deliverables_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_deliverables_uploaded_by
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 27. MESSAGES
-- =========================================================
CREATE TABLE messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT UNSIGNED NOT NULL,
    sender_id BIGINT UNSIGNED NOT NULL,
    receiver_id BIGINT UNSIGNED NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_messages_project_created (project_id, created_at),
    INDEX idx_messages_receiver_read (receiver_id, is_read),
    CONSTRAINT fk_messages_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_messages_sender
        FOREIGN KEY (sender_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_messages_receiver
        FOREIGN KEY (receiver_id) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 28. MESSAGE ATTACHMENTS
-- =========================================================
CREATE TABLE message_attachments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    message_id BIGINT UNSIGNED NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    file_url VARCHAR(1000) NULL,
    file_type VARCHAR(120) NULL,
    file_size BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_message_attachments_message (message_id),
    CONSTRAINT fk_message_attachments_message
        FOREIGN KEY (message_id) REFERENCES messages(id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 29. NOTIFICATIONS
-- =========================================================
CREATE TABLE notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    project_id BIGINT UNSIGNED NULL,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(220) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(1000) NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notifications_user_read (user_id, is_read),
    INDEX idx_notifications_project (project_id),
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_notifications_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 30. AUDIT LOGS
-- =========================================================
CREATE TABLE audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    actor_id BIGINT UNSIGNED NULL,
    project_id BIGINT UNSIGNED NULL,
    action VARCHAR(120) NOT NULL,
    entity_type VARCHAR(100) NULL,
    entity_id BIGINT UNSIGNED NULL,
    description TEXT NULL,
    metadata JSON NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_project_created (project_id, created_at),
    INDEX idx_audit_actor_created (actor_id, created_at),
    INDEX idx_audit_entity (entity_type, entity_id),
    CONSTRAINT fk_audit_actor
        FOREIGN KEY (actor_id) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_audit_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 31. REFERRAL SETTINGS
-- =========================================================
CREATE TABLE referral_settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    discount_type ENUM('fixed','percentage') NOT NULL DEFAULT 'percentage',
    discount_value DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    maximum_discount DECIMAL(12,2) NULL,
    minimum_project_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_referral_settings_updated_by
        FOREIGN KEY (updated_by) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 32. REFERRALS
-- =========================================================
CREATE TABLE referrals (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    referrer_id BIGINT UNSIGNED NOT NULL,
    referred_user_id BIGINT UNSIGNED NOT NULL,
    referral_code VARCHAR(50) NOT NULL,
    project_id BIGINT UNSIGNED NULL,
    discount_type ENUM('fixed','percentage') NULL,
    discount_value DECIMAL(12,2) NULL,
    discount_amount DECIMAL(12,2) NULL DEFAULT 0.00,
    status ENUM('registered','project_created','payment_completed','rewarded','cancelled') NOT NULL DEFAULT 'registered',
    rewarded_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_referral_pair (referrer_id, referred_user_id),
    INDEX idx_referrals_project (project_id),
    INDEX idx_referrals_status (status),
    CONSTRAINT fk_referrals_referrer
        FOREIGN KEY (referrer_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_referrals_referred_user
        FOREIGN KEY (referred_user_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_referrals_project
        FOREIGN KEY (project_id) REFERENCES projects(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 33. SYSTEM SETTINGS
-- =========================================================
CREATE TABLE system_settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(120) NOT NULL UNIQUE,
    setting_value JSON NOT NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_system_settings_updated_by
        FOREIGN KEY (updated_by) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- INITIAL SETTINGS
-- =========================================================
INSERT INTO referral_settings
    (enabled, discount_type, discount_value, maximum_discount, minimum_project_amount)
VALUES
    (TRUE, 'percentage', 10.00, 2000.00, 0.00);

INSERT INTO system_settings (setting_key, setting_value)
VALUES
    ('default_advance_percentage', JSON_OBJECT('value', 40)),
    ('project_currency', JSON_OBJECT('value', 'INR')),
    ('deliverables_require_full_payment', JSON_OBJECT('value', true));
