// Client-side API service with Ollama support and fallback responses
class APIService {
  constructor() {
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://your-backend-url.com' // Replace with your actual backend URL
      : 'http://localhost:3001';
    this.isBackendAvailable = false;
    this.checkBackendAvailability();
    this.ollamaURL = 'http://localhost:11434';
    this.isOllamaAvailable = false;
    this.model = 'qwen2.5:3b'; // Qwen3 model
    this.checkOllamaAvailability();
  }

  async checkBackendAvailability() {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        timeout: 3000
      });
      this.isBackendAvailable = response.ok;
    } catch (error) {
      this.isBackendAvailable = false;
      console.log('Backend not available, using fallback responses');
    }
  }

  async checkOllamaAvailability() {
    try {
      const response = await fetch(`${this.ollamaURL}/api/tags`, {
        method: 'GET',
        timeout: 3000
      });
      if (response.ok) {
        const data = await response.json();
        this.isOllamaAvailable = data.models && data.models.length > 0;
        console.log('Ollama available:', this.isOllamaAvailable);
        console.log('Available models:', data.models ? data.models.map(m => m.name) : 'No models');
        
        // Check if Qwen model is available (check for various possible names)
        if (this.isOllamaAvailable) {
          const hasQwen = data.models.some(model => 
            model.name.includes('qwen') || 
            model.name.includes('Qwen') ||
            model.name.includes('qwen2.5') ||
            model.name.includes('Qwen2.5')
          );
          if (hasQwen) {
            console.log('Qwen model found!');
            // Update model name to match what's actually available
            const qwenModel = data.models.find(model => 
              model.name.includes('qwen') || 
              model.name.includes('Qwen') ||
              model.name.includes('qwen2.5') ||
              model.name.includes('Qwen2.5')
            );
            if (qwenModel) {
              this.model = qwenModel.name;
              console.log('Using model:', this.model);
            }
          } else {
            console.log('Qwen model not found. Available models:', data.models.map(m => m.name));
          }
        }
      }
    } catch (error) {
      this.isOllamaAvailable = false;
      console.log('Ollama not available, using fallback responses:', error.message);
    }
  }

  // AI Chat endpoint with Ollama support
  async chat(messages) {
    if (this.isOllamaAvailable) {
      try {
        const response = await fetch(`${this.ollamaURL}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.model,
            messages: messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            stream: false,
            options: {
              temperature: 0.7,
              top_p: 0.9,
              max_tokens: 2048
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          return {
            response: data.message.content,
            provider: 'ollama',
            model: this.model,
            fallback: false
          };
        }
      } catch (error) {
        console.error('Ollama chat error:', error);
        // Fall back to local responses
      }
    }

    // Fallback response
    return this.generateFallbackChatResponse(messages);
  }

  // Code Review endpoint with Ollama support
  async codeReview(code, context) {
    if (this.isOllamaAvailable) {
      try {
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

        const response = await fetch(`${this.ollamaURL}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.model,
            prompt: prompt,
            stream: false,
            options: {
              temperature: 0.3,
              top_p: 0.9,
              max_tokens: 2048
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          return {
            review: data.response,
            provider: 'ollama',
            model: this.model,
            fallback: false
          };
        }
      } catch (error) {
        console.error('Ollama code review error:', error);
        // Fall back to local responses
      }
    }

    // Fallback response
    return this.generateFallbackCodeReview(code, context);
  }

  // News endpoint (keeping fallback only for now)
  async getNews() {
    return this.getFallbackNews();
  }

  // Check if Ollama is available and get model info
  async getOllamaStatus() {
    try {
      console.log('Checking Ollama status at:', this.ollamaURL);
      const response = await fetch(`${this.ollamaURL}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        console.log('Ollama status response:', data);
        
        // Check if Qwen model is available
        const hasQwen = data.models && data.models.some(model => 
          model.name.includes('qwen') || 
          model.name.includes('Qwen') ||
          model.name.includes('qwen2.5') ||
          model.name.includes('Qwen2.5')
        );
        
        return {
          available: true,
          models: data.models || [],
          currentModel: this.model,
          hasQwenModel: hasQwen
        };
      } else {
        console.error('Ollama API returned error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error checking Ollama status:', error);
    }
    return {
      available: false,
      models: [],
      currentModel: null,
      hasQwenModel: false
    };
  }

  // Pull Qwen3 model if not available
  async pullQwenModel() {
    try {
      console.log('Pulling Qwen3 model...');
      const response = await fetch(`${this.ollamaURL}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: this.model
        })
      });

      if (response.ok) {
        console.log('Qwen3 model pulled successfully');
        this.isOllamaAvailable = true;
        return true;
      }
    } catch (error) {
      console.error('Error pulling Qwen3 model:', error);
    }
    return false;
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

  // Fallback code review generator
  generateFallbackCodeReview(code, context) {
    const codeLength = code.length;
    const hasDocker = code.toLowerCase().includes('docker');
    const hasKubernetes = code.toLowerCase().includes('kubernetes') || code.toLowerCase().includes('k8s');
    const hasTerraform = code.toLowerCase().includes('terraform');
    const hasSecurity = code.toLowerCase().includes('password') || code.toLowerCase().includes('secret') || code.toLowerCase().includes('token');
    const hasYaml = code.toLowerCase().includes('yaml') || code.toLowerCase().includes('yml');
    const hasJson = code.toLowerCase().includes('json');
    
    let review = `🔍 **Code Review Analysis**\n\n`;
    
    // Code quality assessment
    review += `✅ **Code Quality:**\n`;
    if (codeLength < 100) {
      review += `• Code is concise and focused\n`;
    } else if (codeLength < 500) {
      review += `• Code length is reasonable\n`;
    } else {
      review += `• Consider breaking down large code blocks into smaller functions\n`;
    }
    
    // Security assessment
    review += `\n🛡️ **Security:**\n`;
    if (hasSecurity) {
      review += `• ⚠️ Found potential security-sensitive content (passwords, secrets, tokens)\n`;
      review += `• 🔒 Ensure secrets are properly managed using environment variables or secret management systems\n`;
      review += `• 📝 Add input validation and sanitization\n`;
    } else {
      review += `• ✅ No obvious security vulnerabilities detected\n`;
    }
    
    // DevOps best practices
    review += `\n🚀 **DevOps Best Practices:**\n`;
    if (hasDocker) {
      review += `• ✅ Docker configuration detected\n`;
      review += `• 📦 Consider multi-stage builds for smaller images\n`;
      review += `• 🔍 Add health checks to containers\n`;
      review += `• 🛡️ Use non-root users in containers\n`;
    }
    
    if (hasKubernetes) {
      review += `• ✅ Kubernetes configuration detected\n`;
      review += `• 📊 Add resource limits and requests\n`;
      review += `• 🔄 Implement proper rolling update strategies\n`;
      review += `• 🔒 Use RBAC for access control\n`;
    }
    
    if (hasTerraform) {
      review += `• ✅ Infrastructure as Code detected\n`;
      review += `• 📝 Add proper tagging and documentation\n`;
      review += `• 🔒 Use remote state storage with encryption\n`;
      review += `• 🔄 Use workspaces for environment separation\n`;
    }

    if (hasYaml || hasJson) {
      review += `• ✅ Configuration file detected\n`;
      review += `• 📝 Validate syntax and structure\n`;
      review += `• 🔍 Use linters for configuration files\n`;
    }
    
    // General recommendations
    review += `\n📈 **Recommendations:**\n`;
    review += `• Add comprehensive error handling\n`;
    review += `• Implement logging and monitoring\n`;
    review += `• Add automated testing\n`;
    review += `• Consider implementing CI/CD pipelines\n`;
    review += `• Add documentation and comments\n`;
    review += `• Use version control for all configurations\n`;
    
    if (context) {
      review += `\n📋 **Context Notes:**\n${context}\n`;
    }
    
    return {
      review,
      provider: 'fallback',
      fallback: true
    };
  }

  // Fallback news
  getFallbackNews() {
    return {
      status: 'ok',
      articles: [
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
        }
      ],
      fallback: true
    };
  }
}

export default new APIService(); 