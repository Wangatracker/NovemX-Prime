// commands/ai.js - Lists available AI services

module.exports = {
  name: 'ai',
  description: 'List available AI services (hidden behind friendly names).',
  execute(args) {
    console.log("Available AI services:");
    console.log("• Orion AI");
    console.log("• Doctor AI");
    console.log("• ChatGPT (simulated)");
    console.log("• ... (more can be added)");
  }
}
