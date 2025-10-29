const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const { randomUUID } = require('crypto');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const db = new Database(dbPath);

async function seed() {
  try {
    // Create admin user
    const adminId = randomUUID();
    const hashedPassword = await bcrypt.hash('admin123', 10);

    db.prepare(`
      INSERT INTO users (id, email, name, password, role, active, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      adminId,
      'admin@example.com',
      'Admin User',
      hashedPassword,
      'ADMIN',
      1,
      Date.now(),
      Date.now()
    );

    console.log('✅ Admin user created:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');

    // Create a test company
    const companyId = randomUUID();
    db.prepare(`
      INSERT INTO companies (id, name, industry, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      companyId,
      'Acme Corporation',
      'Technology',
      'ACTIVE',
      Date.now(),
      Date.now()
    );

    console.log('✅ Test company created: Acme Corporation');

    // Create a test project
    const projectId = randomUUID();
    db.prepare(`
      INSERT INTO projects (id, name, description, status, priority, companyId, createdById, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      projectId,
      'Website Redesign',
      'Complete redesign of the corporate website',
      'IN_PROGRESS',
      'HIGH',
      companyId,
      adminId,
      Date.now(),
      Date.now()
    );

    console.log('✅ Test project created: Website Redesign');
    console.log('');
    console.log('🎉 Database seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

seed();
