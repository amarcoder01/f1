# Database Setup Guide - Azure PostgreSQL Integration

This guide will help you set up Azure PostgreSQL database integration for the Vidality trading platform.

## Prerequisites

1. **Azure Account**: You need an active Azure subscription
2. **Azure PostgreSQL Database**: A PostgreSQL database server in Azure
3. **Node.js and npm**: Already installed in your project

## Step 1: Create Azure PostgreSQL Database

### Option A: Azure Portal
1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Azure Database for PostgreSQL"
4. Select "Azure Database for PostgreSQL - Flexible Server"
5. Fill in the required details:
   - **Server name**: `vidality-postgresql` (or your preferred name)
   - **Admin username**: `vidality_admin`
   - **Password**: Create a strong password
   - **Region**: Choose a region close to your users
   - **PostgreSQL version**: 15 or higher
6. Click "Review + create" and then "Create"

### Option B: Azure CLI
```bash
# Login to Azure
az login

# Create resource group
az group create --name vidality-rg --location eastus

# Create PostgreSQL server
az postgres flexible-server create \
  --resource-group vidality-rg \
  --name vidality-postgresql \
  --admin-user vidality_admin \
  --admin-password "YourStrongPassword123!" \
  --location eastus \
  --sku-name Standard_B1ms \
  --version 15
```

## Step 2: Configure Database Connection

1. **Get Connection String**:
   - Go to your PostgreSQL server in Azure Portal
   - Click "Connection strings" in the left menu
   - Copy the connection string

2. **Update Environment Variables**:
   Edit your `.env.local` file and replace the placeholder with your actual connection string:

   ```env
   # Database Configuration - Azure PostgreSQL
   DATABASE_URL="postgresql://vidality_admin:YourStrongPassword123!@vidality-postgresql.postgres.database.azure.com:5432/vidality_db?sslmode=require"
   
   # Alpha Vantage API for real-time stock data
   NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
   
   # Enable real-time API
   NEXT_PUBLIC_ENABLE_REAL_API=true
   ```

## Step 3: Set Up Database Schema

1. **Push Schema to Database**:
   ```bash
   npx prisma db push
   ```

2. **Verify Schema**:
   ```bash
   npx prisma studio
   ```
   This will open Prisma Studio in your browser where you can view and manage your database.

## Step 4: Test Database Integration

1. **Start the Development Server**:
   ```bash
   npm run dev
   ```

2. **Test Database Connection**:
   - Navigate to `http://localhost:3000/test-db`
   - Click "Test Connection" to verify database connectivity
   - Click "Test Watchlist Ops" to test watchlist operations

## Step 5: Configure Firewall Rules (if needed)

If you're getting connection errors, you may need to configure firewall rules:

### Azure Portal Method:
1. Go to your PostgreSQL server
2. Click "Networking" in the left menu
3. Add your IP address to the firewall rules
4. Or temporarily allow all Azure services (for development)

### Azure CLI Method:
```bash
# Allow your IP address
az postgres flexible-server firewall-rule create \
  --resource-group vidality-rg \
  --name vidality-postgresql \
  --rule-name allow-my-ip \
  --start-ip-address YOUR_IP_ADDRESS \
  --end-ip-address YOUR_IP_ADDRESS

# Or allow all Azure services (development only)
az postgres flexible-server firewall-rule create \
  --resource-group vidality-rg \
  --name vidality-postgresql \
  --rule-name allow-azure-services \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

## Step 6: Get Alpha Vantage API Key

For real-time stock data, you need an Alpha Vantage API key:

1. Go to [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Sign up for a free account
3. Get your API key
4. Add it to your `.env.local` file:
   ```env
   NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_actual_api_key_here
   ```

## Database Schema Overview

The application uses the following database tables:

### Users
- `id`: Unique user identifier
- `email`: User email address
- `name`: User display name
- `settings`: JSON object for user preferences
- `createdAt`, `updatedAt`: Timestamps

### Watchlists
- `id`: Unique watchlist identifier
- `userId`: Reference to user
- `name`: Watchlist name
- `createdAt`, `updatedAt`: Timestamps

### WatchlistItems
- `id`: Unique item identifier
- `watchlistId`: Reference to watchlist
- `symbol`: Stock symbol (e.g., AAPL)
- `name`: Company name
- `type`: Asset type (stock, crypto, etc.)
- `price`: Current price
- `change`: Price change
- `changePercent`: Percentage change
- `lastUpdated`: Last update timestamp

### Portfolios
- `id`: Unique portfolio identifier
- `userId`: Reference to user
- `name`: Portfolio name
- `createdAt`, `updatedAt`: Timestamps

### Positions
- `id`: Unique position identifier
- `portfolioId`: Reference to portfolio
- `symbol`: Stock symbol
- `quantity`: Number of shares
- `averagePrice`: Average purchase price
- `entryDate`: Date position was opened
- `notes`: Additional notes

### ChatSessions & ChatMessages
- For storing TreadGPT chat history
- Session-based chat organization

## Troubleshooting

### Common Issues:

1. **Connection Refused**:
   - Check firewall rules
   - Verify connection string
   - Ensure database server is running

2. **Authentication Failed**:
   - Verify username and password
   - Check if SSL mode is required

3. **Schema Sync Issues**:
   - Run `npx prisma generate` to regenerate client
   - Run `npx prisma db push` to sync schema
   - Check for schema conflicts

4. **Rate Limiting**:
   - Alpha Vantage free tier has rate limits
   - Consider upgrading for production use

### Useful Commands:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Open database browser
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset

# View database logs
npx prisma db pull
```

## Production Considerations

1. **Security**:
   - Use strong passwords
   - Enable SSL connections
   - Configure proper firewall rules
   - Use Azure Key Vault for secrets

2. **Performance**:
   - Monitor database performance
   - Consider connection pooling
   - Optimize queries for large datasets

3. **Backup**:
   - Enable automated backups in Azure
   - Test restore procedures
   - Monitor backup health

4. **Scaling**:
   - Consider read replicas for heavy read loads
   - Monitor resource usage
   - Plan for horizontal scaling

## Support

If you encounter issues:

1. Check the test page at `/test-db`
2. Review Azure PostgreSQL logs
3. Check Prisma documentation
4. Verify environment variables
5. Test with a simple connection first

The database integration is now complete! Your watchlist data will be persisted in Azure PostgreSQL, and the application will automatically use the database for all watchlist operations. 