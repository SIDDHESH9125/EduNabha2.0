import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface StudyDashboardData {
  summary: {
    totalVideos: number
    completedVideos: number
    pendingVideos: number
    totalWatchTime: number
    storageUsed: number
  }
  studySchedule: {
    urgent: {
      videos: any[]
      count: number
      estimated_minutes: number
    }
    pending: {
      videos: any[]
      count: number
      estimated_minutes: number
    }
    review: {
      videos: any[]
      count: number
      estimated_minutes: number
    }
  }
  courseProgress: Array<{
    course: string
    total_videos: number
    watched_videos: number
    completion_percentage: number
    avg_rating: number
  }>
  recentVideos: any[]
  highPriority: any[]
}

interface Recommendations {
  nextToWatch: any[]
  urgent: any[]
  courseToFocus: any
  studyTips: string[]
}

export default function StudyDashboard() {
  const [dashboardData, setDashboardData] = useState<StudyDashboardData | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      setLoading(true)
      
      // Call your enhanced API endpoints
      const [dashboardResponse, recommendationsResponse] = await Promise.all([
        fetch('/api/study/dashboard'),
        fetch('/api/study/recommendations')
      ])

      if (dashboardResponse.ok) {
        const dashboard = await dashboardResponse.json()
        setDashboardData(dashboard)
      }

      if (recommendationsResponse.ok) {
        const recs = await recommendationsResponse.json()
        setRecommendations(recs)
      }

    } catch (err: any) {
      setError(err.message)
      console.error('Error loading dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  function formatTime(minutes: number): string {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  function formatWatchTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your study dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/student" className="text-indigo-600 hover:text-indigo-700">
              ← Back to Dashboard
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">📚 Study Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link 
              to="/student/offline-videos" 
              className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200"
            >
              📱 Offline Videos
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Summary Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">🎥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Videos</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.summary.totalVideos}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{dashboardData.summary.completedVideos}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <span className="text-2xl">⏳</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{dashboardData.summary.pendingVideos}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">⏱️</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Watch Time</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatWatchTime(dashboardData.summary.totalWatchTime)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <span className="text-2xl">💾</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Storage</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {dashboardData.summary.storageUsed.toFixed(1)} GB
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Study Schedule */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">📅 Study Schedule</h2>
                <p className="text-sm text-gray-600 mt-1">Organized by priority and status</p>
              </div>
              
              {dashboardData?.studySchedule && (
                <div className="p-6 space-y-6">
                  {/* Urgent Videos */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-red-500 text-lg">🚨</span>
                      <h3 className="font-medium text-gray-900">Urgent ({dashboardData.studySchedule.urgent.count})</h3>
                      <span className="text-sm text-gray-500">
                        ~{formatTime(dashboardData.studySchedule.urgent.estimated_minutes)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {dashboardData.studySchedule.urgent.videos.slice(0, 3).map((video: any) => (
                        <div key={video.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-900">{video.title}</span>
                          <span className="text-xs text-gray-500 ml-auto">{video.category_name}</span>
                        </div>
                      ))}
                      {dashboardData.studySchedule.urgent.count > 3 && (
                        <p className="text-sm text-gray-500 text-center">
                          +{dashboardData.studySchedule.urgent.count - 3} more urgent videos
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Pending Videos */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-yellow-500 text-lg">📋</span>
                      <h3 className="font-medium text-gray-900">Up Next ({dashboardData.studySchedule.pending.count})</h3>
                      <span className="text-sm text-gray-500">
                        ~{formatTime(dashboardData.studySchedule.pending.estimated_minutes)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {dashboardData.studySchedule.pending.videos.slice(0, 5).map((video: any) => (
                        <div key={video.id} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-900">{video.title}</span>
                          <span className="text-xs text-gray-500 ml-auto">{video.category_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Review Videos */}
                  {dashboardData.studySchedule.review.count > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-blue-500 text-lg">🔄</span>
                        <h3 className="font-medium text-gray-900">Review Later ({dashboardData.studySchedule.review.count})</h3>
                        <span className="text-sm text-gray-500">
                          ~{formatTime(dashboardData.studySchedule.review.estimated_minutes)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {dashboardData.studySchedule.review.videos.slice(0, 3).map((video: any) => (
                          <div key={video.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-900">{video.title}</span>
                            <span className="text-xs text-gray-500 ml-auto">{video.category_name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Course Progress */}
            <div className="bg-white rounded-xl shadow-sm border mt-6">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">📊 Course Progress</h2>
                <p className="text-sm text-gray-600 mt-1">Track your completion by course</p>
              </div>
              
              {dashboardData?.courseProgress && (
                <div className="p-6 space-y-4">
                  {dashboardData.courseProgress.slice(0, 5).map((course) => (
                    <div key={course.course} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">{course.course}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{course.watched_videos}/{course.total_videos}</span>
                          <span className="font-medium">{course.completion_percentage}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            course.completion_percentage >= 80 ? 'bg-green-600' :
                            course.completion_percentage >= 60 ? 'bg-blue-600' :
                            course.completion_percentage >= 40 ? 'bg-yellow-600' :
                            'bg-red-600'
                          }`}
                          style={{ width: `${course.completion_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recommendations Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">⚡ Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <Link 
                  to="/student/offline-videos"
                  className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <span className="text-green-600 text-lg">📱</span>
                  <span className="font-medium text-gray-900">Watch Offline</span>
                </Link>
                <button className="w-full flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <span className="text-blue-600 text-lg">📥</span>
                  <span className="font-medium text-gray-900">Download More</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <span className="text-purple-600 text-lg">📊</span>
                  <span className="font-medium text-gray-900">Export Progress</span>
                </button>
              </div>
            </div>

            {/* Study Tips */}
            {recommendations?.studyTips && recommendations.studyTips.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">💡 Study Tips</h2>
                </div>
                <div className="p-6 space-y-3">
                  {recommendations.studyTips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <span className="text-yellow-600 text-lg">💡</span>
                      <p className="text-sm text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course to Focus */}
            {recommendations?.courseToFocus && (
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">🎯 Focus Area</h2>
                </div>
                <div className="p-6">
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">
                      {recommendations.courseToFocus.course}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Only {recommendations.courseToFocus.completion_percentage}% complete
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-orange-600 rounded-full"
                        style={{ width: `${recommendations.courseToFocus.completion_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}