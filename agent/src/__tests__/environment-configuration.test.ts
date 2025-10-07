import { jest, describe, it, beforeEach, expect } from '@jest/globals';
import { ensureConfiguration } from '../retrieval_graph/configuration.js';

describe('Environment Configuration', () => {
  describe('Production Safety Guards', () => {
    beforeEach(() => {
      // Reset environment variables
      delete process.env.NODE_ENV;
      delete process.env.OPENAI_API_KEY;
      delete process.env.RETRIEVER_PROVIDER;
    });

    it('should fail fast in production with invalid API key', () => {
      process.env.NODE_ENV = 'production';
      process.env.OPENAI_API_KEY = 'test-key';
      
      // Mock process.exit to prevent actual exit
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });
      
      expect(() => {
        // Re-import config to trigger validation
        jest.resetModules();
        // Use dynamic import for ES modules
        import('../config/index.js');
      }).toThrow('process.exit called');
      
      mockExit.mockRestore();
    });

    it('should fail fast in production with memory retriever', () => {
      process.env.NODE_ENV = 'production';
      process.env.OPENAI_API_KEY = 'sk-real-key';
      process.env.RETRIEVER_PROVIDER = 'memory';
      
      // Mock process.exit to prevent actual exit
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });
      
      expect(() => {
        // Re-import config to trigger validation
        jest.resetModules();
        // Use dynamic import for ES modules
        import('../config/index.js');
      }).toThrow('process.exit called');
      
      mockExit.mockRestore();
    });

    it('should allow production with valid configuration', () => {
      process.env.NODE_ENV = 'production';
      process.env.OPENAI_API_KEY = 'sk-real-key';
      process.env.RETRIEVER_PROVIDER = 'pinecone';
      
      // Mock process.exit to prevent actual exit
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });
      
      expect(() => {
        // Re-import config to trigger validation
        jest.resetModules();
        // Use dynamic import for ES modules
        import('../config/index.js');
      }).not.toThrow();
      
      mockExit.mockRestore();
    });
  });

  describe('Environment-Driven Configuration', () => {
    beforeEach(() => {
      // Reset environment variables
      delete process.env.RETRIEVER_PROVIDER;
      delete process.env.EMBEDDING_MODEL;
      delete process.env.LANGCHAIN_INDEX_NAME;
      delete process.env.MONGO_NAMESPACE_PREFIX;
      delete process.env.APP_ENV;
    });

    it('should use environment variables for retriever configuration', async () => {
      process.env.RETRIEVER_PROVIDER = 'pinecone';
      process.env.EMBEDDING_MODEL = 'openai/text-embedding-3-large';
      
      // Re-import config to get updated values
      jest.resetModules();
      const { config: updatedConfig } = await import('../config/index.js');
      
      expect(updatedConfig.retrieverProvider).toBe('pinecone');
      expect(updatedConfig.embeddingModel).toBe('openai/text-embedding-3-large');
    });

    it('should use defaults when environment variables are not set', async () => {
      // Re-import config to get default values
      jest.resetModules();
      const { config: defaultConfig } = await import('../config/index.js');
      
      expect(defaultConfig.retrieverProvider).toBe('memory');
      expect(defaultConfig.embeddingModel).toBe('openai/text-embedding-3-small');
      expect(defaultConfig.langchainIndexName).toBe('chef-chopsky');
      expect(defaultConfig.mongoNamespacePrefix).toBe('retrieval');
    });

    it('should set appEnv based on NODE_ENV', async () => {
      process.env.NODE_ENV = 'production';
      
      // Re-import config to get updated values
      jest.resetModules();
      const { config: prodConfig } = await import('../config/index.js');
      
      expect(prodConfig.appEnv).toBe('production');
    });

    it('should use APP_ENV when explicitly set', async () => {
      process.env.APP_ENV = 'staging';
      
      // Re-import config to get updated values
      jest.resetModules();
      const { config: stagingConfig } = await import('../config/index.js');
      
      expect(stagingConfig.appEnv).toBe('staging');
    });
  });

  describe('Configuration Integration', () => {
    it('should include environment discriminator in searchKwargs', () => {
      const configuration = ensureConfiguration({
        configurable: {
          userId: 'test-user',
          searchKwargs: { k: 5 }
        }
      });
      
      expect(configuration.searchKwargs.env).toBeDefined();
      expect(configuration.searchKwargs.k).toBe(5);
    });

    it('should use environment-driven retriever provider', async () => {
      process.env.RETRIEVER_PROVIDER = 'elastic';
      process.env.EMBEDDING_MODEL = 'cohere/embed-english-v3.0';
      
      // Re-import config to get updated values
      jest.resetModules();
      
      const configuration = ensureConfiguration({
        configurable: {
          userId: 'test-user'
        }
      });
      
      expect(configuration.retrieverProvider).toBe('elastic');
      expect(configuration.embeddingModel).toBe('cohere/embed-english-v3.0');
    });
  });
});