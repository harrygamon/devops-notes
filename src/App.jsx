import { useState, useEffect } from 'react'
import './App.css'
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'
import AIPage from './pages/AIPage'

function App() {
  const [currentPage, setCurrentPage] = useState('welcome')
  const [notes, setNotes] = useState([])
  const [currentNote, setCurrentNote] = useState('')
  const [selectedNote, setSelectedNote] = useState(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [aiCodeReview, setAiCodeReview] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiQuestionResponse, setAiQuestionResponse] = useState('')
  const [isQuestionLoading, setIsQuestionLoading] = useState(false)
  const [questionHistory, setQuestionHistory] = useState([])
  const [conversationContext, setConversationContext] = useState([])
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('devops-dark-mode') === 'true';
  });
  const [devopsNews, setDevopsNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState(null);
  const [aiProvider, setAiProvider] = useState('ollama') // Using local Ollama

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

  // Fetch real DevOps news
  const fetchDevOpsNews = async () => {
    setNewsLoading(true);
    setNewsError(null);
    
    try {
      // Try backend API first
      const response = await fetch('http://localhost:3001/api/news');
      
      if (!response.ok) {
        throw new Error('Failed to fetch news from backend');
      }
      
      const data = await response.json();
      
      if (data.fallback) {
        // Backend indicates fallback, use simulated news
        throw new Error('Backend fallback mode');
      }
      
      if (data.status === 'ok' && data.articles) {
        setDevopsNews(data.articles);
      } else {
        throw new Error('Invalid news data format');
      }
    } catch (error) {
      console.error('Error fetching DevOps news:', error);
      setNewsError('Failed to load news. Using fallback data.');
      // Set fallback news
      setDevopsNews([
        {
          title: "HashiCorp Releases Terraform 1.8 with Enhanced Security Features",
          description: "Terraform 1.8 introduces new provider features, improved state management, and enhanced security scanning integrations for better infrastructure security.",
          url: "https://www.hashicorp.com/blog/terraform-1-8",
          publishedAt: "2025-07-06T10:00:00Z",
          source: { name: "HashiCorp Blog" }
        },
        {
          title: "GitHub Actions Adds Native OIDC Support for Secure Deployments",
          description: "GitHub Actions now supports native OIDC for secure cloud deployments, simplifying secrets management for CI/CD pipelines across AWS, Azure, and GCP.",
          url: "https://github.blog/2025-07-05-github-actions-oidc-support/",
          publishedAt: "2025-07-05T14:30:00Z",
          source: { name: "GitHub Blog" }
        },
        {
          title: "Kubernetes 1.32 Released with Improved Autoscaling",
          description: "The latest Kubernetes release brings improved autoscaling capabilities, new Custom Resource Definitions (CRDs), and enhanced observability features for better cluster management.",
          url: "https://kubernetes.io/blog/2025/07/04/kubernetes-1-32-release/",
          publishedAt: "2025-07-04T09:15:00Z",
          source: { name: "Kubernetes Blog" }
        },
        {
          title: "ArgoCD 3.0 Announced with New UI and Advanced GitOps Workflows",
          description: "ArgoCD 3.0 introduces a completely redesigned UI, better GitOps workflows, and advanced RBAC controls for enterprise teams managing Kubernetes deployments.",
          url: "https://argoproj.github.io/argo-cd/blog/2025/07/03/argocd-3-0-announcement/",
          publishedAt: "2025-07-03T16:45:00Z",
          source: { name: "ArgoCD Blog" }
        },
        {
          title: "Docker Desktop 5.0 Brings Enhanced Container Security",
          description: "Docker Desktop 5.0 introduces new security features including vulnerability scanning, secrets management, and improved container isolation for development environments.",
          url: "https://www.docker.com/blog/docker-desktop-5-0-security-features/",
          publishedAt: "2025-07-02T11:20:00Z",
          source: { name: "Docker Blog" }
        },
        {
          title: "Jenkins LTS 2.414 Released with Pipeline Improvements",
          description: "Jenkins LTS 2.414 brings significant pipeline improvements, better plugin management, and enhanced security features for continuous integration workflows.",
          url: "https://www.jenkins.io/blog/2025/07/01/jenkins-lts-2-414-release/",
          publishedAt: "2025-07-01T13:10:00Z",
          source: { name: "Jenkins Blog" }
        },
        {
          title: "Prometheus 3.0 Introduces Native Histograms and Better Performance",
          description: "Prometheus 3.0 introduces native histogram support, improved query performance, and better integration with modern observability stacks.",
          url: "https://prometheus.io/blog/2025/06/30/prometheus-3-0-release/",
          publishedAt: "2025-06-30T08:30:00Z",
          source: { name: "Prometheus Blog" }
        },
        {
          title: "AWS EKS Anywhere Now Supports ARM64 Architecture",
          description: "AWS EKS Anywhere now supports ARM64 architecture, enabling customers to run Kubernetes workloads on ARM-based servers for better cost optimization.",
          url: "https://aws.amazon.com/blogs/containers/eks-anywhere-arm64-support/",
          publishedAt: "2025-06-29T15:45:00Z",
          source: { name: "AWS Blog" }
        }
      ]);
    } finally {
      setNewsLoading(false);
    }
  };

  // Load news on component mount
  useEffect(() => {
    fetchDevOpsNews();
  }, []);

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
    setAiResponse('')

    try {
      const response = await fetch('http://localhost:3001/api/code-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          code: aiCodeReview,
          context: 'DevOps application code review'
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Code review API error:', errorData)
        throw new Error(`Code review API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Code review response:', data)
      
      if (data.fallback) {
        console.log('Using fallback code review response')
      }
      
      setAiResponse(data.response || 'Sorry, I could not generate a code review.')
      
    } catch (error) {
      console.error('Error getting AI code review:', error)
      // Fallback to simulated response on error
      const fallbackResponses = [
        "🔍 **Code Review Analysis:**\n\n✅ **Strengths:**\n- Good separation of concerns\n- Proper error handling\n- Clean code structure\n\n⚠️ **Suggestions:**\n- Consider adding input validation\n- Add comprehensive logging\n- Implement retry mechanisms for external calls\n\n🔧 **Security:**\n- Ensure secrets are properly managed\n- Add rate limiting for API endpoints\n- Validate all user inputs",
        
        "🚀 **DevOps Best Practices Review:**\n\n✅ **Good Practices Found:**\n- Containerization with Docker\n- Infrastructure as Code approach\n- CI/CD pipeline implementation\n\n📈 **Improvements:**\n- Add health checks to containers\n- Implement blue-green deployment\n- Set up monitoring and alerting\n- Add automated testing in pipeline",
        
        "⚡ **Performance Analysis:**\n\n✅ **Optimizations:**\n- Database queries are efficient\n- Caching strategy is well implemented\n- Resource usage is optimized\n\n🎯 **Recommendations:**\n- Consider implementing connection pooling\n- Add performance monitoring\n- Optimize image sizes for containers\n- Use CDN for static assets"
      ]
      
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
      setAiResponse(randomResponse)
    } finally {
      setIsLoading(false)
    }
  }

  const clearForm = () => {
    setCurrentNote('')
    setNoteTitle('')
    setSelectedNote(null)
    setAiResponse('')
  }

  const clearCodeReview = () => {
    setAiCodeReview('')
    setAiResponse('')
  }

  // AI Chatbot Functions
  const getAiQuestionAnswer = async () => {
    if (!aiQuestion.trim()) return

    const timestamp = new Date().toLocaleString()
    const userMessage = { role: 'user', content: aiQuestion, timestamp }
    
    setIsQuestionLoading(true)
    
    try {
      const response = await callBackendAPI(aiQuestion, conversationContext)
      
      const aiMessage = { role: 'assistant', content: response, timestamp }
      
      const newQuestion = {
        id: Date.now(),
        question: aiQuestion,
        answer: response,
        timestamp,
        provider: 'ollama'
      }
      
      setQuestionHistory([newQuestion, ...questionHistory])
      setConversationContext([...conversationContext, userMessage, aiMessage])
      setAiQuestion('')
      
    } catch (error) {
      console.error('Error getting AI response:', error)
      // Show error to user
      const errorResponse = `Error: ${error.message}. Please check your backend server.`
      const aiMessage = { role: 'assistant', content: errorResponse, timestamp }
      
      const newQuestion = {
        id: Date.now(),
        question: aiQuestion,
        answer: errorResponse,
        timestamp,
        provider: 'ollama'
      }
      
      setQuestionHistory([newQuestion, ...questionHistory])
      setConversationContext([...conversationContext, userMessage, aiMessage])
      setAiQuestion('')
    } finally {
      setIsQuestionLoading(false)
    }
  }

  // Backend API Integration
  const callBackendAPI = async (question, context) => {
    const messages = [
      { role: 'system', content: 'You are a DevOps expert assistant. Provide detailed, practical advice for DevOps questions. Keep responses concise but informative.' },
      ...context.slice(-6).map(msg => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: question }
    ]
    
    try {
      console.log('Making backend API request to Ollama')
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages })
      })
      
      console.log('Backend response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Backend API error data:', errorData)
        
        if (errorData.fallback) {
          // Return simulated response if backend indicates fallback
          return generateSimulatedResponse(question, context)
        }
        
        throw new Error(`Backend API error: ${response.status} - ${errorData.error || 'Unknown error'}`)
      }
      
      const data = await response.json()
      console.log('Backend response data:', data)
      
      if (data.fallback) {
        console.log('Using fallback response from backend')
        return data.response || generateSimulatedResponse(question, context)
      }
      
      return data.response || 'Sorry, I could not generate a response.'
    } catch (error) {
      console.error('Backend API Error:', error)
      // Return simulated response on error
      return generateSimulatedResponse(question, context)
    }
  }

  const generateSimulatedResponse = (question, context) => {
    // Simple keyword-based responses for common DevOps questions
    const responses = {
      'docker': 'Docker is a platform for developing, shipping, and running applications in containers. Key commands: `docker build`, `docker run`, `docker-compose up`. For containerization best practices, use multi-stage builds and keep images minimal.',
      'kubernetes': 'Kubernetes is an open-source container orchestration platform. Key concepts: Pods, Services, Deployments, ConfigMaps, and Secrets. Use `kubectl` for cluster management and `helm` for package management.',
      'terraform': 'Terraform is an Infrastructure as Code tool by HashiCorp. Use it to define and provision infrastructure using declarative configuration files. Key commands: `terraform init`, `terraform plan`, `terraform apply`.',
      'jenkins': 'Jenkins is a popular open-source automation server for CI/CD. Create pipelines using Jenkinsfile (declarative or scripted syntax) to automate build, test, and deployment processes.',
      'git': 'Git is a distributed version control system. Essential commands: `git clone`, `git add`, `git commit`, `git push`, `git pull`, `git branch`, `git merge`. Use feature branches and meaningful commit messages.',
      'aws': 'AWS provides cloud computing services. Key services for DevOps: EC2, S3, ECS/EKS, Lambda, CloudFormation, CodePipeline. Use IAM for security and CloudWatch for monitoring.',
      'monitoring': 'For monitoring, consider Prometheus for metrics collection, Grafana for visualization, and AlertManager for alerting. Use ELK stack (Elasticsearch, Logstash, Kibana) for log management.',
      'security': 'DevOps security (DevSecOps) involves integrating security into CI/CD pipelines. Use tools like SonarQube for code analysis, Trivy for vulnerability scanning, and implement least privilege access.',
      'ci/cd': 'CI/CD automates software delivery. CI (Continuous Integration) runs tests on code changes. CD (Continuous Deployment) automatically deploys to production. Use tools like GitHub Actions, GitLab CI, or Jenkins.',
      'microservices': 'Microservices architecture breaks applications into small, independent services. Use service mesh (Istio/Linkerd) for communication, API gateways for routing, and implement proper monitoring and logging.'
    };
    
    // Find the best matching response
    const lowerQuestion = question.toLowerCase();
    for (const [keyword, response] of Object.entries(responses)) {
      if (lowerQuestion.includes(keyword)) {
        return response;
      }
    }
    
    // Default response for general DevOps questions
    return `I'm here to help with DevOps questions! I can provide guidance on Docker, Kubernetes, Terraform, CI/CD, monitoring, security, and more. Please ask a specific question about any DevOps topic, and I'll provide detailed, practical advice.`;
  }

  const clearQuestion = () => {
    setAiQuestion('')
    setAiQuestionResponse('')
  }

  const deleteQuestion = (id) => {
    setQuestionHistory(questionHistory.filter(q => q.id !== id))
  }

  const renderWelcomePage = () => (
    <div className="welcome-page">
      <div className="welcome-content">
        <div className="welcome-header-top">
          <div className="welcome-icon">🚀</div>
          <button className="dark-mode-toggle" onClick={() => setDarkMode(dm => !dm)} title="Toggle dark mode">
            {darkMode ? '🌙' : '☀️'}
          </button>
        </div>
        <h1>Welcome to DevOps Notes</h1>
        <p className="welcome-subtitle">Your AI-powered development companion</p>
        <div className="welcome-features">
          <div className="feature-card" onClick={() => setCurrentPage('notes')} tabIndex={0} role="button">
            <div className="feature-icon">📝</div>
            <h3>Smart Note Taking</h3>
            <p>Create, organize, and manage your DevOps notes with intelligent tagging</p>
          </div>
          <div className="feature-card" onClick={() => setCurrentPage('ai-reviewer')} tabIndex={0} role="button">
            <div className="feature-icon">🤖</div>
            <h3>AI Code Reviewer</h3>
            <p>Get instant feedback and suggestions for your code and configurations</p>
          </div>
          <div className="feature-card" onClick={() => setCurrentPage('ai-questions')} tabIndex={0} role="button">
            <div className="feature-icon">❓</div>
            <h3>AI DevOps Assistant</h3>
            <p>Ask questions and get expert DevOps guidance powered by AI</p>
          </div>
          <div className="feature-card" onClick={() => setCurrentPage('devops-news')} tabIndex={0} role="button">
            <div className="feature-icon">📰</div>
            <h3>DevOps News</h3>
            <p>Latest news and trends in DevOps tools and practices</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotesPage = () => (
    <div className="notes-page">
      <div className="notes-header">
        <div className="notes-header-content">
          <div className="notes-title">
            <h1>📝 My Notes</h1>
            <span className="note-count">{notes.length} notes</span>
          </div>
          <button className="dark-mode-toggle" onClick={() => setDarkMode(dm => !dm)} title="Toggle dark mode">
            {darkMode ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
      
      <div className="notes-container">
        <div className="notes-sidebar">
          <div className="sidebar-header">
            <h3>Notes List</h3>
            <button onClick={() => {
              setSelectedNote(null)
              setCurrentNote('')
              setNoteTitle('')
            }} className="new-note-btn">+ New Note</button>
          </div>
          
          <div className="notes-list">
            {notes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <p>No notes yet</p>
                <small>Create your first note to get started</small>
              </div>
            ) : (
              notes.map(note => (
                <div 
                  key={note.id} 
                  className={`note-item ${selectedNote?.id === note.id ? 'selected' : ''}`}
                  onClick={() => editNote(note)}
                >
                  <div className="note-header">
                    <h4>{note.title}</h4>
                    <div className="note-actions">
                      <button onClick={(e) => {
                        e.stopPropagation()
                        deleteNote(note.id)
                      }} className="btn-delete">🗑️</button>
                    </div>
                  </div>
                  <p className="note-preview">{note.content.substring(0, 150)}...</p>
                  <div className="note-tags">
                    {note.tags.map(tag => (
                      <span key={tag} className="tag">#{tag}</span>
                    ))}
                  </div>
                  <small className="note-timestamp">{note.timestamp}</small>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="notes-editor">
          <div className="editor-header">
            <h2>{selectedNote ? 'Edit Note' : 'Create New Note'}</h2>
            {selectedNote && (
              <button onClick={() => {
                setSelectedNote(null)
                setCurrentNote('')
                setNoteTitle('')
              }} className="btn btn-secondary">New Note</button>
            )}
          </div>
          
          <div className="note-form">
            <input
              type="text"
              placeholder="Enter note title..."
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="note-title-input"
            />
            <textarea
              placeholder="Start writing your note here... Use #tags to organize your notes"
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              className="note-content-textarea"
            />
            <div className="note-actions">
              {selectedNote ? (
                <>
                  <button onClick={updateNote} className="btn btn-primary">Update Note</button>
                  <button onClick={() => {
                    setSelectedNote(null)
                    setCurrentNote('')
                    setNoteTitle('')
                  }} className="btn btn-secondary">Cancel</button>
                </>
              ) : (
                <button onClick={saveNote} className="btn btn-primary">Save Note</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAiReviewerPage = () => (
    <div className="ai-reviewer-page">
      <div className="ai-header">
        <div className="ai-header-content">
          <div>
            <h2>🤖 AI Code Reviewer</h2>
            <p>Get instant feedback on your code, configurations, and DevOps practices</p>
          </div>
          <button className="dark-mode-toggle" onClick={() => setDarkMode(dm => !dm)} title="Toggle dark mode">
            {darkMode ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      <div className="ai-container">
        <div className="code-input-section">
          <h3>📝 Paste Your Code</h3>
          <textarea
            placeholder="Paste your code, configuration files, or DevOps scripts here for AI review..."
            value={aiCodeReview}
            onChange={(e) => setAiCodeReview(e.target.value)}
            className="code-textarea"
            rows={20}
          />
          <div className="code-actions">
            <button 
              onClick={getAiCodeReview}
              disabled={!aiCodeReview.trim() || isLoading}
              className="btn-ai-review"
            >
              {isLoading ? '🤖 AI is analyzing...' : '🤖 Get AI Review'}
            </button>
            <button onClick={clearCodeReview} className="btn-clear">
              Clear
            </button>
          </div>
        </div>

        <div className="ai-response-section">
          <h3>🎯 AI Review Results</h3>
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>AI is analyzing your code...</p>
            </div>
          ) : aiResponse ? (
            <div className="ai-response">
              <pre>{aiResponse}</pre>
            </div>
          ) : (
            <div className="empty-ai-state">
              <div className="empty-icon">🤖</div>
              <p>No review yet</p>
              <small>Paste your code and click "Get AI Review" to start</small>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderAiQuestionsPage = () => (
    <div className="chatgpt-page">
      {/* Header */}
      <div className="chatgpt-header">
        <div className="chatgpt-header-content">
          <div className="chatgpt-logo">
            <span className="logo-icon">🤖</span>
            <span className="logo-text">DevOps AI Assistant</span>
          </div>
          <div className="chatgpt-controls">
            <button className="dark-mode-toggle" onClick={() => setDarkMode(dm => !dm)} title="Toggle dark mode">
              {darkMode ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chatgpt-main">
        <div className="chatgpt-messages">
          {questionHistory.length === 0 && !isQuestionLoading ? (
            <div className="chatgpt-welcome">
              <div className="welcome-title">
                <h1>DevOps AI Assistant</h1>
                <p>Your expert companion for all things DevOps</p>
              </div>
              
              <div className="welcome-examples">
                <div className="examples-section">
                  <h3>Examples</h3>
                  <div className="example-buttons">
                    <button 
                      className="example-button"
                      onClick={() => setAiQuestion("How do I set up a CI/CD pipeline with GitHub Actions?")}
                    >
                      "How do I set up a CI/CD pipeline with GitHub Actions?"
                    </button>
                    <button 
                      className="example-button"
                      onClick={() => setAiQuestion("What are the best practices for Docker security?")}
                    >
                      "What are the best practices for Docker security?"
                    </button>
                    <button 
                      className="example-button"
                      onClick={() => setAiQuestion("How do I monitor Kubernetes clusters effectively?")}
                    >
                      "How do I monitor Kubernetes clusters effectively?"
                    </button>
                  </div>
                </div>
                
                <div className="examples-section">
                  <h3>Capabilities</h3>
                  <div className="capabilities-grid">
                    <div className="capability-item">
                      <span className="capability-icon">🐳</span>
                      <span>Docker & Containers</span>
                    </div>
                    <div className="capability-item">
                      <span className="capability-icon">☸️</span>
                      <span>Kubernetes</span>
                    </div>
                    <div className="capability-item">
                      <span className="capability-icon">🔄</span>
                      <span>CI/CD Pipelines</span>
                    </div>
                    <div className="capability-item">
                      <span className="capability-icon">📊</span>
                      <span>Monitoring</span>
                    </div>
                    <div className="capability-item">
                      <span className="capability-icon">🛡️</span>
                      <span>Security</span>
                    </div>
                    <div className="capability-item">
                      <span className="capability-icon">☁️</span>
                      <span>Cloud Native</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="messages-container">
              {questionHistory.map(q => (
                <div key={q.id} className="message-group">
                  <div className="message user-message">
                    <div className="message-avatar">
                      <div className="avatar-circle">👤</div>
                    </div>
                    <div className="message-content">
                      <div className="message-text">{q.question}</div>
                      <div className="message-actions">
                        <button onClick={() => deleteQuestion(q.id)} className="action-button">
                          <span>🗑️</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="message assistant-message">
                    <div className="message-avatar">
                      <div className="avatar-circle assistant">🤖</div>
                    </div>
                    <div className="message-content">
                      <div className="message-text">
                        <div className="markdown-content">
                          {q.answer.split('\n').map((line, index) => {
                            if (line.startsWith('**') && line.endsWith('**')) {
                              return <h4 key={index} className="markdown-heading">{line.replace(/\*\*/g, '')}</h4>
                            } else if (line.startsWith('- **')) {
                              return <div key={index} className="markdown-list-item">
                                <span className="list-bullet">•</span>
                                <span className="markdown-bold">{line.replace('- **', '').replace('**', '')}</span>
                              </div>
                            } else if (line.startsWith('- ')) {
                              return <div key={index} className="markdown-list-item">
                                <span className="list-bullet">•</span>
                                <span>{line.replace('- ', '')}</span>
                              </div>
                            } else if (line.startsWith('**')) {
                              return <div key={index} className="markdown-list-item">
                                <span className="markdown-bold">{line.replace(/\*\*/g, '')}</span>
                              </div>
                            } else if (line.trim() === '') {
                              return <br key={index} />
                            } else {
                              return <p key={index}>{line}</p>
                            }
                          })}
                        </div>
                      </div>
                      <div className="message-footer">
                        <span className="message-timestamp">{q.timestamp}</span>
                        <span className="message-provider">Ollama</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isQuestionLoading && (
                <div className="message assistant-message">
                  <div className="message-avatar">
                    <div className="avatar-circle assistant">🤖</div>
                  </div>
                  <div className="message-content">
                    <div className="message-text">
                      <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="chatgpt-input-area">
          <div className="input-container">
            <div className="input-wrapper">
              <textarea
                placeholder="Message DevOps AI Assistant..."
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    getAiQuestionAnswer();
                  }
                }}
                className="chatgpt-input"
                rows={1}
              />
              <button 
                onClick={getAiQuestionAnswer}
                disabled={!aiQuestion.trim() || isQuestionLoading}
                className="send-button"
                title="Send message"
              >
                {isQuestionLoading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                  </div>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
            <div className="input-footer">
              <span className="input-hint">DevOps AI Assistant can make mistakes. Consider checking important information.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDevOpsNewsPage = () => (
    <div className="devops-news-page">
      <div className="news-header">
        <div className="news-header-content">
          <div>
            <h2>📰 DevOps News & Trends</h2>
            <p>Stay up to date with the latest in DevOps tools, practices, and technology.</p>
            <button 
              onClick={fetchDevOpsNews} 
              className="refresh-news-btn"
              disabled={newsLoading}
            >
              {newsLoading ? '🔄 Loading...' : '🔄 Refresh News'}
            </button>
          </div>
          <button className="dark-mode-toggle" onClick={() => setDarkMode(dm => !dm)} title="Toggle dark mode">
            {darkMode ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
      
      {newsError && (
        <div className="news-error">
          <p>⚠️ {newsError}</p>
        </div>
      )}
      
      {newsLoading ? (
        <div className="news-loading">
          <div className="loading-spinner"></div>
          <p>Loading latest DevOps news...</p>
        </div>
      ) : (
        <div className="news-list">
          {devopsNews.map((article, index) => (
            <div key={index} className="news-item">
              <div className="news-item-header">
                <h3>
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="news-link"
                  >
                    {article.title}
                  </a>
                </h3>
                <span className="news-source">{article.source?.name || 'DevOps News'}</span>
              </div>
              <p className="news-description">{article.description}</p>
              <div className="news-footer">
                <span className="news-date">
                  {new Date(article.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="read-more-btn"
                >
                  Read More →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <Router>
      <nav className="nav-bar">
        <div className="nav-brand">
          <Link to="/">DevOps Notes</Link>
        </div>
        <div className="nav-links">
          <Link className="nav-link" to="/">Notes</Link>
          <Link className="nav-link" to="/ai-reviewer">AI Code Reviewer</Link>
          <Link className="nav-link" to="/ai-questions">AI Assistant (Legacy)</Link>
          <Link className="nav-link" to="/devops-news">DevOps News</Link>
          <Link className="nav-link" to="/ai-assistant">AI Assistant</Link>
        </div>
      </nav>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<>{renderWelcomePage()}{renderNotesPage()}</>} />
          <Route path="/ai-reviewer" element={<>{renderAiReviewerPage()}</>} />
          <Route path="/ai-questions" element={<>{renderAiQuestionsPage()}</>} />
          <Route path="/devops-news" element={<>{renderDevOpsNewsPage()}</>} />
          <Route path="/ai-assistant" element={<AIPage />} />
        </Routes>
      </main>
    </Router>
  )
}

export default App

