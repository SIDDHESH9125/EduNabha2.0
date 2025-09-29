#!/usr/bin/env python3
"""
Add sample educational videos to demonstrate the enhanced video database features
"""

from video_database_integration import EduNabhaVideoIntegration

def add_sample_videos():
    # Sample educational videos with different types
    sample_videos = [
        {
            'title': 'Calculus Fundamentals - Derivatives',
            'description': 'Essential calculus concepts for mathematics students',
            'duration': 2700,  # 45 minutes
            'fileSize': 450000000,  # 450MB
            'filePath': '/videos/calculus_derivatives.mp4',
            'quality': '1080p',
            'course': {
                'title': 'Advanced Mathematics',
                'category': 'Mathematics'
            }
        },
        {
            'title': 'Chemistry Lab Assignment - Acid Base Reactions',
            'description': 'Laboratory assignment demonstrating acid-base chemistry principles',
            'duration': 1800,  # 30 minutes
            'fileSize': 320000000,  # 320MB
            'filePath': '/videos/chemistry_lab_assignment.mp4',
            'quality': '720p',
            'course': {
                'title': 'General Chemistry',
                'category': 'Science'
            }
        },
        {
            'title': 'Physics Tutorial - Newtons Laws of Motion',
            'description': 'Step-by-step tutorial explaining Newtons three laws',
            'duration': 2400,  # 40 minutes
            'fileSize': 380000000,  # 380MB
            'filePath': '/videos/physics_newtons_laws.mp4',
            'quality': '1080p',
            'course': {
                'title': 'Physics Mechanics',
                'category': 'Science'
            }
        },
        {
            'title': 'Important: Final Exam Review Session',
            'description': 'Critical review session covering all exam material',
            'duration': 4200,  # 70 minutes
            'fileSize': 680000000,  # 680MB
            'filePath': '/videos/final_exam_review.mp4',
            'quality': '1080p',
            'course': {
                'title': 'Biology Fundamentals',
                'category': 'Science'
            }
        },
        {
            'title': 'English Literature Webinar - Shakespeare Analysis',
            'description': 'Live webinar on analyzing Shakespearean literature',
            'duration': 3600,  # 60 minutes
            'fileSize': 520000000,  # 520MB
            'filePath': '/videos/shakespeare_webinar.mp4',
            'quality': '720p',
            'course': {
                'title': 'English Literature',
                'category': 'Literature'
            }
        },
        {
            'title': 'History Lecture - World War II Timeline',
            'description': 'Comprehensive lecture on WWII events and timeline',
            'duration': 3300,  # 55 minutes
            'fileSize': 480000000,  # 480MB
            'filePath': '/videos/wwii_history_lecture.mp4',
            'quality': '1080p',
            'course': {
                'title': 'Modern History',
                'category': 'History'
            }
        },
        {
            'title': 'Computer Science Project Demo - Web Development',
            'description': 'Student project demonstration of web application development',
            'duration': 1500,  # 25 minutes
            'fileSize': 280000000,  # 280MB
            'filePath': '/videos/web_dev_project_demo.mp4',
            'quality': '720p',
            'course': {
                'title': 'Web Development',
                'category': 'Computer Science'
            }
        },
        {
            'title': 'Difficult Concepts: Quantum Physics Principles',
            'description': 'Advanced quantum physics concepts explained',
            'duration': 4800,  # 80 minutes
            'fileSize': 750000000,  # 750MB
            'filePath': '/videos/quantum_physics_advanced.mp4',
            'quality': '1080p',
            'course': {
                'title': 'Advanced Physics',
                'category': 'Science'
            }
        },
        {
            'title': 'Assignment Solution: Data Structures and Algorithms',
            'description': 'Complete solution walkthrough for programming assignment',
            'duration': 2100,  # 35 minutes
            'fileSize': 350000000,  # 350MB
            'filePath': '/videos/dsa_assignment_solution.mp4',
            'quality': '720p',
            'course': {
                'title': 'Computer Science Fundamentals',
                'category': 'Computer Science'
            }
        }
    ]

    # Add all sample videos
    integration = EduNabhaVideoIntegration()
    print('🎥 Adding sample educational videos...')
    print()

    added_count = 0
    for i, video_data in enumerate(sample_videos, 1):
        try:
            enhanced_video = integration.add_downloaded_video(video_data)
            print(f'✅ Added video {i}: {video_data["title"]}')
            added_count += 1
        except Exception as e:
            print(f'❌ Error adding video {i}: {e}')

    print()
    print(f'🎯 Successfully added {added_count} out of {len(sample_videos)} videos!')
    
    # Show updated statistics
    print()
    print('📊 Updated Database Statistics:')
    stats = integration.get_stats()
    print(f'   Total Videos: {stats.get("total_videos", 0)}')
    print(f'   Storage Used: {stats.get("total_storage_gb", 0):.2f} GB')
    print(f'   Categories: {len(stats.get("videos_by_category", []))}')
    
    print()
    print('📚 Course Progress Overview:')
    progress = integration.get_course_progress()
    for course in progress[:5]:  # Show top 5 courses
        print(f'   {course["course"]}: {course["total_videos"]} videos')
    
    print()
    print('🎯 Study Schedule Overview:')
    schedule = integration.get_study_schedule()
    print(f'   Urgent: {schedule["urgent"]["count"]} videos')
    print(f'   Pending: {schedule["pending"]["count"]} videos')
    print(f'   Review Later: {schedule["review"]["count"]} videos')
    
    integration.close()
    return True

if __name__ == "__main__":
    add_sample_videos()