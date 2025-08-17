const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugWatchlists() {
  try {
    console.log('🔍 Checking watchlist data...')
    
    // Get all users
    const users = await prisma.user.findMany({
      include: {
        watchlists: {
          include: {
            items: true
          }
        }
      }
    })
    
    console.log(`📊 Found ${users.length} users`)
    
    users.forEach(user => {
      console.log(`\n👤 User: ${user.email} (${user.id})`)
      console.log(`   Watchlists: ${user.watchlists.length}`)
      
      user.watchlists.forEach(watchlist => {
        console.log(`   📋 Watchlist: "${watchlist.name}" (${watchlist.id})`)
        console.log(`      Items: ${watchlist.items.length}`)
        if (watchlist.items.length > 0) {
          console.log(`      Symbols: ${watchlist.items.map(item => item.symbol).join(', ')}`)
        }
      })
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugWatchlists()
