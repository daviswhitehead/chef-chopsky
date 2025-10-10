import { Client } from "@elastic/elasticsearch";
import { ElasticVectorSearch } from "@langchain/community/vectorstores/elasticsearch";
import { RunnableConfig } from "@langchain/core/runnables";
import { VectorStoreRetriever } from "@langchain/core/vectorstores";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { PineconeStore } from "@langchain/pinecone";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { MongoClient } from "mongodb";
import { ensureConfiguration } from "./configuration.js";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { Embeddings } from "@langchain/core/embeddings";
import { config } from "../config/index.js";

async function makeElasticRetriever(
  configuration: ReturnType<typeof ensureConfiguration>,
  embeddingModel: Embeddings,
): Promise<VectorStoreRetriever> {
  const elasticUrl = process.env.ELASTICSEARCH_URL;
  if (!elasticUrl) {
    throw new Error("ELASTICSEARCH_URL environment variable is not defined");
  }

  let auth: { username: string; password: string } | { apiKey: string };
  if (configuration.retrieverProvider === "elastic-local") {
    const username = process.env.ELASTICSEARCH_USER;
    const password = process.env.ELASTICSEARCH_PASSWORD;
    if (!username || !password) {
      throw new Error(
        "ELASTICSEARCH_USER or ELASTICSEARCH_PASSWORD environment variable is not defined",
      );
    }
    auth = { username, password };
  } else {
    const apiKey = process.env.ELASTICSEARCH_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ELASTICSEARCH_API_KEY environment variable is not defined",
      );
    }
    auth = { apiKey };
  }

  const client = new Client({
    node: elasticUrl,
    auth,
  });

  // Import config to get environment-specific index name
  const { langchainIndexName, appEnv } = config;
  const indexName = `${langchainIndexName}-${appEnv}`;
  
  const vectorStore = new ElasticVectorSearch(embeddingModel, {
    client,
    indexName,
  });
  const searchKwargs = configuration.searchKwargs || {};
  const filter = {
    ...searchKwargs,
    user_id: configuration.userId,
    env: appEnv, // Add environment discriminator
  };

  return vectorStore.asRetriever({ filter });
}

async function makePineconeRetriever(
  configuration: ReturnType<typeof ensureConfiguration>,
  embeddingModel: Embeddings,
): Promise<VectorStoreRetriever> {
  // Import config to get environment-specific index name
  const { langchainIndexName, appEnv } = config;
  const indexName = `${langchainIndexName}-${appEnv}`;
  
  const pinecone = new PineconeClient();
  const pineconeIndex = pinecone.Index(indexName);
  const vectorStore = await PineconeStore.fromExistingIndex(embeddingModel, {
    pineconeIndex,
  });

  const searchKwargs = configuration.searchKwargs || {};
  const filter = {
    ...searchKwargs,
    user_id: configuration.userId,
    env: appEnv, // Add environment discriminator
  };

  return vectorStore.asRetriever({ filter });
}

async function makeMongoDBRetriever(
  configuration: ReturnType<typeof ensureConfiguration>,
  embeddingModel: Embeddings,
): Promise<VectorStoreRetriever> {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not defined");
  }
  
  // Import config to get environment-specific namespace prefix
  const { mongoNamespacePrefix, appEnv } = config;
  const client = new MongoClient(process.env.MONGODB_URI);
  const namespace = `${mongoNamespacePrefix}_${appEnv}_${configuration.userId}`;
  const [dbName, collectionName] = namespace.split(".");
  const collection = client.db(dbName).collection(collectionName);
  const vectorStore = new MongoDBAtlasVectorSearch(embeddingModel, {
    collection: collection,
    textKey: "text",
    embeddingKey: "embedding",
    indexName: "vector_index",
  });
  const searchKwargs = { ...configuration.searchKwargs };
  searchKwargs.preFilter = {
    ...searchKwargs.preFilter,
    user_id: { $eq: configuration.userId },
    env: { $eq: appEnv }, // Add environment discriminator
  };
  return vectorStore.asRetriever({ filter: searchKwargs });
}

