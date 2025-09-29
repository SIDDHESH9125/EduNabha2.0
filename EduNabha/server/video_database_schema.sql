-- Video Database Schema
-- SQLite database for storing downloaded videos offline

-- Categories table for organizing videos
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Main videos table
CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL UNIQUE,
    file_name TEXT NOT NULL,
    file_size INTEGER, -- Size in bytes
    duration INTEGER, -- Duration in seconds
    format TEXT, -- Video format (mp4, avi, mkv, etc.)
    resolution TEXT, -- Resolution (1080p, 720p, etc.)
    category_id INTEGER,
    download_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_watched DATETIME,
    watch_count INTEGER DEFAULT 0,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5), -- 1-5 star rating
    notes TEXT,
    thumbnail_path TEXT,
    FOREIGN KEY (category_id) REFERENCES categories (id)
);

-- Tags for flexible video organization
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT -- Optional hex color code for UI
);

-- Many-to-many relationship between videos and tags
CREATE TABLE IF NOT EXISTS video_tags (
    video_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY (video_id, tag_id),
    FOREIGN KEY (video_id) REFERENCES videos (id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
);

-- Playlists for organizing videos
CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Many-to-many relationship between playlists and videos
CREATE TABLE IF NOT EXISTS playlist_videos (
    playlist_id INTEGER,
    video_id INTEGER,
    position INTEGER, -- Order in playlist
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (playlist_id, video_id),
    FOREIGN KEY (playlist_id) REFERENCES playlists (id) ON DELETE CASCADE,
    FOREIGN KEY (video_id) REFERENCES videos (id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_videos_title ON videos(title);
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category_id);
CREATE INDEX IF NOT EXISTS idx_videos_download_date ON videos(download_date);
CREATE INDEX IF NOT EXISTS idx_videos_rating ON videos(rating);
CREATE INDEX IF NOT EXISTS idx_video_tags_video ON video_tags(video_id);
CREATE INDEX IF NOT EXISTS idx_video_tags_tag ON video_tags(tag_id);

-- Insert some default categories
INSERT OR IGNORE INTO categories (name, description) VALUES
('Movies', 'Feature films and movies'),
('TV Shows', 'Television series and episodes'),
('Documentaries', 'Educational and documentary content'),
('Music', 'Music videos and concerts'),
('Educational', 'Learning and tutorial content'),
('Entertainment', 'General entertainment content'),
('Sports', 'Sports videos and highlights'),
('Gaming', 'Gaming content and gameplay videos');

-- Insert some common tags
INSERT OR IGNORE INTO tags (name, color) VALUES
('Favorite', '#FFD700'),
('Watch Later', '#87CEEB'),
('Comedy', '#FF69B4'),
('Drama', '#8B0000'),
('Action', '#FF4500'),
('Thriller', '#2F4F4F'),
('Horror', '#800080'),
('Sci-Fi', '#00CED1'),
('Romance', '#FF1493'),
('Adventure', '#228B22');