# Copilot Instructions for AMR Project

## Overview
This document serves as a guide for AI coding agents working within the AMR project. It outlines the architecture, workflows, conventions, and integration points necessary for effective collaboration and development.

## Project Architecture
- **Agent Orchestrator**: Coordinates the execution of multiple agents, handling user queries and managing data flow between components. See `src/services/AgentOrchestrator.js` for implementation details.
- **Agents**: Various agents (e.g., Interpreter, Extractor, Analyzer) perform specific tasks. Each agent has its own configuration and utility functions located in the `agents/` directory.
- **API Backend**: Centralized API for communication between the dashboard and agents, accessible at `http://localhost:3467`.

## Developer Workflows
- **Building**: Use `docker-compose` to build and run services. Refer to `docker-compose.yml` for service definitions.
- **Testing**: Tests are organized in the `tests/` directory. Use Jest for unit and integration tests. Ensure test coverage exceeds 80%.
- **Debugging**: Utilize logs located in `logs/AI_HISTORY/` for tracking agent activities and debugging issues.

## Project Conventions
- **Naming Conventions**: Follow the format `[TYPE]-[VERSION]-[BRANCH].md` for documentation files (e.g., `walkthrough-v1.2.0-main.md`).
- **Error Handling**: Implement consistent error responses in API routes, as shown in `src/routes/agents.js`.

## Integration Points
- **External Dependencies**: Ensure all dependencies are listed in `package.json`. Use `npm install` to set up the environment.
- **Cross-Component Communication**: Agents communicate through the API. Ensure proper request and response formats as defined in the API documentation.

## Key Files/Directories
- **`src/services/`**: Contains service implementations, including the Agent Orchestrator.
- **`agents/`**: Directory for agent-specific logic and configurations.
- **`tests/`**: Contains all test cases and testing utilities.

## Conclusion
This document should be reviewed regularly to ensure it remains up-to-date with project changes. AI agents must adhere to these guidelines to maintain consistency and quality across the codebase.