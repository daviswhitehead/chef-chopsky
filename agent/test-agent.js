const { Client } = await import("@langchain/langgraph-sdk");
const { v4: uuidv4 } = await import("uuid");

// Check command line arguments for streaming mode
const args = process.argv.slice(2);
const stream = args.includes('--stream') || args.includes('-s');

// Use port 2024 since that's where langgraph dev runs by default
const client = new Client({ apiUrl: "http://localhost:2024" });

const config = {
    configurable: {
        userId: "chef-chopsky-user",
        embeddingModel: "text-embedding-3-small",
        retrieverProvider: "memory",
        searchKwargs: { k: 3 },
        responseSystemPromptTemplate: "You are Chef Chopsky, a helpful cooking assistant specializing in CSA-based meal planning and high-protein plant-based recipes.",
        responseModel: "gpt-4o-mini",
        querySystemPromptTemplate: "Generate a search query for cooking questions.",
        queryModel: "gpt-4o-mini"
    },
    // LangSmith configuration for monitoring and debugging
    project_name: "chef-chopsky",
    run_name: "chef-chopsky-test",
    run_id: uuidv4(),
    tags: ["test", "csa", "meal-planning", "chef-chopsky"],
    metadata: {
        testType: "integration",
        ingredients: ["kale", "tomatoes", "quinoa"],
        userType: "csa-subscriber",
        timestamp: new Date().toISOString(),
        streamMode: stream ? "messages-tuple" : "values"
    }
};

const input = {
    "messages": [
        { "role": "user", "content": "I have kale, tomatoes, and quinoa from my CSA. What should I cook for dinner?"}
    ]
};

// Log LangSmith run information
console.log("🔍 LangSmith Integration:");
console.log(`   Run Name: ${config.run_name}`);
console.log(`   Run ID: ${config.run_id}`);
console.log(`   Tags: ${config.tags.join(", ")}`);
console.log(`   Stream Mode: ${config.metadata.streamMode}`);
console.log("");

const streamResponse = client.runs.stream(
    null, // Threadless run
    "retrieval_graph", // Assistant ID (from your langgraph.json)
    {
        input,
        streamMode: stream ? "messages-tuple" : "values",
        config
    }
);

// Use the original LangChain logging format
for await (const chunk of streamResponse) {
    console.log(`Receiving new event of type: ${chunk.event}...`);
    console.log(JSON.stringify(chunk.data));
    console.log("\n\n");
}
