// Configuration for external APIs and services
export const config = {
  // NewsAPI configuration
  // Get a free API key from: https://newsapi.org/
  // The demo key has limited requests, so get your own for production use
  newsApi: {
    baseUrl: 'https://newsapi.org/v2',
    apiKey: '5f3660bffcef4ad49b06e100946f3d44', // Replace with your actual API key
    endpoints: {
      everything: '/everything',
      topHeadlines: '/top-headlines'
    },
    defaultParams: {
      q: 'devops',
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: 10
    }
  }
};

// Helper function to build news API URL
export const buildNewsApiUrl = (endpoint = 'everything', additionalParams = {}) => {
  const params = new URLSearchParams({
    ...config.newsApi.defaultParams,
    ...additionalParams,
    apiKey: config.newsApi.apiKey
  });
  
  return `${config.newsApi.baseUrl}${config.newsApi.endpoints[endpoint]}?${params}`;
}; 