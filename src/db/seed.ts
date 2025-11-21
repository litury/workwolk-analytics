import { db, closeDatabase } from './client';
import { users, resumes, applications } from './schema';
import { eq, count } from 'drizzle-orm';

async function main() {
  console.log('🌱 Начало загрузки seed данных для HH Auto Respond Bot...');

  // Очистка существующих данных
  await db.delete(applications);
  await db.delete(resumes);
  await db.delete(users);

  console.log('🗑️  Очищены старые данные');

  // ==============================================
  // ПОЛЬЗОВАТЕЛИ TELEGRAM
  // ==============================================

  const [user1] = await db.insert(users).values({
    telegramId: 123456789n,
    hhUserId: 'hh_user_001',
    email: 'ivan.petrov@example.com',
    fullName: 'Иван Петров',
    accessToken: 'mock_access_token_user1_very_long_string_for_testing',
    refreshToken: 'mock_refresh_token_user1_very_long_string_for_testing',
    tokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 дней
  }).returning();

  const [user2] = await db.insert(users).values({
    telegramId: 987654321n,
    hhUserId: 'hh_user_002',
    email: 'maria.sidorova@example.com',
    fullName: 'Мария Сидорова',
    accessToken: 'mock_access_token_user2_very_long_string_for_testing',
    refreshToken: 'mock_refresh_token_user2_very_long_string_for_testing',
    tokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 дней
  }).returning();

  const [user3] = await db.insert(users).values({
    hhUserId: 'hh_user_003',
    email: 'alexey.web@example.com',
    fullName: 'Алексей Веб',
    accessToken: 'mock_access_token_user3_very_long_string_for_testing',
    refreshToken: 'mock_refresh_token_user3_very_long_string_for_testing',
    tokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  }).returning();

  console.log('✅ Создано пользователей: 3');

  // ==============================================
  // РЕЗЮМЕ ИЗ HH.RU
  // ==============================================

  const [resume1] = await db.insert(resumes).values({
    hhResumeId: 'resume_abc123',
    title: 'Frontend Developer (Junior)',
    autoRespondEnabled: true, // Автоотклики включены
    userId: user1.id,
  }).returning();

  const [resume2] = await db.insert(resumes).values({
    hhResumeId: 'resume_def456',
    title: 'JavaScript Developer',
    autoRespondEnabled: false, // Автоотклики выключены
    userId: user1.id,
  }).returning();

  const [resume3] = await db.insert(resumes).values({
    hhResumeId: 'resume_ghi789',
    title: 'React Developer (Middle)',
    autoRespondEnabled: true, // Автоотклики включены
    userId: user2.id,
  }).returning();

  console.log('✅ Создано резюме: 3');

  // ==============================================
  // ОТПРАВЛЕННЫЕ ОТКЛИКИ (ИСТОРИЯ)
  // ==============================================

  await db.insert(applications).values([
    {
      resumeId: resume1.id,
      vacancyId: 'vacancy_001',
      vacancyTitle: 'Junior Frontend Developer',
      userId: user1.id,
      status: 'sent',
      appliedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // -1 час назад
    },
    {
      resumeId: resume1.id,
      vacancyId: 'vacancy_002',
      vacancyTitle: 'Frontend разработчик в стартап',
      userId: user1.id,
      status: 'viewed',
      appliedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // -3 часа назад
    },
    {
      resumeId: resume1.id,
      vacancyId: 'vacancy_003',
      vacancyTitle: 'Junior JavaScript Developer',
      userId: user1.id,
      status: 'sent',
      appliedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // -5 часов назад
    },
    {
      resumeId: resume3.id,
      vacancyId: 'vacancy_004',
      vacancyTitle: 'React Developer (Middle)',
      userId: user2.id,
      status: 'invited',
      appliedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // -1 день назад
    },
    {
      resumeId: resume3.id,
      vacancyId: 'vacancy_005',
      vacancyTitle: 'Senior React Developer',
      userId: user2.id,
      status: 'rejected',
      appliedAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // -2 дня назад
    },
  ]);

  console.log('✅ Создано откликов: 5');

  // ==============================================
  // СТАТИСТИКА
  // ==============================================

  const [{ count: usersCount }] = await db.select({ count: count() }).from(users);
  const [{ count: resumesCount }] = await db.select({ count: count() }).from(resumes);
  const [{ count: resumesWithAutoRespondCount }] = await db
    .select({ count: count() })
    .from(resumes)
    .where(eq(resumes.autoRespondEnabled, true));
  const [{ count: applicationsCount }] = await db.select({ count: count() }).from(applications);

  console.log('\n📊 Статистика БД:');
  console.log(`   Пользователей: ${usersCount}`);
  console.log(`   Резюме: ${resumesCount}`);
  console.log(`   Резюме с автооткликами: ${resumesWithAutoRespondCount}`);
  console.log(`   Откликов: ${applicationsCount}`);
  console.log('\n✅ Seed данные успешно загружены!\n');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при загрузке seed данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await closeDatabase();
  });
