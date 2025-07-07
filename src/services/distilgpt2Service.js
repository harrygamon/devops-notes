class DistilGPT2Service {
  constructor() {
    this.model = null;
    this.tokenizer = null;
    this.isLoading = false;
    this.isLoaded = false;
    this.loadPromise = null;
    this.transformersAvailable = false;
    this.pipeline = null;
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

    // First, try to initialize transformers.js
    const transformersReady = await this.initializeTransformers();
    if (!transformersReady) {
      console.error('❌ Transformers.js not available, cannot load model');
      return false;
    }

    this.isLoading = true;
    console.log(`🤖 Loading DistilGPT2 model... (attempt ${retryCount + 1})`);

    try {
      // Try with a smaller, faster model first
      console.log('📦 Attempting to load smaller model...');
      const modelPromise = this.pipeline('text-generation', 'microsoft/DialoGPT-small', {
        quantized: true,
        progress_callback: (progress) => {
          console.log(`📦 Loading progress: ${Math.round(progress * 100)}%`);
        }
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Small model loading timeout after 30 seconds')), 30000)
      );

      this.loadPromise = Promise.race([modelPromise, timeoutPromise]);
      this.model = await this.loadPromise;
      
      this.isLoaded = true;
      this.isLoading = false;
      console.log('✅ Smaller model loaded successfully!');
      return true;
    } catch (error) {
      console.error('❌ Smaller model failed, trying DistilGPT2...', error);
      
      try {
        // Fallback to DistilGPT2
        console.log('📦 Attempting to load DistilGPT2...');
        const fallbackPromise = this.pipeline('text-generation', 'distilgpt2', {
          quantized: true,
          progress_callback: (progress) => {
            console.log(`📦 DistilGPT2 loading progress: ${Math.round(progress * 100)}%`);
          }
        });

        const fallbackTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('DistilGPT2 loading timeout after 45 seconds')), 45000)
        );

        this.model = await Promise.race([fallbackPromise, fallbackTimeoutPromise]);
        
        this.isLoaded = true;
        this.isLoading = false;
        console.log('✅ DistilGPT2 model loaded successfully!');
        return true;
      } catch (fallbackError) {
        this.isLoading = false;
        console.error('❌ Both smaller model and DistilGPT2 failed:', fallbackError);
        
        // Retry logic (up to 2 retries)
        if (retryCount < 2) {
          console.log(`🔄 Retrying model load in 3 seconds... (attempt ${retryCount + 2})`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          return this.loadModel(retryCount + 1);
        }
        
        return false;
      }
    }
  }

  async generateResponse(prompt, maxLength = 100) {
    if (!this.isLoaded) {
      const loaded = await this.loadModel();
      if (!loaded) {
        throw new Error('Failed to load DistilGPT2 model');
      }
    }

    try {
      console.log('🤖 Generating response for:', prompt);
      
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
      
      // If response is empty or too short, try again with different parameters
      if (response.length < 10) {
        console.log('🔄 Response too short, trying again...');
        const retryResult = await this.model(prompt, {
          max_length: maxLength + 50,
          temperature: 0.8,
          top_p: 0.95,
          do_sample: true,
          pad_token_id: this.model.tokenizer.eos_token_id,
          eos_token_id: this.model.tokenizer.eos_token_id,
        });
        
        response = retryResult[0].generated_text;
        if (response.startsWith(prompt)) {
          response = response.substring(prompt.length);
        }
        response = response.trim();
      }

      console.log('✅ Generated response:', response);
      return response;
    } catch (error) {
      console.error('❌ Error generating response:', error);
      throw error;
    }
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
        provider: 'distilgpt2',
        model: 'distilgpt2',
        fallback: false
      };
    } catch (error) {
      console.error('❌ Chat error:', error);
      // Fall back to a simple response
      return {
        response: "I'm sorry, I'm having trouble generating a response right now. Please try asking your question again.",
        provider: 'distilgpt2',
        model: 'distilgpt2',
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
      model: this.isLoaded ? 'ai-model' : 'distilgpt2',
      provider: 'transformers.js',
      transformersAvailable: this.transformersAvailable,
      retryCount: 0
    };
  }
}

// Create a singleton instance
const distilGPT2Service = new DistilGPT2Service();

export default distilGPT2Service; 