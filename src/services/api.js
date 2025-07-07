// Client-side API service with DistilGPT2 support
import distilGPT2Service from './distilgpt2Service.js';

class APIService {
  constructor() {
    // For GitHub Pages deployment, we use DistilGPT2 in-browser
    this.baseURL = null;
    this.isBackendAvailable = false;
    this.distilGPT2Service = distilGPT2Service;
    
    // Initialize DistilGPT2 model
    this.initializeDistilGPT2();
  }

  // Initialize DistilGPT2 model for in-browser AI
  async initializeDistilGPT2() {
    try {
      console.log('🚀 Initializing DistilGPT2 for in-browser AI...');
      await this.distilGPT2Service.loadModel();
      console.log('✅ DistilGPT2 initialized successfully!');
    } catch (error) {
      console.error('❌ Failed to initialize DistilGPT2:', error);
    }
  }

  // AI Chat endpoint with DistilGPT2
  async chat(messages) {
    try {
      console.log('🤖 Using DistilGPT2 for chat...');
      const response = await this.distilGPT2Service.chat(messages);
      return response;
    } catch (error) {
      console.error('❌ DistilGPT2 chat error:', error);
      return {
        response: "I'm sorry, I'm having trouble generating a response right now. Please try again.",
        provider: 'distilgpt2',
        model: 'distilgpt2',
        fallback: true
      };
    }
  }

  // Code Review endpoint with DistilGPT2
  async codeReview(code, context) {
    try {
      console.log('🔍 Using DistilGPT2 for code review...');
      
      const prompt = `You are an expert DevOps engineer and code reviewer. Please review the following code and provide detailed feedback on:

1. Security best practices
2. Performance optimizations
3. DevOps best practices
4. Code quality and maintainability
5. Specific recommendations for improvement

Context: ${context}

Code to review:
\`\`\`
${code}
\`\`\`

Please provide a comprehensive review with actionable recommendations.`;

      const response = await this.distilGPT2Service.generateResponse(prompt, 200);
      
      return {
        review: response,
        provider: 'distilgpt2',
        model: 'distilgpt2',
        fallback: false
      };
    } catch (error) {
      console.error('❌ DistilGPT2 code review error:', error);
      return {
        review: "I'm sorry, I'm having trouble reviewing the code right now. Please try again.",
        provider: 'distilgpt2',
        model: 'distilgpt2',
        fallback: true
      };
    }
  }

  // News endpoint (keeping fallback only for now)
  async getNews() {
    return this.getFallbackNews();
  }

  // Get DistilGPT2 status
  async getDistilGPT2Status() {
    return this.distilGPT2Service.getStatus();
  }

  // Fallback news (keeping this for now)
  getFallbackNews() {
    return {
      status: 'ok',
      totalResults: 5,
      articles: [
        {
          title: 'Docker Announces New Features for Container Security',
          description: 'Enhanced security scanning and vulnerability detection in Docker Desktop.',
          url: '#',
          publishedAt: new Date().toISOString(),
          source: { name: 'Docker Blog' }
        },
        {
          title: 'Kubernetes 1.28 Released with Improved Performance',
          description: 'Latest Kubernetes release brings significant performance improvements and new features.',
          url: '#',
          publishedAt: new Date().toISOString(),
          source: { name: 'Kubernetes Blog' }
        },
        {
          title: 'GitHub Actions Introduces New CI/CD Templates',
          description: 'Pre-built workflows for common DevOps tasks and deployment scenarios.',
          url: '#',
          publishedAt: new Date().toISOString(),
          source: { name: 'GitHub Blog' }
        },
        {
          title: 'Terraform Cloud Adds Advanced Policy Management',
          description: 'Enhanced policy-as-code capabilities for infrastructure governance.',
          url: '#',
          publishedAt: new Date().toISOString(),
          source: { name: 'HashiCorp Blog' }
        },
        {
          title: 'Prometheus 2.45 Released with Better Query Performance',
          description: 'Latest monitoring tool release focuses on query optimization and usability.',
          url: '#',
          publishedAt: new Date().toISOString(),
          source: { name: 'Prometheus Blog' }
        }
      ]
    };
  }
}

// Create a singleton instance
const apiService = new APIService();

export default apiService; 