import { describe, test, expect } from 'bun:test';

const HH_API = 'https://api.hh.ru';

describe('HH.ru API - Доступность', () => {
  test('API отвечает 200', async () => {
    const res = await fetch(`${HH_API}/vacancies?per_page=1`);
    expect(res.status).toBe(200);
  });

  test('Справочники доступны', async () => {
    const res = await fetch(`${HH_API}/dictionaries`);
    expect(res.status).toBe(200);
  });
});

describe('HH.ru API - Структура вакансий', () => {
  test('Список вакансий содержит обязательные поля', async () => {
    const res = await fetch(`${HH_API}/vacancies?per_page=1`);
    const data = await res.json();

    // Проверяем структуру ответа
    expect(data).toHaveProperty('items');
    expect(data).toHaveProperty('found');
    expect(data).toHaveProperty('pages');
    expect(data).toHaveProperty('per_page');
    expect(Array.isArray(data.items)).toBe(true);
  });

  test('Вакансия содержит обязательные поля', async () => {
    const res = await fetch(`${HH_API}/vacancies?per_page=1`);
    const data = await res.json();

    const vacancy = data.items[0];
    expect(vacancy).toHaveProperty('id');
    expect(vacancy).toHaveProperty('name');
    expect(vacancy).toHaveProperty('employer');
    expect(vacancy).toHaveProperty('area');
    expect(vacancy).toHaveProperty('published_at');

    // Вложенные объекты
    expect(vacancy.employer).toHaveProperty('name');
    expect(vacancy.area).toHaveProperty('name');
  });

  test('Детальная вакансия содержит описание', async () => {
    // Получаем ID вакансии из списка
    const list = await fetch(`${HH_API}/vacancies?per_page=1`).then(r => r.json());
    const vacancyId = list.items[0].id;

    // Получаем детали вакансии
    const vacancy = await fetch(`${HH_API}/vacancies/${vacancyId}`).then(r => r.json());

    expect(vacancy).toHaveProperty('description');
    expect(vacancy).toHaveProperty('key_skills');
    expect(vacancy).toHaveProperty('experience');
    expect(vacancy).toHaveProperty('employment');
    expect(typeof vacancy.description).toBe('string');
    expect(vacancy.description.length).toBeGreaterThan(0);
  });
});

describe('HH.ru API - Поиск вакансий', () => {
  test('Поиск по ключевому слову работает', async () => {
    const res = await fetch(`${HH_API}/vacancies?text=TypeScript&per_page=5`);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.found).toBeGreaterThan(0);
    expect(data.items.length).toBeGreaterThan(0);
  });

  test('Поиск возвращает результаты по запросу', async () => {
    const data = await fetch(`${HH_API}/vacancies?text=Python&per_page=10`).then(r => r.json());

    // Поиск по "Python" должен вернуть релевантные результаты
    // (слово может быть в названии, описании или требованиях)
    expect(data.found).toBeGreaterThan(0);
    expect(data.items.length).toBeGreaterThan(0);
  });

  test('Пагинация работает', async () => {
    const page0 = await fetch(`${HH_API}/vacancies?text=developer&per_page=2&page=0`).then(r => r.json());
    const page1 = await fetch(`${HH_API}/vacancies?text=developer&per_page=2&page=1`).then(r => r.json());

    // ID вакансий на разных страницах должны отличаться
    const ids0 = page0.items.map((v: { id: string }) => v.id);
    const ids1 = page1.items.map((v: { id: string }) => v.id);

    const hasOverlap = ids0.some((id: string) => ids1.includes(id));
    expect(hasOverlap).toBe(false);
  });
});

describe('HH.ru API - Справочники', () => {
  test('Справочник регионов доступен', async () => {
    const res = await fetch(`${HH_API}/areas`);
    const areas = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(areas)).toBe(true);
    expect(areas.length).toBeGreaterThan(0);

    // Россия должна быть в списке
    const russia = areas.find((a: { id: string }) => a.id === '113');
    expect(russia).toBeDefined();
    expect(russia.name).toBe('Россия');
  });

  test('Справочник валют содержит RUR', async () => {
    const dict = await fetch(`${HH_API}/dictionaries`).then(r => r.json());

    expect(dict).toHaveProperty('currency');
    const hasRub = dict.currency.some((c: { code: string }) => c.code === 'RUR');
    expect(hasRub).toBe(true);
  });
});
