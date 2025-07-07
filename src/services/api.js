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
      const success = await this.distilGPT2Service.loadModel();
      if (success) {
        console.log('✅ DistilGPT2 initialized successfully!');
      } else {
        console.log('⚠️ DistilGPT2 failed to load, will use fallback responses');
      }
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
      // Fall back to simple responses
      return this.generateFallbackChatResponse(messages);
    }
  }

  // Fallback chat response generator
  generateFallbackChatResponse(messages) {
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const question = lastUserMessage.toLowerCase();

    // Comprehensive DevOps knowledge base
    const responses = {
      'docker': {
        response: `🐳 **Docker Overview**\n\nDocker is a platform for developing, shipping, and running applications in containers. Here's what you need to know:\n\n**Key Concepts:**\n• **Containers**: Lightweight, isolated environments\n• **Images**: Templates for containers\n• **Dockerfile**: Instructions to build images\n\n**Essential Commands:**\n\`\`\`bash\n# Build an image\ndocker build -t myapp .\n\n# Run a container\ndocker run -d -p 3000:3000 myapp\n\n# List containers\ndocker ps\n\n# View logs\ndocker logs <container_id>\n\`\`\`\n\n**Best Practices:**\n• Use multi-stage builds for smaller images\n• Add .dockerignore to exclude unnecessary files\n• Use specific version tags, not 'latest'\n• Implement health checks\n• Run containers as non-root users`,
        provider: 'fallback',
        fallback: true
      },
      'kubernetes': {
        response: `☸️ **Kubernetes Overview**\n\nKubernetes is an open-source container orchestration platform that automates deployment, scaling, and management of containerized applications.\n\n**Core Concepts:**\n• **Pods**: Smallest deployable units\n• **Services**: Network abstraction for pods\n• **Deployments**: Declarative updates for pods\n• **ConfigMaps & Secrets**: Configuration management\n\n**Essential Commands:**\n\`\`\`bash\n# Get cluster info\nkubectl cluster-info\n\n# List pods\nkubectl get pods\n\n# Apply configuration\nkubectl apply -f deployment.yaml\n\n# View logs\nkubectl logs <pod_name>\n\`\`\`\n\n**Best Practices:**\n• Use resource limits and requests\n• Implement proper RBAC\n• Use namespaces for organization\n• Set up monitoring and logging\n• Use Helm for package management`,
        provider: 'fallback',
        fallback: true
      },
      'terraform': {
        response: `🏗️ **Terraform Overview**\n\nTerraform is an Infrastructure as Code (IaC) tool that lets you define and provision infrastructure using declarative configuration files.\n\n**Key Concepts:**\n• **Providers**: Cloud platforms (AWS, GCP, Azure)\n• **Resources**: Infrastructure components\n• **State**: Current infrastructure state\n• **Modules**: Reusable configurations\n\n**Essential Commands:**\n\`\`\`bash\n# Initialize Terraform\nterraform init\n\n# Plan changes\nterraform plan\n\n# Apply changes\nterraform apply\n\n# Destroy infrastructure\nterraform destroy\n\`\`\`\n\n**Best Practices:**\n• Use remote state storage\n• Implement proper tagging\n• Use modules for reusability\n• Set up CI/CD pipelines\n• Use workspaces for environments`,
        provider: 'fallback',
        fallback: true
      },
      'ci/cd': {
        response: `🔄 **CI/CD Pipeline Overview**\n\nCI/CD (Continuous Integration/Continuous Deployment) automates the software delivery process from code commit to production deployment.\n\n**CI (Continuous Integration):**\n• Automatically build and test code changes\n• Run unit tests, integration tests\n• Code quality checks (linting, security scans)\n• Early bug detection\n\n**CD (Continuous Deployment):**\n• Automatically deploy to production\n• Blue-green or rolling deployments\n• Feature flags for safe releases\n• Rollback capabilities\n\n**Popular Tools:**\n• **GitHub Actions**: Native GitHub CI/CD\n• **Jenkins**: Self-hosted automation server\n• **GitLab CI**: Integrated with GitLab\n• **CircleCI**: Cloud-based CI/CD\n\n**Best Practices:**\n• Automate everything possible\n• Use infrastructure as code\n• Implement proper testing\n• Monitor deployments\n• Use feature flags`,
        provider: 'fallback',
        fallback: true
      },
      'monitoring': {
        response: `📊 **Monitoring & Observability**\n\nModern monitoring involves collecting metrics, logs, and traces to understand system behavior and performance.\n\n**Three Pillars of Observability:**\n• **Metrics**: Numerical data (CPU, memory, response times)\n• **Logs**: Text-based event records\n• **Traces**: Request flow through distributed systems\n\n**Popular Tools:**\n• **Prometheus**: Metrics collection and alerting\n• **Grafana**: Visualization and dashboards\n• **ELK Stack**: Elasticsearch, Logstash, Kibana\n• **Jaeger**: Distributed tracing\n\n**Best Practices:**\n• Monitor the four golden signals (latency, traffic, errors, saturation)\n• Set up meaningful alerts\n• Use SLOs and SLIs\n• Implement distributed tracing\n• Centralize logging`,
        provider: 'fallback',
        fallback: true
      },
      'security': {
        response: `🛡️ **DevOps Security (DevSecOps)**\n\nDevSecOps integrates security into the DevOps pipeline, ensuring security is built into applications from the start.\n\n**Key Areas:**\n• **Code Security**: Static analysis, dependency scanning\n• **Container Security**: Image scanning, runtime protection\n• **Infrastructure Security**: IAM, network security\n• **Application Security**: OWASP guidelines, penetration testing\n\n**Security Tools:**\n• **SonarQube**: Code quality and security\n• **Trivy**: Container vulnerability scanner\n• **Snyk**: Dependency vulnerability management\n• **Falco**: Runtime security monitoring\n\n**Best Practices:**\n• Shift security left in the pipeline\n• Automate security testing\n• Use least privilege access\n• Implement secrets management\n• Regular security audits`,
        provider: 'fallback',
        fallback: true
      }
    };

    // Find the best matching response
    for (const [keyword, response] of Object.entries(responses)) {
      if (question.includes(keyword)) {
        return response;
      }
    }

    // Default response for general DevOps questions
    return {
      response: `🤖 **DevOps Assistant**\n\nI'm here to help with DevOps questions! I can provide guidance on:\n\n• 🐳 **Docker & Containers**\n• ☸️ **Kubernetes & Orchestration**\n• 🏗️ **Infrastructure as Code (Terraform, CloudFormation)**\n• 🔄 **CI/CD Pipelines**\n• 📊 **Monitoring & Observability**\n• 🛡️ **Security Best Practices**\n• ☁️ **Cloud Native Development**\n\nPlease ask a specific question about any DevOps topic, and I'll provide detailed, practical advice with code examples and best practices.`,
      provider: 'fallback',
      fallback: true
    };
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
      return this.generateFallbackCodeReview(code, context);
    }
  }

  // Fallback code review generator
  generateFallbackCodeReview(code, context) {
    const codeLower = code.toLowerCase();
    
    // Basic code review based on common patterns
    let review = `🔍 **Code Review Report**\n\n`;
    
    // Security checks
    if (codeLower.includes('password') || codeLower.includes('secret') || codeLower.includes('key')) {
      review += `⚠️ **Security Concern**: Found potential hardcoded credentials. Consider using environment variables or secrets management.\n\n`;
    }
    
    if (codeLower.includes('eval(') || codeLower.includes('innerhtml')) {
      review += `🚨 **Security Risk**: Found potentially dangerous code execution patterns. Avoid eval() and innerHTML for user input.\n\n`;
    }
    
    // Performance checks
    if (codeLower.includes('for(') && codeLower.includes('length')) {
      review += `⚡ **Performance**: Consider caching array length in loops for better performance.\n\n`;
    }
    
    if (codeLower.includes('settimeout') || codeLower.includes('setinterval')) {
      review += `⏱️ **Performance**: Remember to clear timeouts/intervals to prevent memory leaks.\n\n`;
    }
    
    // DevOps best practices
    if (codeLower.includes('localhost') || codeLower.includes('127.0.0.1')) {
      review += `🏗️ **DevOps**: Avoid hardcoded localhost URLs. Use environment variables for different environments.\n\n`;
    }
    
    if (codeLower.includes('console.log')) {
      review += `📝 **Logging**: Consider using a proper logging library instead of console.log for production.\n\n`;
    }
    
    // General recommendations
    review += `💡 **General Recommendations**:\n`;
    review += `• Add proper error handling and validation\n`;
    review += `• Include comprehensive documentation\n`;
    review += `• Follow consistent code formatting\n`;
    review += `• Add unit tests for critical functionality\n`;
    review += `• Consider code complexity and maintainability\n\n`;
    
    review += `📊 **Code Quality**: The code appears to be functional. Consider implementing the suggestions above for improved security, performance, and maintainability.`;
    
    return {
      review: review,
      provider: 'fallback',
      fallback: true
    };
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