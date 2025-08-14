import { priceAlertScheduler } from './price-alert-scheduler'

// Auto-start the price alert scheduler
export function initializePriceAlertScheduler() {
  // Start in both production and development for testing
  console.log('🚀 Initializing Price Alert Scheduler...')
  priceAlertScheduler.start()
}

// Initialize on module load
initializePriceAlertScheduler()