async function makeTextEmbeddings(modelName: string): Promise<Embeddings> {
  /**
   * Connect to the configured text encoder.
   */
  const index = modelName.indexOf("/");
  let provider, model;
  if (index === -1) {
    model = modelName;
    provider = "openai"; // Assume openai if no provider included
  } else {
    provider = modelName.slice(0, index);
    model = modelName.slice(index + 1);
  }
  
  // Get API key from environment variables
  const apiKey = process.env.OPENAI_API_KEY;
  
  switch (provider) {
    case "openai": {
      // Dynamic import to avoid loading LangChain modules before env-loader
      const { OpenAIEmbeddings } = await import("@langchain/openai");
      return new OpenAIEmbeddings({ 
        model,
        ...(apiKey && { apiKey })
      });
    }
    case "cohere": {
      // Dynamic import to avoid loading LangChain modules before env-loader
      const { CohereEmbeddings } = await import("@langchain/cohere");
      return new CohereEmbeddings({ model });
    }
    default:
      throw new Error(`Unsupported embedding provider: ${provider}`);
  }
}

async function makeMemoryRetriever(
  configuration: ReturnType<typeof ensureConfiguration>,
  embeddingModel: Embeddings,
): Promise<VectorStoreRetriever> {
  /**
   * Create a simple in-memory vector store for testing and development.
   * Perfect for Chef Chopsky when you want to test without external services!
   */
  const vectorStore = new MemoryVectorStore(embeddingModel);
  
  // Import config to get environment discriminator
  const { appEnv } = config;
  
  // Add some sample cooking documents for Chef Chopsky with environment discriminator
  const sampleDocs = [
    {
      pageContent: "Quinoa is a complete protein grain that's perfect for CSA meals. It cooks in 15 minutes and pairs well with roasted vegetables.",
      metadata: { user_id: configuration.userId, type: "ingredient", name: "quinoa", env: appEnv }
    },
    {
      pageContent: "Kale is a nutrient-dense leafy green from CSAs. It's great sautéed with garlic, added to smoothies, or baked into chips.",
      metadata: { user_id: configuration.userId, type: "ingredient", name: "kale", env: appEnv }
    },
    {
      pageContent: "Fresh tomatoes from CSAs are perfect for caprese salads, pasta sauces, or roasted with herbs. Store at room temperature.",
      metadata: { user_id: configuration.userId, type: "ingredient", name: "tomatoes", env: appEnv }
    },
    {
      pageContent: "CSA vegetables are seasonal and fresh. Plan meals around what you receive each week to reduce waste and eat seasonally.",
      metadata: { user_id: configuration.userId, type: "tip", category: "meal_planning", env: appEnv }
    }
  ];

  // Add the sample documents to the vector store
  await vectorStore.addDocuments(sampleDocs);
  
  return vectorStore.asRetriever({ 
    k: configuration.searchKwargs.k || 3 
  });
}

export async function makeRetriever(
  config: RunnableConfig,
): Promise<VectorStoreRetriever> {
  const configuration = ensureConfiguration(config);
  const embeddingModel = await makeTextEmbeddings(configuration.embeddingModel);

  const userId = configuration.userId;
  if (!userId) {
    throw new Error("Please provide a valid user_id in the configuration.");
  }

  switch (configuration.retrieverProvider) {
    case "elastic":
    case "elastic-local":
      return makeElasticRetriever(configuration, embeddingModel);
    case "pinecone":
      return makePineconeRetriever(configuration, embeddingModel);
    case "mongodb":
      return makeMongoDBRetriever(configuration, embeddingModel);
    case "memory":
      return makeMemoryRetriever(configuration, embeddingModel);
    default:
      throw new Error(
        `Unrecognized retrieverProvider in configuration: ${configuration.retrieverProvider}`,
      );
  }
}
