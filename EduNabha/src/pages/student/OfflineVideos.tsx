import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getOfflineVideos, getStorageInfo, deleteOfflineVideo, updateVideoProgress } from '../../api/client'
import OfflineVideoPlayer from '../../components/OfflineVideoPlayer'

interface OfflineVideo {
  id: string
  status: string
  downloadedAt: string
  video: {
    id: string
    title: string
    description: string
    duration: number
    fileSize: number
    filePath: string
    quality: string
    course: {
      id: string
      title: string
      category: string
    }
  }
}

interface StorageInfo {
  totalSizeBytes: number
  totalSizeMB: number
  videoCount: number
  downloads: Array<{
    id: string
    title: string
    sizeMB: number
    downloadedAt: string
  }>
}

export default function OfflineVideos() {
  const [offlineVideos, setOfflineVideos] = useState<OfflineVideo[]>([])
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<OfflineVideo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [videos, storage] = await Promise.all([
        getOfflineVideos(),
        getStorageInfo()
      ])
      setOfflineVideos(videos)
      setStorageInfo(storage)
    } catch (err: any) {
      setError(err.message)
      console.error('Error loading offline data:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteVideo(videoId: string) {
    if (!confirm('Are you sure you want to delete this offline video?')) return
    
    try {
      await deleteOfflineVideo(videoId)
      await loadData() // Refresh data
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleVideoProgress(videoId: string, watchTime: number, completed: boolean) {
    try {
      await updateVideoProgress(videoId, watchTime, completed)
    } catch (err: any) {
      console.error('Error updating progress:', err)
    }
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} KB`
    }
    return `${Math.round(bytes / (1024 * 1024))} MB`
  }

  function formatDuration(seconds: number) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading offline videos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/student" className="text-indigo-600 hover:text-indigo-700">
              ← Back to Dashboard
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">📱 Offline Videos</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Storage Info */}
        {storageInfo && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">📊 Storage Usage</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{storageInfo.videoCount}</div>
                <div className="text-sm text-gray-600">Videos Downloaded</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{storageInfo.totalSizeMB} MB</div>
                <div className="text-sm text-gray-600">Storage Used</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {storageInfo.videoCount > 0 ? Math.round(storageInfo.totalSizeMB / storageInfo.videoCount) : 0} MB
                </div>
                <div className="text-sm text-gray-600">Avg. per Video</div>
              </div>
            </div>
          </div>
        )}

        {/* Video List */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Available Offline</h2>
            <p className="text-sm text-gray-600 mt-1">
              These videos are stored locally and can be watched without internet
            </p>
          </div>

          <div className="divide-y">
            {offlineVideos.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Offline Videos</h3>
                <p className="text-gray-600 mb-4">
                  Download videos from your courses to watch them offline
                </p>
                <Link 
                  to="/student" 
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Browse Courses
                </Link>
              </div>
            ) : (
              offlineVideos.map((item) => (
                <div key={item.id} className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Video Thumbnail */}
                    <div className="w-32 h-18 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm relative overflow-hidden">
                      <span className="absolute inset-0 bg-black/20"></span>
                      <div className="relative z-10 text-center">
                        <div className="text-2xl mb-1">🎥</div>
                        <div className="text-xs">{item.video.quality}</div>
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">
                            {item.video.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {item.video.course.title} • {item.video.course.category}
                          </p>
                          {item.video.description && (
                            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                              {item.video.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>⏱️ {formatDuration(item.video.duration)}</span>
                            <span>📦 {formatFileSize(item.video.fileSize)}</span>
                            <span>📡 Downloaded {new Date(item.downloadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => setSelectedVideo(item)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                          >
                            <span>▶️</span>
                            <span className="hidden sm:inline">Watch Offline</span>
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(item.video.id)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete offline video"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Tips for Offline Learning</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Downloaded videos work without internet connection</li>
            <li>• Your progress is saved and will sync when you're online</li>
            <li>• Delete videos you've finished to free up storage space</li>
            <li>• Download videos on Wi-Fi to save mobile data</li>
          </ul>
        </div>
      </div>

      {/* Offline Video Player */}
      {selectedVideo && (
        <OfflineVideoPlayer
          videoId={selectedVideo.video.id}
          title={selectedVideo.video.title}
          filePath={selectedVideo.video.filePath}
          onProgress={(watchTime, completed) => 
            handleVideoProgress(selectedVideo.video.id, watchTime, completed)
          }
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  )
}