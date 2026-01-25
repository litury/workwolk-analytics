import { Stagehand } from '@browserbasehq/stagehand';

async function main() {
  const stagehand = new Stagehand({
    env: 'LOCAL',
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });
  
  await stagehand.init();
  const page = stagehand.context.pages()[0];
  
  console.log('Page object type:', typeof page);
  console.log('Page methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(page)).filter(m => !m.startsWith('_')).sort());
  
  await stagehand.close();
}

main();
