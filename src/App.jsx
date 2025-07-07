import React, { useState, useEffect } from 'react'
import './App.css'
import { HashRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom'
import AIPage from './pages/AIPage'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/AdminPage'
import apiService from './services/api'

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          color: 'white', 
          backgroundColor: '#1a1a1a',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h1>Something went wrong</h1>
          <p>Error: {this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  console.log('App component rendering...');
  
  const [notes, setNotes] = useState([])
  const [currentNote, setCurrentNote] = useState('')
  const [selectedNote, setSelectedNote] = useState(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [aiCodeReview, setAiCodeReview] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiQuestion, setAiQuestion] = useState('')
  const [isQuestionLoading, setIsQuestionLoading] = useState(false)
  const [questionHistory, setQuestionHistory] = useState([])
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('devops-dark-mode');
    // Default to dark mode if no preference is saved
    return savedMode === null ? true : savedMode === 'true';
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('devops-logged-in') === 'true';
  });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('devops-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  console.log('App state initialized:', { darkMode, isLoggedIn, user });

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('devops-notes')
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }
    
    const savedQuestions = localStorage.getItem('devops-questions')
    if (savedQuestions) {
      setQuestionHistory(JSON.parse(savedQuestions))
    }
  }, [])

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem('devops-notes', JSON.stringify(notes))
  }, [notes])

  // Save question history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('devops-questions', JSON.stringify(questionHistory))
  }, [questionHistory])

  useEffect(() => {
    document.body.classList.toggle('light-mode', !darkMode);
    localStorage.setItem('devops-dark-mode', darkMode);
  }, [darkMode]);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem('devops-logged-in', 'true');
    localStorage.setItem('devops-user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('devops-logged-in');
    localStorage.removeItem('devops-user');
  };

  const saveNote = () => {
    if (!currentNote.trim() || !noteTitle.trim()) return

    const newNote = {
      id: Date.now(),
      title: noteTitle,
      content: currentNote,
      timestamp: new Date().toLocaleString(),
      tags: extractTags(currentNote)
    }

    setNotes([newNote, ...notes])
    setCurrentNote('')
    setNoteTitle('')
    setSelectedNote(null)
  }

  const extractTags = (content) => {
    const tagRegex = /#(\w+)/g
    const tags = content.match(tagRegex) || []
    return tags.map(tag => tag.substring(1))
  }

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id))
    if (selectedNote && selectedNote.id === id) {
      setSelectedNote(null)
    }
  }

  const editNote = (note) => {
    setSelectedNote(note)
    setCurrentNote(note.content)
    setNoteTitle(note.title)
  }

  const updateNote = () => {
    if (!selectedNote || !currentNote.trim() || !noteTitle.trim()) return

    const updatedNotes = notes.map(note =>
      note.id === selectedNote.id
        ? {
            ...note,
            title: noteTitle,
            content: currentNote,
            timestamp: new Date().toLocaleString(),
            tags: extractTags(currentNote)
          }
        : note
    )

    setNotes(updatedNotes)
    setCurrentNote('')
    setNoteTitle('')
    setSelectedNote(null)
  }

  const getAiCodeReview = async () => {
    if (!aiCodeReview.trim()) return

    setIsLoading(true)
    try {
      const data = await apiService.codeReview(aiCodeReview, 'DevOps infrastructure and automation code')
      
      setAiResponse(data.review)
    } catch (error) {
      console.error('Code review error:', error)
      setAiResponse('⚠️ Error getting code review. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const clearForm = () => {
    setCurrentNote('')
    setNoteTitle('')
    setSelectedNote(null)
  }

  const clearCodeReview = () => {
    setAiCodeReview('')
    setAiResponse('')
  }

  const getAiQuestionAnswer = async () => {
    if (!aiQuestion.trim()) return

    setIsQuestionLoading(true)
    try {
      const data = await apiService.chat([
        {
          role: 'user',
          content: aiQuestion
        }
      ])
      
      const newQuestion = {
        id: Date.now(),
        question: aiQuestion,
        answer: data.response,
        timestamp: new Date().toLocaleString(),
        provider: data.provider,
        fallback: data.fallback
      }

      setQuestionHistory([newQuestion, ...questionHistory])
      setAiQuestion('')
    } catch (error) {
      console.error('Question error:', error)
      const errorQuestion = {
        id: Date.now(),
        question: aiQuestion,
        answer: '⚠️ Error getting answer. Please try again.',
        timestamp: new Date().toLocaleString(),
        error: true
      }
      setQuestionHistory([errorQuestion, ...questionHistory])
      setAiQuestion('')
    } finally {
      setIsQuestionLoading(false)
    }
  }

  const clearQuestion = () => {
    setAiQuestion('')
  }

  const deleteQuestion = (id) => {
    setQuestionHistory(questionHistory.filter(q => q.id !== id))
  }

  const renderWelcomePage = () => {
    return (
      <div className="welcome-page">
        <div className="welcome-content">
          <div className="welcome-header">
            <h1>🚀 DevOps Notes</h1>
            <p className="welcome-subtitle">Your comprehensive DevOps workspace for notes, AI assistance, and code review</p>
          </div>
          
          <div className="dashboard-grid">
            <div className="dashboard-section">
              <h2>📊 Quick Overview</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📝</div>
                  <div className="stat-content">
                    <span className="stat-number">{notes.length}</span>
                    <span className="stat-label">Total Notes</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">❓</div>
                  <div className="stat-content">
                    <span className="stat-number">{questionHistory.length}</span>
                    <span className="stat-label">Questions Asked</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🏷️</div>
                  <div className="stat-content">
                    <span className="stat-number">{notes.reduce((acc, note) => acc + note.tags.length, 0)}</span>
                    <span className="stat-label">Total Tags</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📅</div>
                  <div className="stat-content">
                    <span className="stat-number">{notes.length > 0 ? new Date(notes[0].timestamp).toLocaleDateString() : 'N/A'}</span>
                    <span className="stat-label">Last Updated</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-section">
              <h2>🚀 Quick Actions</h2>
              <div className="feature-grid">
                <div className="feature-card" onClick={() => window.location.hash = '#/notes'}>
                  <div className="feature-icon">📝</div>
                  <div className="feature-content">
                    <h3>Notes</h3>
                    <p>Create and organize your DevOps notes with tags and search functionality</p>
                    <div className="feature-arrow">→</div>
                  </div>
                </div>
                <div className="feature-card" onClick={() => window.location.hash = '#/ai'}>
                  <div className="feature-icon">🤖</div>
                  <div className="feature-content">
                    <h3>AI Assistant</h3>
                    <p>Get instant answers to DevOps questions with AI-powered responses</p>
                    <div className="feature-arrow">→</div>
                  </div>
                </div>
                <div className="feature-card" onClick={() => window.location.hash = '#/review'}>
                  <div className="feature-icon">🔍</div>
                  <div className="feature-content">
                    <h3>Code Review</h3>
                    <p>Review your infrastructure code with AI-powered analysis and suggestions</p>
                    <div className="feature-arrow">→</div>
                  </div>
                </div>
                <div className="feature-card" onClick={() => window.location.hash = '#/questions'}>
                  <div className="feature-icon">❓</div>
                  <div className="feature-content">
                    <h3>Q&A</h3>
                    <p>Ask questions and save answers for future reference</p>
                    <div className="feature-arrow">→</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-section">
              <h2>📋 Recent Activity</h2>
              <div className="recent-activity">
                {notes.length > 0 ? (
                  <div className="recent-notes">
                    <h3>Latest Notes</h3>
                    <div className="recent-notes-list">
                      {notes.slice(0, 3).map((note) => (
                        <div key={note.id} className="recent-note-item" onClick={() => window.location.hash = '#/notes'}>
                          <div className="recent-note-title">{note.title}</div>
                          <div className="recent-note-meta">
                            <span className="recent-note-time">{note.timestamp}</span>
                            {note.tags.length > 0 && (
                              <span className="recent-note-tags">
                                {note.tags.slice(0, 2).map((tag, index) => (
                                  <span key={index} className="tag-small">#{tag}</span>
                                ))}
                                {note.tags.length > 2 && <span className="tag-more">+{note.tags.length - 2}</span>}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="empty-recent">
                    <p>No notes yet. Start by creating your first DevOps note!</p>
                    <button onClick={() => window.location.hash = '#/notes'} className="btn-primary">Create Note</button>
                  </div>
                )}
              </div>
            </div>

            <div className="dashboard-section">
              <h2>💡 DevOps Tips</h2>
              <div className="tips-grid">
                <div className="tip-card">
                  <div className="tip-icon">🐳</div>
                  <h4>Docker Best Practices</h4>
                  <p>Use multi-stage builds, minimize layers, and always specify base image versions</p>
                </div>
                <div className="tip-card">
                  <div className="tip-icon">☸️</div>
                  <h4>Kubernetes Security</h4>
                  <p>Enable RBAC, use network policies, and regularly update your cluster</p>
                </div>
                <div className="tip-card">
                  <div className="tip-icon">🚀</div>
                  <h4>CI/CD Optimization</h4>
                  <p>Cache dependencies, parallelize jobs, and use conditional deployments</p>
                </div>
                <div className="tip-card">
                  <div className="tip-icon">🔒</div>
                  <h4>Security First</h4>
                  <p>Scan for vulnerabilities, use secrets management, and implement least privilege</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderNotesPage = () => (
    <div className="notes-page">
      <div className="notes-header">
        <h2>📝 DevOps Notes</h2>
        <button 
          className="theme-toggle" 
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="notes-container">
        <div className="notes-sidebar">
          <div className="note-form">
            <div className="note-form-header">
              <h3>{selectedNote ? 'Edit Note' : 'New Note'}</h3>
            </div>
            <input
              type="text"
              placeholder="Note title..."
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="note-title-input"
            />
            <textarea
              placeholder="Write your DevOps notes here... Use #tags for organization"
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              className="note-content-input"
              rows="6"
            />
            <div className="note-actions">
              {selectedNote ? (
                <>
                  <button onClick={updateNote} className="btn-primary">Update Note</button>
                  <button onClick={clearForm} className="btn-secondary">Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={saveNote} className="btn-primary">Save Note</button>
                  <button onClick={clearForm} className="btn-secondary">Clear</button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="notes-list">
          <div className="notes-list-header">
            <h3>Your Notes ({notes.length})</h3>
          </div>
          {notes.length === 0 ? (
            <div className="empty-state">
              <p>No notes yet. Create your first DevOps note!</p>
            </div>
          ) : (
            <div className="notes-grid">
              {notes.map((note) => (
                <div key={note.id} className="note-card" onClick={() => editNote(note)}>
                  <div className="note-header">
                    <h4>{note.title}</h4>
                    <div className="note-actions">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNote(note.id);
                        }} 
                        className="btn-icon"
                        title="Delete note"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <p className="note-content">{note.content.substring(0, 120)}...</p>
                  <div className="note-meta">
                    <span className="note-timestamp">{note.timestamp}</span>
                    {note.tags.length > 0 && (
                      <div className="note-tags">
                        {note.tags.map((tag, index) => (
                          <span key={index} className="tag">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderAiReviewerPage = () => (
    <div className="ai-reviewer-page">
      <div className="ai-header">
        <div className="ai-header-content">
          <h1 className="ai-title">🔍 AI Code Reviewer</h1>
          <p className="ai-subtitle">Get instant feedback on your DevOps code with AI-powered analysis</p>
          <div className="ai-header-actions">
            <button 
              className="theme-toggle" 
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>

      <div className="ai-content">
        <div className="reviewer-overview">
          <div className="overview-card">
            <div className="overview-icon">🔍</div>
            <div className="overview-content">
              <h3>Security Analysis</h3>
              <p>Detect vulnerabilities and security best practices</p>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon">⚡</div>
            <div className="overview-content">
              <h3>Performance Tips</h3>
              <p>Optimize your code for better performance</p>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon">🏗️</div>
            <div className="overview-content">
              <h3>Best Practices</h3>
              <p>Follow industry standards and conventions</p>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon">🐛</div>
            <div className="overview-content">
              <h3>Bug Detection</h3>
              <p>Identify potential issues and errors</p>
            </div>
          </div>
        </div>

        <div className="reviewer-container">
          <div className="code-input-section">
            <div className="section-header">
              <h3>📝 Code to Review</h3>
              <p>Paste your DevOps code for AI-powered analysis and suggestions</p>
            </div>
            <div className="code-input-wrapper">
              <div className="code-examples">
                <h4>Supported Formats:</h4>
                <div className="example-tags">
                  <span className="example-tag">🐳 Dockerfile</span>
                  <span className="example-tag">☸️ Kubernetes</span>
                  <span className="example-tag">🏗️ Terraform</span>
                  <span className="example-tag">🚀 CI/CD</span>
                  <span className="example-tag">🔧 Shell Scripts</span>
                  <span className="example-tag">🐍 Python</span>
                </div>
              </div>
              <textarea
                placeholder="Paste your DevOps code here (Dockerfile, Terraform, Kubernetes manifests, etc.)..."
                value={aiCodeReview}
                onChange={(e) => setAiCodeReview(e.target.value)}
                className="code-input"
                rows="15"
              />
              <div className="input-actions">
                <button 
                  onClick={getAiCodeReview} 
                  disabled={isLoading || !aiCodeReview.trim()}
                  className="btn-primary"
                >
                  {isLoading ? '🔍 Reviewing...' : '🔍 Get Code Review'}
                </button>
                <button onClick={clearCodeReview} className="btn-secondary">Clear</button>
              </div>
            </div>
          </div>

          <div className="review-output-section">
            <div className="section-header">
              <h3>🤖 AI Review Results</h3>
              <p>AI-powered feedback and suggestions for your code</p>
            </div>
            {aiResponse ? (
              <div className="review-output">
                <div className="output-header">
                  <span className="output-status">✅ Review Complete</span>
                  <span className="output-timestamp">{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="output-content">
                  <pre>{aiResponse}</pre>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-content">
                  <h4>📋 Ready for Code Review</h4>
                  <p>Paste your code in the left panel and click "Get Code Review" to receive AI-powered feedback</p>
                  <div className="empty-features">
                    <div className="feature">🔍 Security Analysis</div>
                    <div className="feature">⚡ Performance Tips</div>
                    <div className="feature">🏗️ Best Practices</div>
                    <div className="feature">🐛 Bug Detection</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderAiQuestionsPage = () => (
    <div className="ai-questions-page">
      <div className="ai-header">
        <div className="ai-header-content">
          <h1 className="ai-title">❓ AI Q&A</h1>
          <p className="ai-subtitle">Get instant answers to your DevOps questions with AI assistance</p>
          <div className="ai-header-actions">
            <button 
              className="theme-toggle" 
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>

      <div className="ai-content">
        <div className="qa-overview">
          <div className="overview-card">
            <div className="overview-icon">🐳</div>
            <div className="overview-content">
              <h3>Docker & Containers</h3>
              <p>Containerization, images, and orchestration</p>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon">☸️</div>
            <div className="overview-content">
              <h3>Kubernetes</h3>
              <p>Cluster management and deployment</p>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon">🚀</div>
            <div className="overview-content">
              <h3>CI/CD Pipelines</h3>
              <p>Automation and deployment strategies</p>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon">🔒</div>
            <div className="overview-content">
              <h3>Security</h3>
              <p>Best practices and vulnerability management</p>
            </div>
          </div>
        </div>

        <div className="questions-container">
          <div className="question-input-section">
            <div className="section-header">
              <h3>❓ Ask a DevOps Question</h3>
              <p>Get instant answers to your DevOps questions with AI assistance</p>
            </div>
            <div className="question-input-wrapper">
              <div className="question-examples">
                <h4>Example Questions:</h4>
                <div className="example-questions">
                  <span className="example-question">"How do I optimize a Dockerfile?"</span>
                  <span className="example-question">"What are Kubernetes best practices?"</span>
                  <span className="example-question">"How to set up CI/CD with GitHub Actions?"</span>
                  <span className="example-question">"What security measures should I implement?"</span>
                </div>
              </div>
              <textarea
                placeholder="Ask anything about Docker, Kubernetes, CI/CD, monitoring, security, etc..."
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                className="question-input"
                rows="6"
              />
              <div className="input-actions">
                <button 
                  onClick={getAiQuestionAnswer} 
                  disabled={isQuestionLoading || !aiQuestion.trim()}
                  className="btn-primary"
                >
                  {isQuestionLoading ? '🤔 Thinking...' : '❓ Ask Question'}
                </button>
                <button onClick={clearQuestion} className="btn-secondary">Clear</button>
              </div>
            </div>
          </div>

          <div className="questions-history">
            <div className="section-header">
              <h3>📚 Question History ({questionHistory.length})</h3>
              <p>Your previous questions and AI responses</p>
            </div>
            {questionHistory.length === 0 ? (
              <div className="empty-state">
                <div className="empty-content">
                  <h4>💭 Ready to Ask Questions</h4>
                  <p>Ask your first DevOps question above to get started</p>
                  <div className="empty-features">
                    <div className="feature">🐳 Docker & Containers</div>
                    <div className="feature">☸️ Kubernetes</div>
                    <div className="feature">🚀 CI/CD Pipelines</div>
                    <div className="feature">🔒 Security</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="questions-list">
                {questionHistory.map((q) => (
                  <div key={q.id} className="question-card">
                    <div className="question-header">
                      <h4>Q: {q.question}</h4>
                      <button onClick={() => deleteQuestion(q.id)} className="btn-icon" title="Delete question">🗑️</button>
                    </div>
                    <div className="question-answer">
                      <p><strong>A:</strong> {q.answer}</p>
                    </div>
                    <div className="question-meta">
                      <span className="question-timestamp">{q.timestamp}</span>
                      {q.provider && (
                        <span className={`provider ${q.fallback ? 'fallback' : 'primary'}`}>
                          {q.fallback ? '🔄 Fallback' : '🤖 AI'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <ErrorBoundary>
      <Router>
        <div className="app">
          <nav className="navbar">
            <div className="nav-brand">
              <Link to="/">🚀 DevOps Notes</Link>
            </div>
            <div className="nav-links">
              <Link to="/" className="nav-link">🏠 Home</Link>
              <Link to="/notes" className="nav-link">📝 Notes</Link>
              <Link to="/ai" className="nav-link">🤖 AI Assistant</Link>
              <Link to="/review" className="nav-link">🔍 Code Review</Link>
              <Link to="/questions" className="nav-link">❓ Q&A</Link>
              <Link to="/admin" className="nav-link">⚙️ Admin</Link>
            </div>
            {isLoggedIn && (
              <div className="nav-user">
                <span className="user-greeting">Welcome, {user?.username}!</span>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </div>
            )}
          </nav>

          <main className="main-content">
            <Routes>
              <Route path="/login" element={
                isLoggedIn ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />
              } />
              <Route path="/" element={
                isLoggedIn ? renderWelcomePage() : <Navigate to="/login" />
              } />
              <Route path="/notes" element={
                isLoggedIn ? renderNotesPage() : <Navigate to="/login" />
              } />
              <Route path="/ai" element={
                isLoggedIn ? <AIPage darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/login" />
              } />
              <Route path="/review" element={
                isLoggedIn ? renderAiReviewerPage() : <Navigate to="/login" />
              } />
              <Route path="/questions" element={
                isLoggedIn ? renderAiQuestionsPage() : <Navigate to="/login" />
              } />
              <Route path="/admin" element={
                isLoggedIn ? <AdminPage darkMode={darkMode} setDarkMode={setDarkMode} /> : <Navigate to="/login" />
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App

