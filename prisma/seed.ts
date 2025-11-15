import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начало загрузки seed данных для HH Auto Respond Bot...');

  // Очистка существующих данных
  await prisma.application.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Очищены старые данные');

  // ==============================================
  // ПОЛЬЗОВАТЕЛИ TELEGRAM
  // ==============================================

  const user1 = await prisma.user.create({
    data: {
      telegramId: 123456789n,
      hhUserId: 'hh_user_001',
      email: 'ivan.petrov@example.com',
      fullName: 'Иван Петров',
      accessToken: 'mock_access_token_user1_very_long_string_for_testing',
      refreshToken: 'mock_refresh_token_user1_very_long_string_for_testing',
      tokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 дней
    },
  });

  const user2 = await prisma.user.create({
    data: {
      telegramId: 987654321n,
      hhUserId: 'hh_user_002',
      email: 'maria.sidorova@example.com',
      fullName: 'Мария Сидорова',
      accessToken: 'mock_access_token_user2_very_long_string_for_testing',
      refreshToken: 'mock_refresh_token_user2_very_long_string_for_testing',
      tokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 дней
    },
  });

  console.log('✅ Создано пользователей: 2');

  // ==============================================
  // РЕЗЮМЕ ИЗ HH.RU
  // ==============================================

  const resume1 = await prisma.resume.create({
    data: {
      hhResumeId: 'resume_abc123',
      title: 'Frontend Developer (Junior)',
      autoRespondEnabled: true, // Автоотклики включены
      userId: user1.id,
    },
  });

  const resume2 = await prisma.resume.create({
    data: {
      hhResumeId: 'resume_def456',
      title: 'JavaScript Developer',
      autoRespondEnabled: false, // Автоотклики выключены
      userId: user1.id,
    },
  });

  const resume3 = await prisma.resume.create({
    data: {
      hhResumeId: 'resume_ghi789',
      title: 'React Developer (Middle)',
      autoRespondEnabled: true, // Автоотклики включены
      userId: user2.id,
    },
  });

  console.log('✅ Создано резюме: 3');

  // ==============================================
  // ОТПРАВЛЕННЫЕ ОТКЛИКИ (ИСТОРИЯ)
  // ==============================================

  await prisma.application.createMany({
    data: [
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
    ],
  });

  console.log('✅ Создано откликов: 5');

  // ==============================================
  // СТАТИСТИКА
  // ==============================================

  const stats = {
    users: await prisma.user.count(),
    resumes: await prisma.resume.count(),
    resumesWithAutoRespond: await prisma.resume.count({
      where: { autoRespondEnabled: true },
    }),
    applications: await prisma.application.count(),
  };

  console.log('\n📊 Статистика БД:');
  console.log(`   Пользователей: ${stats.users}`);
  console.log(`   Резюме: ${stats.resumes}`);
  console.log(`   Резюме с автооткликами: ${stats.resumesWithAutoRespond}`);
  console.log(`   Откликов: ${stats.applications}`);
  console.log('\n✅ Seed данные успешно загружены!\n');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при загрузке seed данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
