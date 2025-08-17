#!/usr/bin/env node

/**
 * SendGrid Test Script
 * This script tests your SendGrid configuration
 */

require('dotenv').config({ path: '.env.local' });
const sgMail = require('@sendgrid/mail');

console.log('🧪 SendGrid Configuration Test\n');

// Check environment variables
const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.SENDGRID_FROM_EMAIL;

console.log('📊 Configuration Check:');
console.log(`   API Key: ${apiKey ? '✅ Present' : '❌ Missing'}`);
console.log(`   From Email: ${fromEmail ? '✅ Present' : '❌ Missing'}\n`);

if (!apiKey || !fromEmail) {
  console.log('❌ Missing required environment variables');
  console.log('Please check your .env.local file');
  process.exit(1);
}

// Configure SendGrid
try {
  sgMail.setApiKey(apiKey);
  console.log('✅ SendGrid configured successfully\n');
} catch (error) {
  console.error('❌ Failed to configure SendGrid:', error.message);
  process.exit(1);
}

// Test email configuration
const testEmail = {
  to: 'test@example.com', // Replace with your test email
  from: fromEmail,
  subject: 'SendGrid Test Email - Vidality',
  text: 'This is a test email from your Vidality application',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">SendGrid Test Email</h2>
      <p>Hello!</p>
      <p>This is a test email from your Vidality application to verify SendGrid configuration.</p>
      <p>If you receive this email, your SendGrid setup is working correctly!</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">
        Sent from: ${fromEmail}<br>
        Timestamp: ${new Date().toISOString()}
      </p>
    </div>
  `
};

console.log('📧 Test Email Configuration:');
console.log(`   To: ${testEmail.to}`);
console.log(`   From: ${testEmail.from}`);
console.log(`   Subject: ${testEmail.subject}\n`);

// Ask for test email address
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter your test email address: ', (testEmailAddress) => {
  testEmail.to = testEmailAddress;
  
  console.log(`\n📧 Sending test email to: ${testEmail.to}`);
  
  // Send test email
  sgMail.send(testEmail)
    .then((response) => {
      console.log('✅ Test email sent successfully!');
      console.log(`📊 SendGrid Response: ${response[0].statusCode}`);
      console.log('\n📋 Next Steps:');
      console.log('1. Check your email inbox');
      console.log('2. Check spam/junk folders');
      console.log('3. Check SendGrid dashboard: https://app.sendgrid.com/activity');
      console.log('\n🔗 SendGrid Dashboard Links:');
      console.log('   - Email Activity: https://app.sendgrid.com/activity');
      console.log('   - Sender Auth: https://app.sendgrid.com/settings/sender_auth');
      console.log('   - API Keys: https://app.sendgrid.com/settings/api_keys');
    })
    .catch((error) => {
      console.error('❌ Failed to send test email:');
      console.error('   Error:', error.message);
      
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Body:', error.response.body);
      }
      
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Verify your API key is correct');
      console.log('2. Check sender email is verified');
      console.log('3. Ensure API key has "Mail Send" permissions');
      console.log('4. Check SendGrid account status');
    })
    .finally(() => {
      rl.close();
    });
});
