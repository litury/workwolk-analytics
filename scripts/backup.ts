const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const backupsDir = path.join(__dirname, '../backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const filename = `backup_${timestamp}.sql`;
const filepath = path.join(backupsDir, filename);

// Создаём папку backups если её нет
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

console.log('📦 Создание бэкапа БД...');

const command = `docker exec adtech-postgres pg_dump -U postgres -d adtech_dev > "${filepath}"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Ошибка создания бэкапа:', error.message);
    process.exit(1);
  }

  if (stderr) {
    console.error('⚠️  Предупреждения:', stderr);
  }

  const stats = fs.statSync(filepath);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log(`✅ Бэкап создан: ${filename}`);
  console.log(`   Размер: ${fileSizeInMB} MB`);
  console.log(`   Путь: ${filepath}\n`);
});
