# 🧭 Guiding Principles

This document outlines the core principles that guide our product development and decision-making.

---

### 1. AI-First Prototyping

We leverage AI as the primary builder, not just an assistant. Our goal is to empower AI to create whatever infrastructure and assets are needed to bring a prototype to life, minimizing manual setup and administrative overhead.

Instead of relying on external documents or manually configured tools (like Notion pages or Google Sheets), we prioritize letting the AI build and manage its own resources directly within the development environment. For instance, when building the initial Chef Chopsky prototype, we will start with a Custom GPT and allow the AI to define its own knowledge sources and tools, rather than pointing it to pre-existing, human-made templates.

This approach allows us to:

- Move faster and stay focused on the core user experience.
- Fully embrace an AI-native workflow from day one.
- Discover novel solutions by giving the AI more agency in the creation process.

---

### 2. Design for Autonomous Improvement

We build systems designed to learn and evolve on their own. Our aim is to create automated feedback loops where user interactions directly refine the AI's knowledge and behavior, minimizing the need for manual intervention.

In the context of the Chef Chopsky prototype, this means architecting the Custom GPT to capture implicit and explicit feedback from conversations—such as recipe ratings, ingredient swaps, or user corrections. The system should then be able to integrate this learning to improve its future recommendations autonomously.

This principle pushes us to build not just intelligent tools, but true learning companions that grow and adapt with their users over time.
