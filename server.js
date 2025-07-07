import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Use environment variable for Ollama API URL
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';

// Fallback response generator for when Ollama is not available
const generateFallbackResponse = (conversationContext) => {
  const lastUserMessage = conversationContext.split('\n').find(line => line.startsWith('User: '));
  const question = lastUserMessage ? lastUserMessage.replace('User: ', '') : '';
  
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
};

// Fallback code review generator
const generateFallbackCodeReview = (code, context) => {
  const codeLength = code.length;
  const hasDocker = code.toLowerCase().includes('docker');
  const hasKubernetes = code.toLowerCase().includes('kubernetes') || code.toLowerCase().includes('k8s');
  const hasTerraform = code.toLowerCase().includes('terraform');
  const hasSecurity = code.toLowerCase().includes('password') || code.toLowerCase().includes('secret') || code.toLowerCase().includes('token');
  
  let review = `🔍 **Code Review Analysis**\n\n`;
  
  // Code quality assessment
  review += `✅ **Code Quality:**\n`;
  if (codeLength < 100) {
    review += `- Code is concise and focused\n`;
  } else if (codeLength < 500) {
    review += `- Code length is reasonable\n`;
  } else {
    review += `- Consider breaking down large code blocks into smaller functions\n`;
  }
  
  // Security assessment
  review += `\n🛡️ **Security:**\n`;
  if (hasSecurity) {
    review += `- ⚠️ Found potential security-sensitive content (passwords, secrets, tokens)\n`;
    review += `- 🔒 Ensure secrets are properly managed using environment variables or secret management systems\n`;
    review += `- 📝 Add input validation and sanitization\n`;
  } else {
    review += `- ✅ No obvious security vulnerabilities detected\n`;
  }
  
  // DevOps best practices
  review += `\n🚀 **DevOps Best Practices:**\n`;
  if (hasDocker) {
    review += `- ✅ Docker configuration detected\n`;
    review += `- 📦 Consider multi-stage builds for smaller images\n`;
    review += `- 🔍 Add health checks to containers\n`;
  }
  
  if (hasKubernetes) {
    review += `- ✅ Kubernetes configuration detected\n`;
    review += `- 📊 Add resource limits and requests\n`;
    review += `- 🔄 Implement proper rolling update strategies\n`;
  }
  
  if (hasTerraform) {
    review += `- ✅ Infrastructure as Code detected\n`;
    review += `- 📝 Add proper tagging and documentation\n`;
    review += `- 🔒 Use remote state storage with encryption\n`;
  }
  
  // General recommendations
  review += `\n📈 **Recommendations:**\n`;
  review += `- Add comprehensive error handling\n`;
  review += `- Implement logging and monitoring\n`;
  review += `- Add automated testing\n`;
  review += `- Consider implementing CI/CD pipelines\n`;
  review += `- Add documentation and comments\n`;
  
  if (context) {
    review += `\n📋 **Context Notes:**\n${context}\n`;
  }
  
  return review;
};

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Chat completion endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Build conversation context from messages
    const conversationContext = messages.map(msg => {
      if (msg.role === 'system') {
        return `System: ${msg.content}`;
      } else if (msg.role === 'user') {
        return `User: ${msg.content}`;
      } else if (msg.role === 'assistant') {
        return `Assistant: ${msg.content}`;
      }
      return msg.content;
    }).join('\n');

    // Use Ollama API
    try {
      const ollamaResponse = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen2.5-coder:latest',
          prompt: `You are a DevOps expert assistant. Provide detailed, practical advice for DevOps questions. Keep responses concise but informative.\n\n${conversationContext}\n\nAssistant:`,
          stream: false
        })
      });
      
      if (!ollamaResponse.ok) {
        throw new Error(`Ollama API request failed: ${ollamaResponse.status}`);
      }
      
      const data = await ollamaResponse.json();
      const response = data.response || 'Sorry, I could not generate a response.';
      
      res.json({ 
        response,
        provider: 'ollama'
      });
      
    } catch (ollamaError) {
      console.error('Ollama API Error:', ollamaError);
      // Provide a more helpful fallback response instead of error
      const fallbackResponse = generateFallbackResponse(conversationContext);
      res.json({ 
        response: fallbackResponse,
        provider: 'fallback',
        fallback: true
      });
    }

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'API error',
      details: error.message
    });
  }
});

// AI Code Review endpoint
app.post('/api/code-review', async (req, res) => {
  try {
    const { code, context } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    // Build the prompt for code review
    const reviewPrompt = `You are an expert DevOps engineer and code reviewer. Please review the following code and provide detailed feedback focusing on:

1. **Code Quality**: Best practices, readability, maintainability
2. **Security**: Potential vulnerabilities, security best practices
3. **Performance**: Optimization opportunities, resource usage
4. **DevOps Best Practices**: Infrastructure considerations, deployment strategies

Code to review:
\`\`\`
${code}
\`\`\`

Context: ${context || 'No additional context provided'}

Please provide a comprehensive review with specific recommendations.`;

    // Use Ollama API for code review
    try {
      const ollamaResponse = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen2.5-coder:latest',
          prompt: reviewPrompt,
          stream: false
        })
      });
      
      if (!ollamaResponse.ok) {
        throw new Error(`Ollama API request failed: ${ollamaResponse.status}`);
      }
      
      const data = await ollamaResponse.json();
      const review = data.response || 'Sorry, I could not generate a code review.';
      
      res.json({ 
        review,
        provider: 'ollama'
      });
      
    } catch (ollamaError) {
      console.error('Ollama API Error:', ollamaError);
      // Provide fallback code review
      const fallbackReview = generateFallbackCodeReview(code, context);
      res.json({ 
        review: fallbackReview,
        provider: 'fallback',
        fallback: true
      });
    }

  } catch (error) {
    console.error('Code Review API Error:', error);
    res.status(500).json({ 
      error: 'Code review API error',
      details: error.message
    });
  }
});

// DevOps News endpoint (simulated)
app.get('/api/news', (req, res) => {
  const news = [
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
  ];

  res.json({
    status: 'ok',
    articles: news,
    fallback: true
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 DevOps Notes Server running on port ${PORT}`);
  console.log(`📡 AI Assistant available at http://localhost:${PORT}/api/chat`);
  console.log(`🔍 Code Review available at http://localhost:${PORT}/api/code-review`);
  console.log(`📰 News available at http://localhost:${PORT}/api/news`);
  console.log(`💚 Health check at http://localhost:${PORT}/health`);
});

export default app; 