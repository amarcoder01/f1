#!/usr/bin/env node

/**
 * SendGrid Setup Script
 * This script helps you configure SendGrid for password reset emails
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 SendGrid Configuration Setup\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('❌ .env.local file not found!');
  console.log('📝 Creating .env.local file...\n');
  
  const envContent = `# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=your-verified-email@yourdomain.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Database Configuration
DATABASE_URL="file:./dev.db"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Other API Keys (if needed)
POLYGON_API_KEY=your_polygon_api_key_here
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local file created successfully!\n');
  } catch (error) {
    console.error('❌ Failed to create .env.local file:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ .env.local file found!\n');
}

// Read current .env.local content
let envContent = '';
if (envExists) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Check SendGrid configuration
const hasSendGridKey = envContent.includes('SENDGRID_API_KEY=') && 
                      !envContent.includes('SENDGRID_API_KEY=your_sendgrid_api_key_here');
const hasSendGridEmail = envContent.includes('SENDGRID_FROM_EMAIL=') && 
                        !envContent.includes('SENDGRID_FROM_EMAIL=your-verified-email@yourdomain.com');

console.log('📊 Current Configuration Status:');
console.log(`   SendGrid API Key: ${hasSendGridKey ? '✅ Configured' : '❌ Not configured'}`);
console.log(`   SendGrid From Email: ${hasSendGridEmail ? '✅ Configured' : '❌ Not configured'}\n`);

if (!hasSendGridKey || !hasSendGridEmail) {
  console.log('🔧 Let\'s configure SendGrid properly:\n');
  
  console.log('📋 Steps to get your SendGrid credentials:');
  console.log('1. Go to https://sendgrid.com and sign up/login');
  console.log('2. Go to Settings > API Keys: https://app.sendgrid.com/settings/api_keys');
  console.log('3. Create a new API Key with "Mail Send" permissions');
  console.log('4. Go to Settings > Sender Authentication: https://app.sendgrid.com/settings/sender_auth');
  console.log('5. Verify a Single Sender or your domain');
  console.log('6. Use the verified email as your SENDGRID_FROM_EMAIL\n');
  
  rl.question('Do you want to update your .env.local file now? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      rl.question('Enter your SendGrid API Key: ', (apiKey) => {
        rl.question('Enter your verified sender email: ', (email) => {
          // Update .env.local content
          let updatedContent = envContent;
          
          // Update API Key
          if (envContent.includes('SENDGRID_API_KEY=')) {
            updatedContent = updatedContent.replace(
              /SENDGRID_API_KEY=.*/,
              `SENDGRID_API_KEY=${apiKey}`
            );
          } else {
            updatedContent += `\nSENDGRID_API_KEY=${apiKey}`;
          }
          
          // Update From Email
          if (envContent.includes('SENDGRID_FROM_EMAIL=')) {
            updatedContent = updatedContent.replace(
              /SENDGRID_FROM_EMAIL=.*/,
              `SENDGRID_FROM_EMAIL=${email}`
            );
          } else {
            updatedContent += `\nSENDGRID_FROM_EMAIL=${email}`;
          }
          
          try {
            fs.writeFileSync(envPath, updatedContent);
            console.log('\n✅ .env.local file updated successfully!');
            console.log('🔄 Please restart your development server for changes to take effect.\n');
          } catch (error) {
            console.error('❌ Failed to update .env.local file:', error.message);
          }
          
          rl.close();
        });
      });
    } else {
      console.log('\n📝 You can manually update your .env.local file with:');
      console.log('   SENDGRID_API_KEY=your_actual_api_key');
      console.log('   SENDGRID_FROM_EMAIL=your_verified_email@domain.com\n');
      rl.close();
    }
  });
} else {
  console.log('✅ SendGrid is already configured!');
  console.log('🔄 If you\'re still not receiving emails, check:');
  console.log('   1. Your SendGrid dashboard for delivery status');
  console.log('   2. Spam/junk folders');
  console.log('   3. Console logs for any errors\n');
  rl.close();
}
