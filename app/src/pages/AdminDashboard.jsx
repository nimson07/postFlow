import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

function AdminDashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 10 })
  const [filters, setFilters] = useState({ search: '', status: '', role: '' })
  
  // Create user form
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [newUser, setNewUser] = useState({ email: '', name: '', role: 'USER' })
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  
  // Reject modal
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [stats, setStats] = useState({
    totalPosts: 0,
    pendingPosts: 0,
    approvedPosts: 0,
    rejectedPosts: 0,
    totalUsers: 0
  })

  useEffect(() => {
    fetchStats()
    if (activeTab === 'users') {
      fetchUsers()
    } else {
      fetchPosts()
    }
  }, [activeTab, pagination.page, filters])

  const fetchStats = async () => {
    try {
      const [postsRes, usersRes] = await Promise.all([
        api.get('/posts', { params: { limit: 1000 } }),
        api.get('/users', { params: { limit: 1000 } })
      ])
      
      const allPosts = postsRes.data.posts
      setStats({
        totalPosts: allPosts.length,
        pendingPosts: allPosts.filter(p => p.status === 'PENDING').length,
        approvedPosts: allPosts.filter(p => p.status === 'APPROVED').length,
        rejectedPosts: allPosts.filter(p => p.status === 'REJECTED').length,
        totalUsers: usersRes.data.pagination.total
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await api.get('/users', {
        params: { ...pagination, ...filters }
      })
      setUsers(response.data.users)
      setPagination(prev => ({ ...prev, ...response.data.pagination }))
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const response = await api.get('/posts', {
        params: { ...pagination, ...filters }
      })
      setPosts(response.data.posts)
      setPagination(prev => ({ ...prev, ...response.data.pagination }))
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setCreateError('')
    setCreateSuccess('')
    
    try {
      await api.post('/users', newUser)
      setCreateSuccess('User created successfully! They can now login and set their password.')
      setNewUser({ email: '', name: '', role: 'USER' })
      setTimeout(() => {
        setShowCreateUser(false)
        setCreateSuccess('')
        fetchUsers()
      }, 2000)
    } catch (error) {
      setCreateError(error.response?.data?.error || 'Failed to create user')
    }
  }

  const handleApprovePost = async (postId) => {
    try {
      await api.patch(`/posts/${postId}/status`, { status: 'APPROVED' })
      fetchPosts()
      fetchStats()
    } catch (error) {
      console.error('Failed to approve post:', error)
    }
  }

  const handleRejectPost = async () => {
    if (!rejectionReason.trim()) {
      return
    }
    
    try {
      await api.patch(`/posts/${selectedPost.id}/status`, { 
        status: 'REJECTED', 
        rejectionReason: rejectionReason 
      })
      setShowRejectModal(false)
      setSelectedPost(null)
      setRejectionReason('')
      fetchPosts()
      fetchStats()
    } catch (error) {
      console.error('Failed to reject post:', error)
    }
  }

  const openRejectModal = (post) => {
    setSelectedPost(post)
    setShowRejectModal(true)
  }

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-2 whitespace-nowrap">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
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

      <div className="flex border-b border-gray-200 bg-white">
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'users' 
              ? 'text-purple-600 border-b-2 border-purple-600' 
              : 'text-gray-600 hover:text-purple-600'
          }`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'posts' 
              ? 'text-purple-600 border-b-2 border-purple-600' 
              : 'text-gray-600 hover:text-purple-600'
          }`}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'users' ? (
          <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Manage Users</h2>
              <button 
                onClick={() => setShowCreateUser(!showCreateUser)}
                className="px-6 py-2 bg-[#FFB366] hover:bg-[#FFA347] text-white rounded-lg transition-colors duration-200 font-medium"
              >
                {showCreateUser ? 'Cancel' : 'Create User'}
              </button>
            </div>

            {showCreateUser && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Create New User</h3>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB366] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB366] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB366] focus:border-transparent outline-none"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                  {createError && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{createError}</div>}
                  {createSuccess && <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">{createSuccess}</div>}
                  <button type="submit" className="px-6 py-2 bg-[#FFB366] hover:bg-[#FFA347] text-white rounded-lg transition-colors duration-200 font-medium">Create User</button>
                </form>
              </div>
            )}

            <div className="flex gap-3 mb-6 flex-wrap">
              <input
                type="text"
                placeholder="Search users..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="flex-1 min-w-50 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB366] focus:border-transparent outline-none"
              />
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB366] focus:border-transparent outline-none"
              >
                <option value="">All Roles</option>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="text-gray-600 text-lg">Loading...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map(user => (
                  <div key={user.id} className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow duration-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{user.name || 'No Name'}</h3>
                    <p className="text-sm text-gray-700 mb-2"><strong>Email:</strong> {user.email}</p>
                    <p className="text-sm text-gray-700 mb-2"><strong>Role:</strong> <span className={`px-2 py-1 rounded text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>{user.role}</span></p>
                    <p className="text-sm text-gray-700 mb-2"><strong>Password Set:</strong> {user.isPasswordSet ? '✓ Yes' : '✗ No'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Posts</h2>

            <div className="flex gap-3 mb-6 flex-wrap">
              <input
                type="text"
                placeholder="Search posts..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="flex-1 min-w-50 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB366] focus:border-transparent outline-none"
              />
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB366] focus:border-transparent outline-none"
              >
                <option value="">All Status</option>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="text-gray-600 text-lg">Loading...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map(post => (
                  <div key={post.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                    <div className="flex justify-between items-start mb-4 gap-4">
                      <h3 className="text-xl font-semibold text-gray-900 flex-1 wrap-break-word">{post.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase whitespace-nowrap ${
                        post.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        post.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap wrap-break-word">{post.content}</p>
                    <div className="flex justify-between text-sm text-gray-500 pt-4 border-t border-gray-200 flex-wrap gap-2">
                      <span>By: {post.user.email}</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    {post.rejectionReason && (
                      <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                        <strong className="block text-red-700 mb-2">Rejection Reason:</strong>
                        <p className="text-gray-700">{post.rejectionReason}</p>
                      </div>
                    )}
                    {post.status === 'PENDING' && (
                      <div className="flex gap-3 mt-4">
                        <button 
                          onClick={() => handleApprovePost(post.id)}
                          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 font-medium"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => openRejectModal(post)}
                          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowRejectModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Reject Post</h3>
            <p className="text-gray-600 mb-4">Provide a reason for rejecting this post:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB366] focus:border-transparent outline-none resize-y mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowRejectModal(false)} 
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleRejectPost} 
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
              >
                Reject Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
