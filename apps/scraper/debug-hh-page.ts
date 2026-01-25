import { Stagehand } from '@browserbasehq/stagehand';

async function main() {
  const stagehand = new Stagehand({
    env: 'LOCAL',
    model: 'google/gemini-3-flash-preview',
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    localBrowserLaunchOptions: { headless: true },
  });
  
  await stagehand.init();
  const page = stagehand.context.pages()[0];
  
  await page.goto('https://hh.ru/search/vacancy?text=vue');
  await page.waitForTimeout(3000);
  
  // Проверить наличие элементов
  const htmlSnippet = await page.evaluate(() => {
    const cards = document.querySelectorAll('[data-qa="vacancy-serp__vacancy"]');
    console.log('Found cards:', cards.length);
    
    if (cards.length === 0) {
      // Показать что вообще есть на странице
      return {
        bodyStart: document.body?.innerHTML?.substring(0, 500),
        hasDataQa: document.querySelector('[data-qa]') !== null,
        allDataQaAttrs: Array.from(document.querySelectorAll('[data-qa]')).slice(0, 5).map(el => el.getAttribute('data-qa'))
      };
    }
    
    return { found: cards.length };
  });
  
  console.log('Page content check:', JSON.stringify(htmlSnippet, null, 2));
  
  await stagehand.close();
}

main();
