const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Generate Prisma client
    console.log('📦 Generating Prisma client...')
    const { execSync } = require('child_process')
    execSync('npx prisma generate', { stdio: 'inherit' })
    console.log('✅ Prisma client generated')
    
    // Run migrations
    console.log('🔄 Running database migrations...')
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' })
    console.log('✅ Database migrations completed')
    
    // Create demo user if needed
    const existingUser = await prisma.user.findUnique({
      where: { email: 'demo@vidality.com' }
    })
    
    if (!existingUser) {
      console.log('👤 Creating demo user...')
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash('password', 10)
      
      await prisma.user.create({
        data: {
          email: 'demo@vidality.com',
          password: hashedPassword,
          firstName: 'Demo',
          lastName: 'User',
          isEmailVerified: true,
          preferences: {
            theme: 'system',
            currency: 'USD',
            timezone: 'UTC',
            notifications: {
              email: true,
              push: true,
              sms: false
            }
          }
        }
      })
      console.log('✅ Demo user created')
    } else {
      console.log('ℹ️ Demo user already exists')
    }
    
    console.log('🎉 Database setup completed successfully!')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupDatabase()
