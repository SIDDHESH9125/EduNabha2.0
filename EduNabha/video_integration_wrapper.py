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