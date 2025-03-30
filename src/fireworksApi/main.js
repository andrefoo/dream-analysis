import DreamAnalysisPipeline from "./pipeline.js";

// const program = new Command();
// program
//   .option('--model <model>', 'Specify the LLM model to use', 'accounts/fireworks/models/llama-v3p1-8b-instruct')
//   .option('--temperature <temperature>', 'Set the temperature for generation (0.0-1.0)', 1.0)
//   .option('--output <output>', 'Specify the output directory for results', './dream_results')
//   .parse(process.argv);

// const options = program.opts();

// Ensure output directory exists
// await FileSystem.makeDirectoryAsync(options.output, { intermediates: true });

const apiKey = process.env.EXPO_PUBLIC_FIREWORKS_API_KEY;
console.log("apiKery= ", apiKey);
const pipeline = new DreamAnalysisPipeline(apiKey);

async function analyzeDream() {
  try {
    // console.log("\n=== Dream Analysis Application ===\n");
    const result = await pipeline.runPipeline();

    // const outputPath = `${FileSystem.documentDirectory}${options.output}/dream_analysis.json`;
    // pipeline.saveDreamData(outputPath);

    // console.log("\n=== Analysis Complete ===\n");
    // console.log(`Your dream analysis has been saved to: ${outputPath}`);
    return result;
  } catch (error) {
    console.error("An error occurred:", error.message);
  }
}

export default analyzeDream;
