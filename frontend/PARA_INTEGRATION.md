# Para Wallet Integration

This project has been integrated with Para wallet, providing Twitter login, wallet creation, and on-ramp/off-ramp functionality.

## Features

### ✅ Twitter Login
- Seamless Twitter OAuth integration
- Automatic user profile extraction
- Secure authentication flow

### ✅ Wallet Management
- Automatic wallet creation after Twitter login
- Support for multiple Cosmos networks (Cosmos Hub, Osmosis)
- Real-time balance tracking
- Address management and copying

### ✅ On-Ramp & Off-Ramp
- Buy crypto with fiat (MoonPay, Transak)
- Sell crypto for fiat (MoonPay)
- Integrated payment flow
- Multiple payment methods

### ✅ UI Components
- Custom login button with Twitter branding
- User profile dropdown with wallet info
- Wallet management page
- Responsive design

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in the frontend directory:

```bash
# Para Configuration
NEXT_PUBLIC_PARA_APP_ID=your-para-app-id

# Twitter OAuth (if needed)
NEXT_PUBLIC_TWITTER_CLIENT_ID=your-twitter-client-id

# Other environment variables
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Get Your Para App ID

1. Visit [Para Dashboard](https://app.para.xyz)
2. Create a new app or use existing one
3. Copy your App ID
4. Update `NEXT_PUBLIC_PARA_APP_ID` in your `.env.local`

### 3. Configure Twitter OAuth (Optional)

If you want to customize Twitter login:
1. Go to [Twitter Developer Portal](https://developer.twitter.com)
2. Create a new app
3. Get your Client ID
4. Update `NEXT_PUBLIC_TWITTER_CLIENT_ID` in your `.env.local`

## Usage

### Login Flow

1. **User clicks "Login with Twitter"**
   - Opens Twitter OAuth flow
   - User authorizes the app
   - Para creates/retrieves user account

2. **Wallet Creation**
   - Para automatically creates a wallet for the user
   - Wallet address is generated
   - User can connect to supported networks

3. **Wallet Connection**
   - User clicks "Connect Wallet"
   - Graz handles wallet connection
   - Balance and address are displayed

### On-Ramp Flow

1. User clicks "Buy Crypto"
2. Para opens on-ramp modal
3. User selects payment method and amount
4. Payment is processed
5. Crypto is sent to user's wallet

### Off-Ramp Flow

1. User clicks "Sell Crypto"
2. Para opens off-ramp modal
3. User selects withdrawal method and amount
4. Crypto is sold
5. Fiat is sent to user's account

## Components

### ParaLogin
- Main login component
- Handles Twitter authentication
- Shows user profile when logged in
- Includes wallet connection status

### ParaWallet
- Comprehensive wallet management
- Balance display
- On-ramp/off-ramp buttons
- Network information

### ParaProviders
- Wraps the app with Para and Graz providers
- Handles configuration
- Manages state

## Configuration

### Supported Networks

Currently configured for:
- **Cosmos Hub** (ATOM)
- **Osmosis** (OSMO)

### On-Ramp Providers

- MoonPay
- Transak

### Off-Ramp Providers

- MoonPay

### UI Customization

The Para integration includes custom styling:
- Dark theme
- Brand colors
- Custom button styles
- Responsive design

## API Reference

### usePara Hook

```typescript
const { 
  login, 
  logout, 
  user, 
  isAuthenticated, 
  isLoading 
} = usePara();
```

### useGraz Hook

```typescript
const { 
  connect, 
  disconnect, 
  isConnected, 
  account 
} = useGraz();
```

## Error Handling

The integration includes comprehensive error handling:
- Login failures
- Wallet connection errors
- Network issues
- Payment failures

All errors are displayed using toast notifications.

## Security

- OAuth 2.0 flow for Twitter
- Secure wallet creation
- Encrypted storage
- HTTPS only in production

## Troubleshooting

### Common Issues

1. **Login not working**
   - Check Para App ID
   - Verify Twitter OAuth configuration
   - Check network connectivity

2. **Wallet not connecting**
   - Ensure Graz provider is configured
   - Check network RPC endpoints
   - Verify chain configuration

3. **On-ramp/Off-ramp not working**
   - Check Para configuration
   - Verify payment provider setup
   - Ensure wallet is connected

### Debug Mode

Enable debug logging by adding to your `.env.local`:

```bash
NEXT_PUBLIC_DEBUG=true
```

## Development

### Running Locally

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

## Support

For Para-specific issues:
- [Para Documentation](https://docs.para.xyz)
- [Para Discord](https://discord.gg/para)
- [Para GitHub](https://github.com/getpara)

For this integration:
- Check the component documentation
- Review the configuration files
- Test with different networks
