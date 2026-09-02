-- Core schema for the private osu! server: users, per-mode stats, beatmaps, scores.
CREATE TABLE IF NOT EXISTS users (
    id                INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username          VARCHAR(32)  NOT NULL,
    username_safe     VARCHAR(32)  NOT NULL,
    email             VARCHAR(254) NOT NULL,
    password_bcrypt   CHAR(60)     NOT NULL,
    country           CHAR(2)      NOT NULL DEFAULT 'XX',
    privileges        INT UNSIGNED NOT NULL DEFAULT 1,
    created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    latest_activity   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_username_safe (username_safe),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- One row per (user, mode, relax) so vanilla and relax stats never collide.
CREATE TABLE IF NOT EXISTS stats (
    id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id       INT UNSIGNED NOT NULL,
    mode          TINYINT UNSIGNED NOT NULL, -- 0=osu! 1=taiko 2=catch 3=mania
    relax         BOOLEAN NOT NULL DEFAULT FALSE,
    ranked_score  BIGINT UNSIGNED NOT NULL DEFAULT 0,
    total_score   BIGINT UNSIGNED NOT NULL DEFAULT 0,
    pp            FLOAT NOT NULL DEFAULT 0,
    play_count    INT UNSIGNED NOT NULL DEFAULT 0,
    accuracy      FLOAT NOT NULL DEFAULT 0,
    max_combo     INT UNSIGNED NOT NULL DEFAULT 0,
    global_rank   INT UNSIGNED NOT NULL DEFAULT 0,
    UNIQUE KEY uq_stats_user_mode_relax (user_id, mode, relax),
    KEY idx_stats_leaderboard (mode, relax, pp),
    CONSTRAINT fk_stats_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS beatmaps (
    id           INT UNSIGNED NOT NULL PRIMARY KEY,
    set_id       INT UNSIGNED NOT NULL,
    md5          CHAR(32) NOT NULL,
    artist       VARCHAR(128) NOT NULL,
    title        VARCHAR(128) NOT NULL,
    version      VARCHAR(128) NOT NULL,
    creator      VARCHAR(32) NOT NULL,
    status       TINYINT NOT NULL DEFAULT 0, -- ranked status
    mode         TINYINT UNSIGNED NOT NULL DEFAULT 0,
    star_rating  FLOAT NOT NULL DEFAULT 0,
    UNIQUE KEY uq_beatmaps_md5 (md5),
    KEY idx_beatmaps_set (set_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS scores (
    id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id       INT UNSIGNED NOT NULL,
    beatmap_md5   CHAR(32) NOT NULL,
    mode          TINYINT UNSIGNED NOT NULL,
    relax         BOOLEAN NOT NULL DEFAULT FALSE,
    mods          INT UNSIGNED NOT NULL DEFAULT 0,
    score         BIGINT UNSIGNED NOT NULL,
    pp            FLOAT NOT NULL DEFAULT 0,
    accuracy      FLOAT NOT NULL,
    max_combo     INT UNSIGNED NOT NULL,
    count_300     INT UNSIGNED NOT NULL DEFAULT 0,
    count_100     INT UNSIGNED NOT NULL DEFAULT 0,
    count_50      INT UNSIGNED NOT NULL DEFAULT 0,
    count_miss    INT UNSIGNED NOT NULL DEFAULT 0,
    count_geki    INT UNSIGNED NOT NULL DEFAULT 0,
    count_katu    INT UNSIGNED NOT NULL DEFAULT 0,
    perfect       BOOLEAN NOT NULL DEFAULT FALSE,
    passed        BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_scores_beatmap_leaderboard (beatmap_md5, mode, relax, score),
    KEY idx_scores_user (user_id),
    CONSTRAINT fk_scores_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
