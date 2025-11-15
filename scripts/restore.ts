const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const backupsDir = path.join(__dirname, '../backups');

// Получаем список бэкапов
const backups = fs.readdirSync(backupsDir)
  .filter(file => file.endsWith('.sql'))
  .sort()
  .reverse();

if (backups.length === 0) {
  console.error('❌ Нет доступных бэкапов в папке backups/');
  process.exit(1);
}

console.log('📋 Доступные бэкапы:\n');
backups.forEach((file, index) => {
  const filepath = path.join(backupsDir, file);
  const stats = fs.statSync(filepath);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`   [${index + 1}] ${file} (${fileSizeInMB} MB)`);
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('\nВыберите номер бэкапа для восстановления (или Enter для последнего): ', (answer) => {
  const index = answer.trim() === '' ? 0 : parseInt(answer) - 1;

  if (index < 0 || index >= backups.length) {
    console.error('❌ Неверный номер бэкапа');
    rl.close();
    process.exit(1);
  }

  const selectedBackup = backups[index];
  const filepath = path.join(backupsDir, selectedBackup);

  console.log(`\n⚠️  ВНИМАНИЕ: Все текущие данные в БД будут удалены!`);

  rl.question('Продолжить? (yes/no): ', (confirm) => {
    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ Восстановление отменено');
      rl.close();
      process.exit(0);
    }

    console.log(`\n🔄 Восстановление из ${selectedBackup}...`);

    const command = `docker exec -i adtech-postgres psql -U postgres -d adtech_dev < "${filepath}"`;

    exec(command, (error, stdout, stderr) => {
      rl.close();

      if (error) {
        console.error('❌ Ошибка восстановления:', error.message);
        process.exit(1);
      }

      console.log('✅ БД успешно восстановлена из бэкапа!\n');
    });
  });
});
