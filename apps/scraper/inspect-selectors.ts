/**
 * Скрипт для изучения HTML селекторов HH.ru
 */

import { chromium } from 'playwright';

async function main() {
  console.log('🔍 Поиск селекторов на HH.ru...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://hh.ru/search/vacancy?text=vue');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);

  const selectors = {
    'Vacancy cards': '[data-qa="vacancy-serp__vacancy"]',
    'Title link': '[data-qa="vacancy-serp__vacancy-title"]',
    'Company': '[data-qa="vacancy-serp__vacancy-employer"]',
    'Salary': '[data-qa="vacancy-serp__vacancy-compensation"]',
    'Location': '[data-qa="vacancy-serp__vacancy-address"]',
  };

  for (const [name, sel] of Object.entries(selectors)) {
    const count = await page.locator(sel).count();
    console.log(`${name}: ${sel}`);
    console.log(`  Count: ${count}`);

    if (count > 0) {
      const first = page.locator(sel).first();
      const text = await first.textContent().catch(() => null);
      const href = await first.getAttribute('href').catch(() => null);

      if (text) console.log(`  Text: ${text.trim().substring(0, 80)}`);
      if (href) console.log(`  Href: ${href}`);
    }
    console.log('');
  }

  await browser.close();
}

main();
