import React, { useState, useEffect } from 'react';
import apiService from '../services/api.js';

const NewsPage = ({ darkMode, setDarkMode }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All News', icon: '📰' },
    { id: 'docker', name: 'Docker', icon: '🐳' },
    { id: 'kubernetes', name: 'Kubernetes', icon: '☸️' },
    { id: 'ci-cd', name: 'CI/CD', icon: '🚀' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'monitoring', name: 'Monitoring', icon: '📊' },
    { id: 'cloud', name: 'Cloud', icon: '☁️' },
    { id: 'tools', name: 'Tools', icon: '🛠️' }
  ];

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);
    try {
      const newsData = await apiService.getNews();
      setNews(newsData.articles || []);
    } catch (error) {
      console.error('Error loading news:', error);
      // Fallback news data
      setNews([
        {
          title: 'Docker Announces New Features for Container Security',
          description: 'Enhanced security scanning and vulnerability detection in Docker Desktop with improved container runtime security.',
          url: '#',
          publishedAt: new Date().toISOString(),
          source: { name: 'Docker Blog' },
          category: 'docker'
        },
        {
          title: 'Kubernetes 1.28 Released with Improved Performance',
          description: 'Latest Kubernetes release brings significant performance improvements, enhanced networking, and new security features.',
          url: '#',
          publishedAt: new Date(Date.now() - 86400000).toISOString(),
          source: { name: 'Kubernetes Blog' },
          category: 'kubernetes'
        },
        {
          title: 'GitHub Actions Introduces New CI/CD Templates',
          description: 'Pre-built workflows for common DevOps tasks, deployment scenarios, and automated testing pipelines.',
          url: '#',
          publishedAt: new Date(Date.now() - 172800000).toISOString(),
          source: { name: 'GitHub Blog' },
          category: 'ci-cd'
        },
        {
          title: 'Terraform Cloud Adds Advanced Policy Management',
          description: 'Enhanced policy-as-code capabilities for infrastructure governance and compliance automation.',
          url: '#',
          publishedAt: new Date(Date.now() - 259200000).toISOString(),
          source: { name: 'HashiCorp Blog' },
          category: 'tools'
        },
        {
          title: 'Prometheus 2.45 Released with Better Query Performance',
          description: 'Latest monitoring tool release focuses on query optimization, improved usability, and enhanced alerting.',
          url: '#',
          publishedAt: new Date(Date.now() - 345600000).toISOString(),
          source: { name: 'Prometheus Blog' },
          category: 'monitoring'
        },
        {
          title: 'AWS Introduces New Container Security Features',
          description: 'Enhanced container security scanning, runtime protection, and compliance monitoring for ECS and EKS.',
          url: '#',
          publishedAt: new Date(Date.now() - 432000000).toISOString(),
          source: { name: 'AWS Blog' },
          category: 'cloud'
        },
        {
          title: 'Zero Trust Security Model Gains Traction in DevOps',
          description: 'Organizations adopting zero trust principles for improved security posture and access control.',
          url: '#',
          publishedAt: new Date(Date.now() - 518400000).toISOString(),
          source: { name: 'Security Weekly' },
          category: 'security'
        },
        {
          title: 'Jenkins 2.400 Released with Enhanced Pipeline Features',
          description: 'New version includes improved pipeline syntax, better plugin management, and enhanced security features.',
          url: '#',
          publishedAt: new Date(Date.now() - 604800000).toISOString(),
          source: { name: 'Jenkins Blog' },
          category: 'ci-cd'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = news.filter(article => {
    const matchesCategory = selectedCategory === 'all' || 
      article.category === selectedCategory ||
      article.title.toLowerCase().includes(selectedCategory) ||
      article.description.toLowerCase().includes(selectedCategory);
    
    const matchesSearch = !searchTerm || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.source.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const getCategoryIcon = (article) => {
    const category = categories.find(cat => 
      article.category === cat.id || 
      article.title.toLowerCase().includes(cat.id) ||
      article.description.toLowerCase().includes(cat.id)
    );
    return category ? category.icon : '📰';
  };

  return (
    <div className="news-page">
      <div className="news-header">
        <div className="news-header-content">
          <h1 className="news-title">📰 DevOps News</h1>
          <p className="news-subtitle">Stay updated with the latest DevOps trends, tools, and best practices</p>
          <div className="news-header-actions">
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

      <div className="news-content">
        {/* News Overview */}
        <div className="news-overview">
          <div className="overview-card">
            <div className="overview-icon">🐳</div>
            <div className="overview-content">
              <h3>Container Technology</h3>
              <p>Docker, Kubernetes, and container orchestration</p>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon">🚀</div>
            <div className="overview-content">
              <h3>CI/CD & Automation</h3>
              <p>Pipeline tools and deployment strategies</p>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon">🔒</div>
            <div className="overview-content">
              <h3>Security & Compliance</h3>
              <p>DevSecOps and security best practices</p>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon">☁️</div>
            <div className="overview-content">
              <h3>Cloud Native</h3>
              <p>Cloud platforms and native development</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="news-filters">
          <div className="search-section">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search news articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>
          
          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-filter ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* News Articles */}
        <div className="news-articles">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner">⏳</div>
              <p>Loading latest DevOps news...</p>
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="empty-state">
              <div className="empty-content">
                <h4>📭 No News Found</h4>
                <p>Try adjusting your search terms or category filters</p>
                <button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }} className="btn-primary">
                  Clear Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="news-grid">
              {filteredNews.map((article, index) => (
                <div key={index} className="news-card">
                  <div className="news-card-header">
                    <div className="news-category">
                      <span className="category-icon">{getCategoryIcon(article)}</span>
                    </div>
                    <div className="news-meta">
                      <span className="news-source">{article.source.name}</span>
                      <span className="news-date">{formatDate(article.publishedAt)}</span>
                    </div>
                  </div>
                  
                  <div className="news-card-content">
                    <h3 className="news-title">{article.title}</h3>
                    <p className="news-description">{article.description}</p>
                  </div>
                  
                  <div className="news-card-actions">
                    <button 
                      className="btn-primary"
                      onClick={() => window.open(article.url, '_blank')}
                    >
                      Read More →
                    </button>
                    <button 
                      className="btn-secondary"
                      onClick={() => {
                        // Add to bookmarks functionality could be added here
                        console.log('Bookmark:', article.title);
                      }}
                    >
                      🔖 Bookmark
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* News Stats */}
        <div className="news-stats">
          <div className="stats-card">
            <div className="stat-icon">📰</div>
            <div className="stat-content">
              <span className="stat-number">{news.length}</span>
              <span className="stat-label">Total Articles</span>
            </div>
          </div>
          <div className="stats-card">
            <div className="stat-icon">🔍</div>
            <div className="stat-content">
              <span className="stat-number">{filteredNews.length}</span>
              <span className="stat-label">Filtered Results</span>
            </div>
          </div>
          <div className="stats-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <span className="stat-number">{news.length > 0 ? formatDate(news[0].publishedAt) : 'N/A'}</span>
              <span className="stat-label">Latest Update</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsPage; 