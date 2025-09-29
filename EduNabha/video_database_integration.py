"""
Video Database Integration for EduNabha Student Dashboard
Connects your existing React frontend with enhanced offline video management
"""

import sqlite3
import json
import os
import shutil
from datetime import datetime
from pathlib import Path
from student_video_manager import StudentVideoManager


class EduNabhaVideoIntegration:
    """Integration layer between your React app and the video database"""
    
    def __init__(self, db_path: str = "edunabha_videos.db", upload_dir: str = None):
        self.db = StudentVideoManager(db_path)
        self.upload_dir = upload_dir or r"C:\nabha\edunabha\server\uploads\videos"
        self.ensure_upload_directory()
    
    def ensure_upload_directory(self):
        """Ensure upload directory exists"""
        Path(self.upload_dir).mkdir(parents=True, exist_ok=True)
    
    def add_downloaded_video(self, video_data: dict) -> dict:
        """
        Add a video downloaded from your student dashboard
        
        Args:
            video_data: Video information from your React app
        
        Returns:
            Enhanced video record with database ID
        """
        # Extract data from your current video format
        title = video_data.get('title', 'Untitled Video')
        course_title = video_data.get('course', {}).get('title', 'Unknown Course')
        category = video_data.get('course', {}).get('category', 'General')
        duration = video_data.get('duration', 0)
        file_size = video_data.get('fileSize', 0)
        file_path = video_data.get('filePath', '')
        quality = video_data.get('quality', 'HD')
        description = video_data.get('description', '')
        
        # Convert file path to absolute path if relative
        if file_path and not os.path.isabs(file_path):
            file_path = os.path.join(self.upload_dir, file_path.lstrip('/'))
        
        # Add to enhanced database
        video_id = self.db.add_downloaded_video(
            title=title,
            download_path=file_path,
            course=course_title,
            description=description,
            duration=duration,
            format=os.path.splitext(file_path)[1][1:] if file_path else 'mp4',
            resolution=quality,
            file_size=file_size
        )
        
        # Auto-create course playlist
        if course_title != 'Unknown Course':
            self.db.add_to_course_playlist(course_title, video_id)
        
        # Return enhanced data for your React app
        enhanced_video = self.db.get_video(video_id)
        if enhanced_video:
            return self.format_for_react(enhanced_video)
        
        return video_data
    
    def get_offline_videos_for_react(self) -> list:
        """Get offline videos in the format your React app expects"""
        videos = self.db.get_all_videos()
        return [self.format_for_react(video) for video in videos]
    
    def format_for_react(self, db_video: dict) -> dict:
        """Convert database video format to your React app format"""
        # Extract course name from description
        course_name = "Unknown Course"
        if db_video.get('description'):
            parts = db_video['description'].split(' | ')
            for part in parts:
                if part.startswith('Course: '):
                    course_name = part.replace('Course: ', '')
                    break
        
        return {
            'id': str(db_video['id']),
            'status': 'completed',
            'downloadedAt': db_video.get('download_date', datetime.now().isoformat()),
            'video': {
                'id': str(db_video['id']),
                'title': db_video['title'],
                'description': db_video.get('description', ''),
                'duration': db_video.get('duration', 0) or 0,
                'fileSize': db_video.get('file_size', 0) or 0,
                'filePath': db_video.get('file_path', '').replace(self.upload_dir, '') if db_video.get('file_path') else '',
                'quality': db_video.get('resolution', 'HD'),
                'course': {
                    'id': '1',  # You can enhance this with actual course IDs
                    'title': course_name,
                    'category': db_video.get('category_name', 'General')
                },
                'watchCount': db_video.get('watch_count', 0),
                'lastWatched': db_video.get('last_watched'),
                'rating': db_video.get('rating'),
                'tags': self.db.get_video_tags(db_video['id'])
            }
        }
    
    def update_video_progress(self, video_id: str, watch_time: int, completed: bool) -> dict:
        """Update video progress (enhanced version of your current function)"""
        try:
            video_id_int = int(video_id)
            
            # Update watch info
            self.db.update_watch_info(video_id_int)
            
            # Mark as completed if needed
            if completed:
                self.db.mark_as_completed(video_id_int)
            
            # Get updated video
            updated_video = self.db.get_video(video_id_int)
            if updated_video:
                return {
                    'success': True,
                    'video': self.format_for_react(updated_video),
                    'watchTime': watch_time,
                    'completed': completed
                }
            
            return {'success': False, 'error': 'Video not found'}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def get_storage_info_enhanced(self) -> dict:
        """Enhanced storage info with additional statistics"""
        stats = self.db.get_stats()
        videos = self.db.get_all_videos()
        
        downloads = []
        for video in videos:
            downloads.append({
                'id': str(video['id']),
                'title': video['title'],
                'sizeMB': round((video.get('file_size') or 0) / (1024 * 1024), 1),
                'downloadedAt': video.get('download_date', datetime.now().isoformat())
            })
        
        return {
            'totalSizeBytes': stats.get('total_storage_bytes', 0),
            'totalSizeMB': stats.get('total_storage_gb', 0) * 1024,  # Convert GB to MB
            'videoCount': stats.get('total_videos', 0),
            'downloads': downloads,
            'courseBreakdown': stats.get('videos_by_category', []),
            'pendingVideos': len(self.db.get_pending_videos()),
            'completedVideos': len(self.db.search_videos(tag_name="Completed")),
            'studySchedule': self.db.get_study_schedule()
        }
    
    def delete_video_enhanced(self, video_id: str) -> dict:
        """Enhanced video deletion with file cleanup"""
        try:
            video_id_int = int(video_id)
            
            # Get video info before deletion
            video = self.db.get_video(video_id_int)
            if not video:
                return {'success': False, 'error': 'Video not found'}
            
            # Delete physical file if it exists
            file_path = video.get('file_path')
            if file_path and os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception as e:
                    print(f"Warning: Could not delete file {file_path}: {e}")
            
            # Delete from database
            self.db.delete_video(video_id_int)
            
            return {
                'success': True,
                'message': f"Video '{video['title']}' deleted successfully",
                'deletedVideo': self.format_for_react(video)
            }
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def get_study_dashboard(self) -> dict:
        """Get comprehensive study dashboard data"""
        schedule = self.db.get_study_schedule()
        progress = self.db.get_course_progress()
        stats = self.db.get_stats()
        
        return {
            'summary': {
                'totalVideos': stats.get('total_videos', 0),
                'completedVideos': len(self.db.search_videos(tag_name="Completed")),
                'pendingVideos': len(self.db.get_pending_videos()),
                'totalWatchTime': sum(v.get('duration', 0) for v in self.db.get_all_videos() if v.get('watch_count', 0) > 0),
                'storageUsed': stats.get('total_storage_gb', 0)
            },
            'studySchedule': schedule,
            'courseProgress': progress,
            'recentVideos': self.db.get_all_videos()[:5],  # Last 5 videos
            'highPriority': self.db.get_high_priority_videos()
        }
    
    def search_videos_enhanced(self, query: str = "", filters: dict = None) -> list:
        """Enhanced video search with multiple filters"""
        filters = filters or {}
        
        results = self.db.search_videos(
            search_term=query,
            category_id=filters.get('category_id'),
            tag_name=filters.get('tag'),
            rating=filters.get('rating')
        )
        
        return [self.format_for_react(video) for video in results]
    
    def export_study_data(self, format: str = 'json') -> str:
        """Export study data for backup/analysis"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        if format == 'json':
            filename = f"edunabha_study_export_{timestamp}.json"
            self.db.export_study_report(filename)
            return filename
        
        # Could add other formats like CSV, PDF etc.
        return None
    
    def get_recommendations(self) -> dict:
        """Get personalized study recommendations"""
        pending = self.db.get_pending_videos()
        high_priority = self.db.get_high_priority_videos()
        course_progress = self.db.get_course_progress()
        
        recommendations = {
            'nextToWatch': pending[:3] if pending else [],
            'urgent': high_priority[:3] if high_priority else [],
            'courseToFocus': None,
            'studyTips': []
        }
        
        # Find course with lowest completion rate
        if course_progress:
            lowest_progress = min(course_progress, key=lambda x: x['completion_percentage'])
            if lowest_progress['completion_percentage'] < 80:
                recommendations['courseToFocus'] = lowest_progress
        
        # Generate study tips
        tips = []
        if len(pending) > 10:
            tips.append("You have many unwatched videos. Consider setting a daily viewing goal.")
        if len(high_priority) > 0:
            tips.append("You have high priority videos waiting. These might be exam-related!")
        if any(c['completion_percentage'] < 50 for c in course_progress):
            tips.append("Some courses need attention. Focus on completing one course at a time.")
        
        recommendations['studyTips'] = tips
        
        return recommendations
    
    def close(self):
        """Close database connection"""
        self.db.close()


# Flask/Express.js integration helpers
class APIHelpers:
    """Helper functions for integrating with your Node.js backend"""
    
    @staticmethod
    def create_api_endpoints_sample():
        """Sample code for your Node.js backend integration"""
        return '''
// Add this to your index.js server file

const { spawn } = require('child_process');
const path = require('path');

// Enhanced video database integration
app.post('/api/videos/:id/enhance', async (req, res) => {
  try {
    const videoId = req.params.id;
    const videoData = req.body;
    
    // Call Python integration
    const python = spawn('python', [
      path.join(__dirname, '../video_integration_wrapper.py'),
      'add_video',
      JSON.stringify(videoData)
    ]);
    
    let result = '';
    python.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    python.on('close', (code) => {
      if (code === 0) {
        res.json(JSON.parse(result));
      } else {
        res.status(500).json({ error: 'Failed to enhance video data' });
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enhanced storage info
app.get('/api/storage/enhanced', async (req, res) => {
  try {
    // Call Python integration for enhanced stats
    const python = spawn('python', [
      path.join(__dirname, '../video_integration_wrapper.py'),
      'get_storage_info'
    ]);
    
    let result = '';
    python.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    python.on('close', (code) => {
      if (code === 0) {
        res.json(JSON.parse(result));
      } else {
        res.status(500).json({ error: 'Failed to get enhanced storage info' });
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Study dashboard
app.get('/api/study/dashboard', async (req, res) => {
  try {
    const python = spawn('python', [
      path.join(__dirname, '../video_integration_wrapper.py'),
      'get_study_dashboard'
    ]);
    
    let result = '';
    python.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    python.on('close', (code) => {
      if (code === 0) {
        res.json(JSON.parse(result));
      } else {
        res.status(500).json({ error: 'Failed to get study dashboard' });
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
        '''
    
    @staticmethod
    def create_wrapper_script():
        """Create Python wrapper script for Node.js integration"""
        return '''
#!/usr/bin/env python3
"""
Wrapper script for Node.js to Python integration
Usage: python video_integration_wrapper.py <command> [json_data]
"""

import sys
import json
from video_database_integration import EduNabhaVideoIntegration

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No command provided"}))
        sys.exit(1)
    
    command = sys.argv[1]
    integration = EduNabhaVideoIntegration()
    
    try:
        if command == 'add_video':
            video_data = json.loads(sys.argv[2])
            result = integration.add_downloaded_video(video_data)
            print(json.dumps(result))
        
        elif command == 'get_offline_videos':
            result = integration.get_offline_videos_for_react()
            print(json.dumps(result))
        
        elif command == 'get_storage_info':
            result = integration.get_storage_info_enhanced()
            print(json.dumps(result))
        
        elif command == 'update_progress':
            data = json.loads(sys.argv[2])
            result = integration.update_video_progress(
                data['videoId'], data['watchTime'], data['completed']
            )
            print(json.dumps(result))
        
        elif command == 'delete_video':
            video_id = sys.argv[2]
            result = integration.delete_video_enhanced(video_id)
            print(json.dumps(result))
        
        elif command == 'get_study_dashboard':
            result = integration.get_study_dashboard()
            print(json.dumps(result))
        
        elif command == 'search_videos':
            data = json.loads(sys.argv[2])
            result = integration.search_videos_enhanced(
                data.get('query', ''), data.get('filters', {})
            )
            print(json.dumps(result))
        
        elif command == 'get_recommendations':
            result = integration.get_recommendations()
            print(json.dumps(result))
        
        else:
            print(json.dumps({"error": f"Unknown command: {command}"}))
            sys.exit(1)
    
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
    
    finally:
        integration.close()

if __name__ == '__main__':
    main()
        '''


if __name__ == "__main__":
    # Demo the integration
    integration = EduNabhaVideoIntegration()
    
    print("EduNabha Video Database Integration")
    print("=" * 40)
    
    # Sample video data (as it would come from your React app)
    sample_video = {
        'title': 'Introduction to Python Programming',
        'description': 'Learn Python basics in this comprehensive tutorial',
        'duration': 3600,  # 1 hour
        'fileSize': 524288000,  # 500MB
        'filePath': '/videos/python_intro.mp4',
        'quality': '1080p',
        'course': {
            'title': 'Computer Science Fundamentals',
            'category': 'Programming'
        }
    }
    
    # Add video to enhanced database
    enhanced_video = integration.add_downloaded_video(sample_video)
    print(f"Added video: {enhanced_video['video']['title']}")
    
    # Get study dashboard
    dashboard = integration.get_study_dashboard()
    print(f"\\nStudy Dashboard:")
    print(f"Total Videos: {dashboard['summary']['totalVideos']}")
    print(f"Completed: {dashboard['summary']['completedVideos']}")
    print(f"Pending: {dashboard['summary']['pendingVideos']}")
    
    # Get recommendations
    recommendations = integration.get_recommendations()
    print(f"\\nRecommendations:")
    print(f"Next to watch: {len(recommendations['nextToWatch'])} videos")
    print(f"Study tips: {len(recommendations['studyTips'])} tips")
    
    integration.close()