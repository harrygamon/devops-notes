class DistilGPT2Service {
  constructor() {
    this.model = null;
    this.tokenizer = null;
    this.isLoading = false;
    this.isLoaded = false;
    this.loadPromise = null;
    this.transformersAvailable = false;
    this.pipeline = null;
    this.useLightweightAI = true; // Use lightweight AI by default
    this.backgroundLoading = false;
    this.loadingProgress = 0;
    this.estimatedTime = 0;
    this.startTime = null;
  }

  async initializeTransformers() {
    if (this.transformersAvailable) {
      return true;
    }

    try {
      console.log('🔧 Initializing transformers.js...');
      
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('Transformers.js requires a browser environment');
      }

      // Check if WebGL is available (required for transformers.js)
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        throw new Error('WebGL not available - transformers.js requires WebGL support');
      }
      
      // Add timeout to prevent hanging
      const importPromise = import('@xenova/transformers');
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Transformers.js import timeout after 15 seconds')), 15000)
      );
      
      const transformers = await Promise.race([importPromise, timeoutPromise]);
      this.pipeline = transformers.pipeline;
      this.transformersAvailable = true;
      console.log('✅ Transformers.js initialized successfully!');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize transformers.js:', error);
      this.transformersAvailable = false;
      return false;
    }
  }

  async loadModel(retryCount = 0) {
    if (this.isLoaded) {
      return true;
    }

    if (this.isLoading) {
      return this.loadPromise;
    }

    // Start with lightweight AI immediately
    console.log('🤖 Using lightweight AI service...');
    this.isLoaded = true;
    this.isLoading = false;
    this.useLightweightAI = true;

    // Start background loading of DistilGPT2
    this.startBackgroundLoading();
    
    return true;
  }

  async startBackgroundLoading() {
    if (this.backgroundLoading) {
      return;
    }

    this.backgroundLoading = true;
    this.loadingProgress = 0;
    this.startTime = Date.now();
    console.log('🚀 Starting background DistilGPT2 installation...');

    try {
      // Step 1: Initialize transformers.js (10% of progress)
      this.loadingProgress = 5;
      const transformersReady = await this.initializeTransformers();
      if (!transformersReady) {
        console.log('⚠️ Transformers.js not available, staying with lightweight AI');
        this.backgroundLoading = false;
        return;
      }
      this.loadingProgress = 10;

      // Step 2: Load DistilGPT2 model (80% of progress)
      console.log('📦 Loading DistilGPT2 model in background...');
      this.loadingProgress = 15;
      
      const modelPromise = this.pipeline('text-generation', 'distilgpt2', {
        quantized: true,
        progress_callback: (progress) => {
          // Map model loading progress from 0-1 to 15-90%
          this.loadingProgress = 15 + (progress * 75);
          this.updateEstimatedTime();
          console.log(`📦 Background loading progress: ${Math.round(this.loadingProgress)}%`);
        }
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Background model loading timeout after 2 minutes')), 120000)
      );

      this.model = await Promise.race([modelPromise, timeoutPromise]);
      
      // Step 3: Finalize (10% of progress)
      this.loadingProgress = 95;
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
      this.loadingProgress = 100;
      
      this.isLoaded = true;
      this.useLightweightAI = false;
      this.backgroundLoading = false;
      console.log('✅ DistilGPT2 loaded successfully in background!');
      
      // Notify any listeners that the model is ready
      this.notifyModelReady();
      
    } catch (error) {
      console.error('❌ Background DistilGPT2 loading failed:', error);
      this.backgroundLoading = false;
      this.loadingProgress = 0;
      // Stay with lightweight AI
    }
  }

  updateEstimatedTime() {
    if (this.startTime && this.loadingProgress > 10) {
      const elapsed = (Date.now() - this.startTime) / 1000;
      const progressDecimal = this.loadingProgress / 100;
      const totalEstimated = elapsed / progressDecimal;
      this.estimatedTime = Math.round(totalEstimated - elapsed);
    }
  }

  notifyModelReady() {
    // Dispatch a custom event to notify the UI
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('distilgpt2-ready', {
        detail: { model: 'distilgpt2', provider: 'transformers.js' }
      }));
    }
  }

  async generateResponse(prompt, maxLength = 100) {
    if (!this.isLoaded) {
      const loaded = await this.loadModel();
      if (!loaded) {
        throw new Error('Failed to load AI service');
      }
    }

    try {
      // Use DistilGPT2 if available, otherwise use lightweight AI
      if (this.model && !this.useLightweightAI) {
        console.log('🤖 Generating DistilGPT2 response for:', prompt);
        
        const result = await this.model(prompt, {
          max_length: maxLength,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
          pad_token_id: this.model.tokenizer.eos_token_id,
          eos_token_id: this.model.tokenizer.eos_token_id,
        });

        let response = result[0].generated_text;
        
        // Remove the original prompt from the response
        if (response.startsWith(prompt)) {
          response = response.substring(prompt.length);
        }
        
        // Clean up the response
        response = response.trim();
        
        console.log('✅ Generated DistilGPT2 response:', response);
        return response;
      } else {
        console.log('🤖 Generating lightweight AI response for:', prompt);
        
        // Use lightweight AI response generation
        const response = this.generateLightweightResponse(prompt);
        
        console.log('✅ Generated lightweight response:', response);
        return response;
      }
    } catch (error) {
      console.error('❌ Error generating response:', error);
      // Fallback to lightweight AI
      console.log('🔄 Falling back to lightweight AI...');
      return this.generateLightweightResponse(prompt);
    }
  }

  generateLightweightResponse(prompt) {
    // Simple pattern matching for common DevOps questions
    const question = prompt.toLowerCase();
    
    if (question.includes('docker')) {
      return `🐳 **Docker Solution**\n\nBased on your question about Docker, here's a practical solution:\n\n**Key Points:**\n• Use multi-stage builds for smaller images\n• Implement proper health checks\n• Use specific version tags\n• Add .dockerignore files\n\n**Example Dockerfile:**\n\`\`\`dockerfile\nFROM node:18-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\n\nFROM node:18-alpine\nWORKDIR /app\nCOPY --from=builder /app/node_modules ./node_modules\nCOPY . .\nEXPOSE 3000\nCMD ["npm", "start"]\n\`\`\`\n\nThis approach ensures your Docker containers are optimized, secure, and production-ready.`;
    }
    
    if (question.includes('kubernetes') || question.includes('k8s')) {
      return `☸️ **Kubernetes Solution**\n\nFor your Kubernetes question, here's a comprehensive approach:\n\n**Best Practices:**\n• Use namespaces for organization\n• Implement resource limits\n• Use ConfigMaps and Secrets\n• Set up proper RBAC\n\n**Example Deployment:**\n\`\`\`yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-app\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: my-app\n  template:\n    metadata:\n      labels:\n        app: my-app\n    spec:\n      containers:\n      - name: my-app\n        image: my-app:latest\n        ports:\n        - containerPort: 3000\n        resources:\n          limits:\n            memory: "512Mi"\n            cpu: "500m"\n\`\`\`\n\nThis ensures your Kubernetes deployment is scalable and maintainable.`;
    }
    
    if (question.includes('terraform') || question.includes('iac')) {
      return `🏗️ **Infrastructure as Code Solution**\n\nFor your Terraform/IaC question:\n\n**Key Principles:**\n• Use remote state storage\n• Implement proper tagging\n• Use modules for reusability\n• Set up CI/CD pipelines\n\n**Example Terraform Configuration:**\n\`\`\`hcl\nterraform {\n  required_version = ">= 1.0"\n  backend "s3" {\n    bucket = "my-terraform-state"\n    key    = "prod/terraform.tfstate"\n  }\n}\n\nresource "aws_instance" "web" {\n  ami           = "ami-12345678"\n  instance_type = "t3.micro"\n  tags = {\n    Name = "WebServer"\n    Environment = "Production"\n  }\n}\n\`\`\`\n\nThis approach ensures your infrastructure is version-controlled and reproducible.`;
    }
    
    if (question.includes('ci/cd') || question.includes('pipeline')) {
      return `🔄 **CI/CD Pipeline Solution**\n\nFor your CI/CD question:\n\n**Pipeline Stages:**\n• Build and test\n• Security scanning\n• Deploy to staging\n• Deploy to production\n\n**Example GitHub Actions Workflow:**\n\`\`\`yaml\nname: CI/CD Pipeline\non: [push]\n\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n    - uses: actions/checkout@v3\n    - name: Build and test\n      run: |\n        npm install\n        npm test\n    - name: Deploy\n      run: echo "Deploying..."\n\`\`\`\n\nThis ensures automated, reliable deployments with proper testing.`;
    }
    
    // Default response for other questions
    return `🤖 **AI Assistant Response**\n\nI understand your question about DevOps. Here's my analysis:\n\n**Key Considerations:**\n• Always prioritize security and best practices\n• Use automation wherever possible\n• Implement proper monitoring and logging\n• Follow the principle of infrastructure as code\n\n**Recommendations:**\n• Start with small, incremental changes\n• Test thoroughly in staging environments\n• Document your processes and configurations\n• Use version control for all code and configurations\n\nWould you like me to elaborate on any specific aspect of your question?`;
  }

  async chat(messages) {
    try {
      // Convert conversation history to a prompt
      const lastMessage = messages[messages.length - 1];
      const userQuestion = lastMessage.content;
      
      // Create a context-aware prompt for DevOps questions
      const prompt = this.createDevOpsPrompt(userQuestion, messages);
      
      const response = await this.generateResponse(prompt, 150);
      
      return {
        response: response,
        provider: this.useLightweightAI ? 'lightweight-ai' : 'distilgpt2',
        model: this.useLightweightAI ? 'lightweight-ai' : 'distilgpt2',
        fallback: false
      };
    } catch (error) {
      console.error('❌ Chat error:', error);
      // Fall back to a simple response
      return {
        response: "I'm sorry, I'm having trouble generating a response right now. Please try asking your question again.",
        provider: 'lightweight-ai',
        model: 'lightweight-ai',
        fallback: true
      };
    }
  }

  createDevOpsPrompt(userQuestion, messages) {
    // Create a context-aware prompt for better DevOps responses
    const devOpsContext = `You are a helpful DevOps assistant. Answer questions about Docker, Kubernetes, CI/CD, monitoring, security, and other DevOps topics. Keep responses concise and practical.

Question: ${userQuestion}

Answer:`;
    
    return devOpsContext;
  }

  getStatus() {
    return {
      available: this.isLoaded,
      loading: this.isLoading,
      model: this.useLightweightAI ? 'lightweight-ai' : 'distilgpt2',
      provider: this.useLightweightAI ? 'lightweight-ai' : 'distilgpt2',
      transformersAvailable: this.transformersAvailable,
      backgroundLoading: this.backgroundLoading,
      loadingProgress: this.loadingProgress,
      estimatedTime: this.estimatedTime,
      retryCount: 0
    };
  }
}

// Create a singleton instance
const distilGPT2Service = new DistilGPT2Service();

export default distilGPT2Service; 