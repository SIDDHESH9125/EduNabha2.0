"""
Video Database Manager
A Python class to manage offline video storage database using SQLite
"""

import sqlite3
import os
import datetime
from typing import List, Dict, Optional, Tuple
import json


class VideoDatabase:
    def __init__(self, db_path: str = "video_database.db"):
        """Initialize the video database connection"""
        self.db_path = db_path
        self.conn = None
        self.connect()
        self.initialize_database()
    
    def connect(self):
        """Establish database connection"""
        try:
            self.conn = sqlite3.connect(self.db_path)
            self.conn.row_factory = sqlite3.Row  # Enable dict-like access to rows
            print(f"Connected to database: {self.db_path}")
        except sqlite3.Error as e:
            print(f"Error connecting to database: {e}")
    
    def initialize_database(self):
        """Initialize database with schema"""
        schema_file = "video_database_schema.sql"
        if os.path.exists(schema_file):
            with open(schema_file, 'r', encoding='utf-8') as f:
                schema = f.read()
            try:
                self.conn.executescript(schema)
                self.conn.commit()
                print("Database initialized successfully")
            except sqlite3.Error as e:
                print(f"Error initializing database: {e}")
        else:
            print(f"Schema file {schema_file} not found. Please ensure it exists.")
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            print("Database connection closed")
    
    # Video Management Methods
    def add_video(self, title: str, file_path: str, **kwargs) -> int:
        """
        Add a new video to the database
        
        Args:
            title: Video title
            file_path: Full path to video file
            **kwargs: Optional fields (description, file_size, duration, format, etc.)
        
        Returns:
            Video ID of the inserted record
        """
        # Extract filename from path
        file_name = os.path.basename(file_path)
        
        # Get file size if not provided
        file_size = kwargs.get('file_size')
        if file_size is None and os.path.exists(file_path):
            file_size = os.path.getsize(file_path)
        
        query = """
        INSERT INTO videos (title, file_path, file_name, description, file_size, 
                          duration, format, resolution, category_id, rating, notes, thumbnail_path)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        
        values = (
            title,
            file_path,
            file_name,
            kwargs.get('description'),
            file_size,
            kwargs.get('duration'),
            kwargs.get('format'),
            kwargs.get('resolution'),
            kwargs.get('category_id'),
            kwargs.get('rating'),
            kwargs.get('notes'),
            kwargs.get('thumbnail_path')
        )
        
        try:
            cursor = self.conn.execute(query, values)
            self.conn.commit()
            video_id = cursor.lastrowid
            print(f"Video '{title}' added successfully with ID: {video_id}")
            return video_id
        except sqlite3.Error as e:
            print(f"Error adding video: {e}")
            return None
    
    def get_video(self, video_id: int) -> Optional[Dict]:
        """Get a video by ID"""
        query = """
        SELECT v.*, c.name as category_name 
        FROM videos v 
        LEFT JOIN categories c ON v.category_id = c.id 
        WHERE v.id = ?
        """
        try:
            cursor = self.conn.execute(query, (video_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
        except sqlite3.Error as e:
            print(f"Error getting video: {e}")
            return None
    
    def search_videos(self, search_term: str = "", category_id: int = None, 
                     tag_name: str = None, rating: int = None) -> List[Dict]:
        """Search videos with various filters"""
        query = """
        SELECT DISTINCT v.*, c.name as category_name 
        FROM videos v 
        LEFT JOIN categories c ON v.category_id = c.id
        LEFT JOIN video_tags vt ON v.id = vt.video_id
        LEFT JOIN tags t ON vt.tag_id = t.id
        WHERE 1=1
        """
        params = []
        
        if search_term:
            query += " AND (v.title LIKE ? OR v.description LIKE ?)"
            params.extend([f"%{search_term}%", f"%{search_term}%"])
        
        if category_id:
            query += " AND v.category_id = ?"
            params.append(category_id)
        
        if tag_name:
            query += " AND t.name = ?"
            params.append(tag_name)
        
        if rating:
            query += " AND v.rating = ?"
            params.append(rating)
        
        query += " ORDER BY v.download_date DESC"
        
        try:
            cursor = self.conn.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]
        except sqlite3.Error as e:
            print(f"Error searching videos: {e}")
            return []
    
    def get_all_videos(self) -> List[Dict]:
        """Get all videos"""
        return self.search_videos()
    
    def update_video(self, video_id: int, **kwargs):
        """Update video information"""
        # Build dynamic update query
        fields = []
        values = []
        
        allowed_fields = ['title', 'description', 'file_path', 'file_name', 
                         'file_size', 'duration', 'format', 'resolution', 
                         'category_id', 'rating', 'notes', 'thumbnail_path']
        
        for field, value in kwargs.items():
            if field in allowed_fields:
                fields.append(f"{field} = ?")
                values.append(value)
        
        if not fields:
            print("No valid fields to update")
            return
        
        values.append(video_id)
        query = f"UPDATE videos SET {', '.join(fields)} WHERE id = ?"
        
        try:
            self.conn.execute(query, values)
            self.conn.commit()
            print(f"Video {video_id} updated successfully")
        except sqlite3.Error as e:
            print(f"Error updating video: {e}")
    
    def delete_video(self, video_id: int):
        """Delete a video from database"""
        try:
            self.conn.execute("DELETE FROM videos WHERE id = ?", (video_id,))
            self.conn.commit()
            print(f"Video {video_id} deleted successfully")
        except sqlite3.Error as e:
            print(f"Error deleting video: {e}")
    
    def update_watch_info(self, video_id: int):
        """Update last watched time and increment watch count"""
        query = """
        UPDATE videos 
        SET last_watched = CURRENT_TIMESTAMP, watch_count = watch_count + 1 
        WHERE id = ?
        """
        try:
            self.conn.execute(query, (video_id,))
            self.conn.commit()
            print(f"Watch info updated for video {video_id}")
        except sqlite3.Error as e:
            print(f"Error updating watch info: {e}")
    
    # Category Management
    def add_category(self, name: str, description: str = None) -> int:
        """Add a new category"""
        try:
            cursor = self.conn.execute(
                "INSERT INTO categories (name, description) VALUES (?, ?)",
                (name, description)
            )
            self.conn.commit()
            return cursor.lastrowid
        except sqlite3.Error as e:
            print(f"Error adding category: {e}")
            return None
    
    def get_categories(self) -> List[Dict]:
        """Get all categories"""
        try:
            cursor = self.conn.execute("SELECT * FROM categories ORDER BY name")
            return [dict(row) for row in cursor.fetchall()]
        except sqlite3.Error as e:
            print(f"Error getting categories: {e}")
            return []
    
    # Tag Management
    def add_tag(self, name: str, color: str = None) -> int:
        """Add a new tag"""
        try:
            cursor = self.conn.execute(
                "INSERT INTO tags (name, color) VALUES (?, ?)",
                (name, color)
            )
            self.conn.commit()
            return cursor.lastrowid
        except sqlite3.Error as e:
            print(f"Error adding tag: {e}")
            return None
    
    def get_tags(self) -> List[Dict]:
        """Get all tags"""
        try:
            cursor = self.conn.execute("SELECT * FROM tags ORDER BY name")
            return [dict(row) for row in cursor.fetchall()]
        except sqlite3.Error as e:
            print(f"Error getting tags: {e}")
            return []
    
    def tag_video(self, video_id: int, tag_id: int):
        """Add a tag to a video"""
        try:
            self.conn.execute(
                "INSERT OR IGNORE INTO video_tags (video_id, tag_id) VALUES (?, ?)",
                (video_id, tag_id)
            )
            self.conn.commit()
            print(f"Tag {tag_id} added to video {video_id}")
        except sqlite3.Error as e:
            print(f"Error tagging video: {e}")
    
    def untag_video(self, video_id: int, tag_id: int):
        """Remove a tag from a video"""
        try:
            self.conn.execute(
                "DELETE FROM video_tags WHERE video_id = ? AND tag_id = ?",
                (video_id, tag_id)
            )
            self.conn.commit()
            print(f"Tag {tag_id} removed from video {video_id}")
        except sqlite3.Error as e:
            print(f"Error removing tag: {e}")
    
    def get_video_tags(self, video_id: int) -> List[Dict]:
        """Get all tags for a video"""
        query = """
        SELECT t.* FROM tags t
        JOIN video_tags vt ON t.id = vt.tag_id
        WHERE vt.video_id = ?
        ORDER BY t.name
        """
        try:
            cursor = self.conn.execute(query, (video_id,))
            return [dict(row) for row in cursor.fetchall()]
        except sqlite3.Error as e:
            print(f"Error getting video tags: {e}")
            return []
    
    # Playlist Management
    def create_playlist(self, name: str, description: str = None) -> int:
        """Create a new playlist"""
        try:
            cursor = self.conn.execute(
                "INSERT INTO playlists (name, description) VALUES (?, ?)",
                (name, description)
            )
            self.conn.commit()
            return cursor.lastrowid
        except sqlite3.Error as e:
            print(f"Error creating playlist: {e}")
            return None
    
    def get_playlists(self) -> List[Dict]:
        """Get all playlists"""
        try:
            cursor = self.conn.execute("SELECT * FROM playlists ORDER BY name")
            return [dict(row) for row in cursor.fetchall()]
        except sqlite3.Error as e:
            print(f"Error getting playlists: {e}")
            return []
    
    def add_to_playlist(self, playlist_id: int, video_id: int, position: int = None):
        """Add video to playlist"""
        if position is None:
            # Get next position
            cursor = self.conn.execute(
                "SELECT MAX(position) FROM playlist_videos WHERE playlist_id = ?",
                (playlist_id,)
            )
            max_pos = cursor.fetchone()[0]
            position = (max_pos or 0) + 1
        
        try:
            self.conn.execute(
                "INSERT OR IGNORE INTO playlist_videos (playlist_id, video_id, position) VALUES (?, ?, ?)",
                (playlist_id, video_id, position)
            )
            self.conn.commit()
            print(f"Video {video_id} added to playlist {playlist_id}")
        except sqlite3.Error as e:
            print(f"Error adding video to playlist: {e}")
    
    def get_playlist_videos(self, playlist_id: int) -> List[Dict]:
        """Get videos in a playlist"""
        query = """
        SELECT v.*, pv.position, pv.added_at
        FROM videos v
        JOIN playlist_videos pv ON v.id = pv.video_id
        WHERE pv.playlist_id = ?
        ORDER BY pv.position
        """
        try:
            cursor = self.conn.execute(query, (playlist_id,))
            return [dict(row) for row in cursor.fetchall()]
        except sqlite3.Error as e:
            print(f"Error getting playlist videos: {e}")
            return []
    
    # Statistics and Reports
    def get_stats(self) -> Dict:
        """Get database statistics"""
        stats = {}
        
        try:
            # Total videos
            cursor = self.conn.execute("SELECT COUNT(*) FROM videos")
            stats['total_videos'] = cursor.fetchone()[0]
            
            # Total storage used
            cursor = self.conn.execute("SELECT SUM(file_size) FROM videos WHERE file_size IS NOT NULL")
            total_size = cursor.fetchone()[0] or 0
            stats['total_storage_bytes'] = total_size
            stats['total_storage_gb'] = round(total_size / (1024**3), 2)
            
            # Videos by category
            cursor = self.conn.execute("""
                SELECT c.name, COUNT(v.id) as count 
                FROM categories c 
                LEFT JOIN videos v ON c.id = v.category_id 
                GROUP BY c.id, c.name
                ORDER BY count DESC
            """)
            stats['videos_by_category'] = [dict(row) for row in cursor.fetchall()]
            
            # Top rated videos
            cursor = self.conn.execute("""
                SELECT title, rating, watch_count 
                FROM videos 
                WHERE rating IS NOT NULL 
                ORDER BY rating DESC, watch_count DESC 
                LIMIT 10
            """)
            stats['top_rated_videos'] = [dict(row) for row in cursor.fetchall()]
            
            # Most watched videos
            cursor = self.conn.execute("""
                SELECT title, watch_count, rating 
                FROM videos 
                ORDER BY watch_count DESC, rating DESC 
                LIMIT 10
            """)
            stats['most_watched_videos'] = [dict(row) for row in cursor.fetchall()]
            
        except sqlite3.Error as e:
            print(f"Error getting statistics: {e}")
        
        return stats
    
    def export_data(self, export_path: str):
        """Export all data to JSON file"""
        data = {
            'videos': self.get_all_videos(),
            'categories': self.get_categories(),
            'tags': self.get_tags(),
            'playlists': self.get_playlists(),
            'stats': self.get_stats()
        }
        
        try:
            with open(export_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, default=str)
            print(f"Data exported to {export_path}")
        except Exception as e:
            print(f"Error exporting data: {e}")
    
    def __enter__(self):
        """Context manager entry"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.close()


# Convenience functions
def create_database(db_path: str = "video_database.db"):
    """Create and initialize a new video database"""
    db = VideoDatabase(db_path)
    db.close()
    print(f"Video database created at: {db_path}")


if __name__ == "__main__":
    # Example usage
    with VideoDatabase() as db:
        print("Video Database Manager initialized successfully!")
        print("\nDatabase Statistics:")
        stats = db.get_stats()
        print(f"Total videos: {stats.get('total_videos', 0)}")
        print(f"Total storage: {stats.get('total_storage_gb', 0)} GB")