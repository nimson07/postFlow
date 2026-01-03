import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

function UserDashboard() {
  const { user, logout } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 10 })
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newPost, setNewPost] = useState({ title: '', content: '' })
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  const [filter, setFilter] = useState('')
  const [stats, setStats] = useState({
    totalPosts: 0,
    pendingPosts: 0,
    approvedPosts: 0,
    rejectedPosts: 0
  })

  useEffect(() => {
    fetchPosts()
    fetchStats()
  }, [pagination.page, filter])

  const fetchStats = async () => {
    try {
      const response = await api.get('/posts', { params: { limit: 1000 } })
      const allPosts = response.data.posts
      setStats({
        totalPosts: allPosts.length,
        pendingPosts: allPosts.filter(p => p.status === 'PENDING').length,
        approvedPosts: allPosts.filter(p => p.status === 'APPROVED').length,
        rejectedPosts: allPosts.filter(p => p.status === 'REJECTED').length
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const params = { ...pagination }
      if (filter) params.status = filter
      
      const response = await api.get('/posts', { params })
      setPosts(response.data.posts)
      setPagination(prev => ({ ...prev, ...response.data.pagination }))
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async (e) => {
    e.preventDefault()
    setCreateError('')
    setCreateSuccess('')

    if (!newPost.title.trim() || !newPost.content.trim()) {
      setCreateError('Title and content are required')
      return
    }

    try {
      await api.post('/posts', newPost)
      setCreateSuccess('Post created successfully!')
      setNewPost({ title: '', content: '' })
      setTimeout(() => {
        setShowCreatePost(false)
        setCreateSuccess('')
        fetchPosts()
        fetchStats()
      }, 1500)
    } catch (error) {
      setCreateError(error.response?.data?.error || 'Failed to create post')
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Welcome, {user.email}</p>
          </div>
          <button 
            onClick={logout}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#FFD9A8] rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-[#FFB366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-2 whitespace-nowrap">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-2 whitespace-nowrap">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingPosts}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-2 whitespace-nowrap">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approvedPosts}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-2 whitespace-nowrap">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejectedPosts}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h2 className="text-2xl font-bold text-gray-900">My Posts</h2>
          <button 
            onClick={() => setShowCreatePost(!showCreatePost)}
            className="px-6 py-2 bg-[#FFB366] hover:bg-[#FFA347] text-white rounded-lg transition-colors duration-200 font-medium"
          >
            {showCreatePost ? 'Cancel' : 'Create Post'}
          </button>
        </div>

        {showCreatePost && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Create New Post</h3>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  required
                  placeholder="Enter post title..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB366] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  required
                  placeholder="Write your post content..."
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB366] focus:border-transparent outline-none resize-y"
                />
              </div>
              {createError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{createError}</div>
              )}
              {createSuccess && (
                <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">{createSuccess}</div>
              )}
              <button 
                type="submit"
                className="px-6 py-2 bg-[#FFB366] hover:bg-[#FFA347] text-white rounded-lg transition-colors duration-200 font-medium"
              >
                Submit Post
              </button>
            </form>
          </div>
        )}

        <div className="mb-6">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB366] focus:border-transparent outline-none min-w-50"
          >
            <option value="">All Posts</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="text-gray-600 text-lg">Loading your posts...</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg mb-6">You haven't created any posts yet.</p>
            <button 
              onClick={() => setShowCreatePost(true)}
              className="px-6 py-2 bg-[#FFB366] hover:bg-[#FFA347] text-white rounded-lg transition-colors duration-200 font-medium"
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex justify-between items-start mb-4 gap-4">
                  <h3 className="text-xl font-semibold text-gray-900 flex-1 wrap-break-word">{post.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase whitespace-nowrap ${getStatusBadge(post.status)}`}>
                    {post.status}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap wrap-break-word">{post.content}</p>
                <div className="flex justify-between text-sm text-gray-500 pt-4 border-t border-gray-200 flex-wrap gap-2">
                  <span>Created: {new Date(post.createdAt).toLocaleDateString()}</span>
                  {post.updatedAt !== post.createdAt && (
                    <span>Updated: {new Date(post.updatedAt).toLocaleDateString()}</span>
                  )}
                </div>
                {post.status === 'REJECTED' && post.rejectionReason && (
                  <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <strong className="block text-red-700 mb-2">Rejection Reason:</strong>
                    <p className="text-gray-700">{post.rejectionReason}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
            >
              Previous
            </button>
            <span className="text-gray-700">Page {pagination.page} of {pagination.totalPages}</span>
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default UserDashboard
