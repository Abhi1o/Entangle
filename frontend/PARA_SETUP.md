# Para Wallet Integration Setup

This project has been integrated with Para wallet for Ethereum-based wallet creation with Twitter login.

## Features

- ✅ Twitter OAuth login
- ✅ Automatic Ethereum wallet creation
- ✅ User profile management
- ✅ Wallet address display

## Setup Instructions

### 1. Get Your Para App ID

1. Visit [Para Dashboard](https://app.para.xyz)
2. Create a new app or use existing one
3. Copy your App ID

### 2. Environment Configuration

Create a `.env.local` file in the frontend directory:

```bash
NEXT_PUBLIC_PARA_APP_ID=your-para-app-id
```

### 3. Usage

The Para login component is already integrated into the header. Users can:

1. Click "Login with Twitter" button
2. Complete Twitter OAuth flow
3. Para automatically creates an Ethereum wallet
4. User profile and wallet address are displayed

## Components

### ParaLogin (`components/auth/para-login.tsx`)
- Handles Twitter OAuth login
- Manages user session
- Displays user profile and wallet address
- Handles logout functionality

## How It Works

1. **Initialization**: Para SDK is initialized with your app ID
2. **Session Check**: On load, checks if user is already logged in
3. **OAuth Flow**: Opens popup for Twitter OAuth when login is clicked
4. **Wallet Creation**: Para automatically creates an Ethereum wallet after successful login
5. **User Display**: Shows user profile and truncated wallet address

## API Methods Used

- `ParaWeb.init()` - Initialize Para SDK
- `ParaWeb.isSessionActive()` - Check if user is logged in
- `ParaWeb.isFullyLoggedIn()` - Check if user has wallet
- `ParaWeb.getOAuthURL()` - Get Twitter OAuth URL
- `ParaWeb.waitForOAuth()` - Wait for OAuth completion
- `ParaWeb.waitForLoginAndSetup()` - Complete login and wallet setup

## Error Handling

- Popup blocked errors
- OAuth failures
- Network issues
- Session management

## Next Steps

1. Get your Para App ID from the dashboard
2. Add it to your `.env.local` file
3. Test the Twitter login flow
4. Customize the UI as needed

## Support

- [Para Documentation](https://docs.para.xyz)
- [Para Discord](https://discord.gg/para)
