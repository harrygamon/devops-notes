import { useState, useEffect } from 'react'
import './App.css'
import { HashRouter as Router, Route, Routes, Link } from 'react-router-dom'
import AIPage from './pages/AIPage'
import apiService from './services/api'

function App() {
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
    return localStorage.getItem('devops-dark-mode') === 'true';
  });

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
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('devops-dark-mode', darkMode);
  }, [darkMode]);

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

  const renderWelcomePage = () => (
    <div className="welcome-page">
      <div className="welcome-content">
        <h1>🚀 DevOps Notes</h1>
        <p>Your personal DevOps assistant and note-taking companion</p>
        
        <div className="feature-grid">
          <div className="feature-card">
            <h3>📝 Notes</h3>
            <p>Create and organize your DevOps notes with tags and search</p>
          </div>
          <div className="feature-card">
            <h3>🤖 AI Assistant</h3>
            <p>Get instant answers to DevOps questions with AI-powered responses</p>
          </div>
          <div className="feature-card">
            <h3>🔍 Code Review</h3>
            <p>Review your infrastructure code with AI-powered analysis</p>
          </div>
          <div className="feature-card">
            <h3>❓ Q&A</h3>
            <p>Ask questions and save answers for future reference</p>
          </div>
        </div>
        
        <div className="quick-stats">
          <div className="stat">
            <span className="stat-number">{notes.length}</span>
            <span className="stat-label">Notes</span>
          </div>
          <div className="stat">
            <span className="stat-number">{questionHistory.length}</span>
            <span className="stat-label">Questions</span>
          </div>
        </div>
      </div>
    </div>
  )

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
              rows="8"
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
          <h3>Your Notes ({notes.length})</h3>
          {notes.length === 0 ? (
            <div className="empty-state">
              <p>No notes yet. Create your first DevOps note!</p>
            </div>
          ) : (
            <div className="notes-grid">
              {notes.map((note) => (
                <div key={note.id} className="note-card">
                  <div className="note-header">
                    <h4>{note.title}</h4>
                    <div className="note-actions">
                      <button onClick={() => editNote(note)} className="btn-icon">✏️</button>
                      <button onClick={() => deleteNote(note.id)} className="btn-icon">🗑️</button>
                    </div>
                  </div>
                  <p className="note-content">{note.content.substring(0, 150)}...</p>
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
      <div className="page-header">
        <h2>🔍 AI Code Reviewer</h2>
        <button 
          className="theme-toggle" 
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="reviewer-container">
        <div className="code-input-section">
          <h3>Code to Review</h3>
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

        <div className="review-output-section">
          <h3>AI Review Results</h3>
          {aiResponse ? (
            <div className="review-output">
              <pre>{aiResponse}</pre>
            </div>
          ) : (
            <div className="empty-state">
              <p>Paste your code and click "Get Code Review" to see AI-powered feedback</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderAiQuestionsPage = () => (
    <div className="ai-questions-page">
      <div className="page-header">
        <h2>❓ AI Q&A</h2>
        <button 
          className="theme-toggle" 
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="questions-container">
        <div className="question-input-section">
          <h3>Ask a DevOps Question</h3>
          <textarea
            placeholder="Ask anything about Docker, Kubernetes, CI/CD, monitoring, security, etc..."
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            className="question-input"
            rows="4"
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

        <div className="questions-history">
          <h3>Question History ({questionHistory.length})</h3>
          {questionHistory.length === 0 ? (
            <div className="empty-state">
              <p>No questions yet. Ask your first DevOps question!</p>
            </div>
          ) : (
            <div className="questions-list">
              {questionHistory.map((q) => (
                <div key={q.id} className="question-card">
                  <div className="question-header">
                    <h4>Q: {q.question}</h4>
                    <button onClick={() => deleteQuestion(q.id)} className="btn-icon">🗑️</button>
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
  )

  return (
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
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={renderWelcomePage()} />
            <Route path="/notes" element={renderNotesPage()} />
            <Route path="/ai" element={<AIPage />} />
            <Route path="/review" element={renderAiReviewerPage()} />
            <Route path="/questions" element={renderAiQuestionsPage()} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

