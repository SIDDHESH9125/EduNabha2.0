"""
Student Video Manager
Specialized database system for managing educational videos downloaded from student dashboard
"""

from video_database import VideoDatabase
import os
import json
import datetime
from typing import Dict, List, Optional


class StudentVideoManager(VideoDatabase):
    """Extended video database specifically for educational content management"""
    
    def __init__(self, db_path: str = "student_videos.db"):
        super().__init__(db_path)
        self.setup_educational_structure()
    
    def setup_educational_structure(self):
        """Setup educational-specific categories and tags"""
        try:
            # Add educational categories if they don't exist
            educational_categories = [
                ("Lectures", "Recorded lectures and presentations"),
                ("Tutorials", "Step-by-step tutorial videos"), 
                ("Assignments", "Assignment explanations and solutions"),
                ("Lab Sessions", "Laboratory demonstrations and sessions"),
                ("Webinars", "Live recorded webinars and seminars"),
                ("Course Materials", "General course-related video materials"),
                ("Exam Prep", "Examination preparation videos"),
                ("Project Demos", "Project demonstrations and showcases")
            ]
            
            for name, description in educational_categories:
                self.conn.execute(
                    "INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)",
                    (name, description)
                )
            
            # Add educational tags
            educational_tags = [
                ("High Priority", "#FF0000"),
                ("Review Later", "#FFA500"), 
                ("Completed", "#00FF00"),
                ("Important", "#FF69B4"),
                ("Difficult", "#8B0000"),
                ("Quick Review", "#87CEEB"),
                ("Assignment Related", "#9932CC"),
                ("Exam Material", "#FFD700"),
                ("Lab Work", "#00CED1"),
                ("Optional", "#808080")
            ]
            
            for name, color in educational_tags:
                self.conn.execute(
                    "INSERT OR IGNORE INTO tags (name, color) VALUES (?, ?)",
                    (name, color)
                )
            
            self.conn.commit()
            
        except Exception as e:
            print(f"Error setting up educational structure: {e}")
    
    def add_downloaded_video(self, title: str, download_path: str, **kwargs) -> int:
        """
        Add a video downloaded from student dashboard
        
        Args:
            title: Video title from dashboard
            download_path: Path where video was downloaded
            **kwargs: Additional metadata (course, instructor, module, etc.)
        
        Returns:
            Video ID
        """
        # Extract additional educational metadata
        course_name = kwargs.get('course', 'Unknown Course')
        instructor = kwargs.get('instructor', 'Unknown Instructor')
        module = kwargs.get('module', '')
        lecture_number = kwargs.get('lecture_number', '')
        
        # Build comprehensive description
        description_parts = []
        if course_name != 'Unknown Course':
            description_parts.append(f"Course: {course_name}")
        if instructor != 'Unknown Instructor':
            description_parts.append(f"Instructor: {instructor}")
        if module:
            description_parts.append(f"Module: {module}")
        if lecture_number:
            description_parts.append(f"Lecture: {lecture_number}")
        
        description = " | ".join(description_parts) if description_parts else kwargs.get('description', '')
        
        # Auto-detect category based on title/keywords
        category_id = self._detect_category(title, description)
        
        # Get file information if file exists
        file_size = None
        if os.path.exists(download_path):
            file_size = os.path.getsize(download_path)
            
        # Detect format from file extension
        file_format = os.path.splitext(download_path)[1][1:].lower() if download_path else None
        
        video_data = {
            'title': title,
            'file_path': download_path,
            'description': description,
            'file_size': file_size,
            'format': file_format,
            'category_id': category_id or kwargs.get('category_id'),
            'duration': kwargs.get('duration'),
            'resolution': kwargs.get('resolution'),
            'notes': f"Downloaded from student dashboard on {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        }
        
        # Add the video
        video_id = self.add_video(**video_data)
        
        # Auto-tag based on content
        if video_id:
            self._auto_tag_educational_content(video_id, title, description)
        
        return video_id
    
    def _detect_category(self, title: str, description: str) -> Optional[int]:
        """Auto-detect category based on title and description"""
        text = (title + " " + description).lower()
        
        # Get category mappings
        categories = self.get_categories()
        category_map = {cat['name'].lower(): cat['id'] for cat in categories}
        
        # Detection rules
        if any(word in text for word in ['lecture', 'class', 'session']):
            return category_map.get('lectures')
        elif any(word in text for word in ['tutorial', 'how to', 'guide', 'walkthrough']):
            return category_map.get('tutorials')
        elif any(word in text for word in ['assignment', 'homework', 'exercise', 'problem']):
            return category_map.get('assignments')
        elif any(word in text for word in ['lab', 'practical', 'demonstration', 'demo']):
            return category_map.get('lab sessions')
        elif any(word in text for word in ['webinar', 'seminar', 'workshop']):
            return category_map.get('webinars')
        elif any(word in text for word in ['exam', 'test', 'quiz', 'review']):
            return category_map.get('exam prep')
        elif any(word in text for word in ['project', 'presentation', 'showcase']):
            return category_map.get('project demos')
        else:
            return category_map.get('course materials')
    
    def _auto_tag_educational_content(self, video_id: int, title: str, description: str):
        """Automatically tag videos based on educational content"""
        text = (title + " " + description).lower()
        tags = self.get_tags()
        tag_map = {tag['name'].lower(): tag['id'] for tag in tags}
        
        # Auto-tagging rules
        if any(word in text for word in ['important', 'key', 'essential', 'critical']):
            if 'important' in tag_map:
                self.tag_video(video_id, tag_map['important'])
        
        if any(word in text for word in ['assignment', 'homework', 'exercise']):
            if 'assignment related' in tag_map:
                self.tag_video(video_id, tag_map['assignment related'])
        
        if any(word in text for word in ['exam', 'test', 'quiz', 'final', 'midterm']):
            if 'exam material' in tag_map:
                self.tag_video(video_id, tag_map['exam material'])
        
        if any(word in text for word in ['lab', 'practical', 'experiment']):
            if 'lab work' in tag_map:
                self.tag_video(video_id, tag_map['lab work'])
        
        if any(word in text for word in ['difficult', 'advanced', 'complex', 'hard']):
            if 'difficult' in tag_map:
                self.tag_video(video_id, tag_map['difficult'])
        
        if any(word in text for word in ['optional', 'extra', 'bonus', 'additional']):
            if 'optional' in tag_map:
                self.tag_video(video_id, tag_map['optional'])
    
    def create_course_playlist(self, course_name: str, description: str = None) -> int:
        """Create a playlist for a specific course"""
        playlist_description = description or f"All videos for {course_name}"
        return self.create_playlist(course_name, playlist_description)
    
    def add_to_course_playlist(self, course_name: str, video_id: int):
        """Add video to course-specific playlist"""
        # Find or create course playlist
        playlists = self.get_playlists()
        course_playlist = next((p for p in playlists if p['name'].lower() == course_name.lower()), None)
        
        if not course_playlist:
            playlist_id = self.create_course_playlist(course_name)
        else:
            playlist_id = course_playlist['id']
        
        self.add_to_playlist(playlist_id, video_id)
    
    def get_videos_by_course(self, course_name: str) -> List[Dict]:
        """Get all videos for a specific course"""
        return self.search_videos(search_term=course_name)
    
    def get_pending_videos(self) -> List[Dict]:
        """Get videos that haven't been watched yet"""
        query = """
        SELECT v.*, c.name as category_name 
        FROM videos v 
        LEFT JOIN categories c ON v.category_id = c.id 
        WHERE v.watch_count = 0 
        ORDER BY v.download_date DESC
        """
        try:
            cursor = self.conn.execute(query)
            return [dict(row) for row in cursor.fetchall()]
        except Exception as e:
            print(f"Error getting pending videos: {e}")
            return []
    
    def get_high_priority_videos(self) -> List[Dict]:
        """Get videos tagged as high priority"""
        return self.search_videos(tag_name="High Priority")
    
    def mark_as_completed(self, video_id: int):
        """Mark a video as completed"""
        # Update watch info
        self.update_watch_info(video_id)
        
        # Add completed tag
        tags = self.get_tags()
        completed_tag = next((t for t in tags if t['name'] == 'Completed'), None)
        if completed_tag:
            self.tag_video(video_id, completed_tag['id'])
        
        # Remove 'Review Later' tag if present
        review_tag = next((t for t in tags if t['name'] == 'Review Later'), None)
        if review_tag:
            self.untag_video(video_id, review_tag['id'])
    
    def mark_for_review(self, video_id: int):
        """Mark a video for later review"""
        tags = self.get_tags()
        review_tag = next((t for t in tags if t['name'] == 'Review Later'), None)
        if review_tag:
            self.tag_video(video_id, review_tag['id'])
    
    def get_study_schedule(self) -> Dict:
        """Generate study schedule based on video data"""
        pending = self.get_pending_videos()
        high_priority = self.get_high_priority_videos()
        review_later = self.search_videos(tag_name="Review Later")
        
        # Calculate total study time (assuming average 45 min per video)
        def estimate_duration(videos):
            total_seconds = sum(v.get('duration', 2700) for v in videos)  # 45 min default
            return total_seconds // 60  # minutes
        
        schedule = {
            'urgent': {
                'videos': high_priority,
                'count': len(high_priority),
                'estimated_minutes': estimate_duration(high_priority)
            },
            'pending': {
                'videos': pending[:10],  # Next 10 pending
                'count': len(pending),
                'estimated_minutes': estimate_duration(pending)
            },
            'review': {
                'videos': review_later,
                'count': len(review_later),
                'estimated_minutes': estimate_duration(review_later)
            }
        }
        
        return schedule
    
    def get_course_progress(self) -> Dict:
        """Get progress statistics by course"""
        query = """
        SELECT 
            CASE 
                WHEN description LIKE 'Course:%' 
                THEN TRIM(SUBSTR(description, 8, INSTR(description||'|', '|') - 8))
                ELSE 'Unknown Course'
            END as course,
            COUNT(*) as total_videos,
            SUM(CASE WHEN watch_count > 0 THEN 1 ELSE 0 END) as watched_videos,
            AVG(rating) as avg_rating
        FROM videos 
        WHERE description != ''
        GROUP BY course
        ORDER BY total_videos DESC
        """
        
        try:
            cursor = self.conn.execute(query)
            results = []
            for row in cursor.fetchall():
                course_data = dict(row)
                total = course_data['total_videos']
                watched = course_data['watched_videos']
                course_data['completion_percentage'] = round((watched / total) * 100, 1) if total > 0 else 0
                course_data['avg_rating'] = round(course_data['avg_rating'] or 0, 1)
                results.append(course_data)
            return results
        except Exception as e:
            print(f"Error getting course progress: {e}")
            return []
    
    def export_study_report(self, filename: str = None):
        """Export detailed study report"""
        if not filename:
            filename = f"study_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        report = {
            'generated_at': datetime.datetime.now().isoformat(),
            'summary': self.get_stats(),
            'course_progress': self.get_course_progress(),
            'study_schedule': self.get_study_schedule(),
            'videos_by_category': self.get_stats()['videos_by_category'],
            'pending_videos': len(self.get_pending_videos()),
            'completed_videos': len(self.search_videos(tag_name="Completed"))
        }
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2, default=str)
            print(f"Study report exported to {filename}")
        except Exception as e:
            print(f"Error exporting study report: {e}")


# Convenience function for quick setup
def setup_student_database(db_path: str = "student_videos.db"):
    """Quick setup for student video database"""
    print("Setting up Student Video Database...")
    db = StudentVideoManager(db_path)
    print(f"✓ Database created: {db_path}")
    print("✓ Educational categories added")
    print("✓ Educational tags configured") 
    print("✓ Ready to manage your student videos!")
    db.close()
    return db_path


if __name__ == "__main__":
    # Demo the student video manager
    with StudentVideoManager() as db:
        print("Student Video Manager Demo")
        print("=" * 30)
        
        # Show study schedule
        schedule = db.get_study_schedule()
        print(f"\n📚 Study Schedule:")
        print(f"Urgent videos: {schedule['urgent']['count']}")
        print(f"Pending videos: {schedule['pending']['count']}")
        print(f"Review videos: {schedule['review']['count']}")
        
        # Show course progress
        progress = db.get_course_progress()
        if progress:
            print(f"\n📊 Course Progress:")
            for course in progress:
                print(f"{course['course']}: {course['completion_percentage']}% complete ({course['watched_videos']}/{course['total_videos']})")