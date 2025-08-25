# Para Wallet Integration v2.0 (Alpha SDK)

This project has been integrated with Para wallet using the latest alpha SDK with React hooks for simplified state management.

## 🚀 **New Features (Alpha SDK)**

### **✅ React Hooks Approach**
- Uses `@getpara/react-sdk@alpha` with React Query hooks
- Simplified state management with `AuthState` context
- Proper authentication flow with three stages: `verify`, `signup`, `login`

### **✅ Enhanced OAuth Support**
- Native Twitter/X OAuth integration
- Support for Google, Apple, Facebook, Discord
- Automatic wallet creation after authentication

### **✅ Improved User Experience**
- Popup-based authentication flow
- Automatic passkey/password setup
- Seamless wallet provisioning

## 📋 **Authentication Flow**

### **1. Initial OAuth (Twitter)**
```typescript
useVerifyOAuth() → AuthState (signup | login)
```

### **2. Signup Flow (New Users)**
```typescript
AuthStateSignup → useWaitForWalletCreation() → Wallet Created
```

### **3. Login Flow (Existing Users)**
```typescript
AuthStateLogin → useWaitForLogin() → useWaitForWalletCreation() (if needed)
```

### **4. Logout**
```typescript
useLogout() → Clear session and wallets
```

## 🛠 **Setup Instructions**

### **1. Environment Configuration**
Create `.env.local`:
```bash
NEXT_PUBLIC_PARA_APP_ID=your-para-app-id
```

### **2. Get Para App ID**
1. Visit [Para Dashboard](https://app.para.xyz)
2. Create a new app
3. Copy your App ID
4. Add to `.env.local`

## 🏗 **Architecture**

### **Components Structure**
```
├── hooks/
│   └── use-auth-state.tsx          # AuthState context
├── components/
│   ├── providers/
│   │   └── para-provider.tsx       # Para provider wrapper
│   └── auth/
│       └── para-login.tsx          # Main login component
└── app/
    └── layout.tsx                  # Root layout with providers
```

### **Key Files**

#### **AuthState Context** (`hooks/use-auth-state.tsx`)
- Manages authentication state across the app
- Provides `AuthState` to all components
- Handles state updates during auth flow

#### **Para Provider** (`components/providers/para-provider.tsx`)
- Wraps app with Para SDK provider
- Includes AuthState context
- Configures Para with your app ID

#### **Login Component** (`components/auth/para-login.tsx`)
- Handles Twitter OAuth flow
- Manages signup/login logic
- Displays user profile and wallet info

## 🔧 **API Hooks Used**

### **Authentication Hooks**
- `useVerifyOAuth()` - Twitter OAuth verification
- `useWaitForLogin()` - Wait for login completion
- `useWaitForWalletCreation()` - Wait for wallet creation
- `useLogout()` - User logout

### **State Management**
- `useAuthState()` - Custom hook for AuthState context
- `AuthState` - Union type for auth stages

## 🎯 **User Experience**

### **Login Flow**
1. **User clicks "Login with Twitter"**
2. **OAuth popup opens** for Twitter authentication
3. **Para determines** if user is new or existing
4. **For new users**: Opens signup flow with passkey/password setup
5. **For existing users**: Opens login flow
6. **Wallet creation** happens automatically
7. **User profile** and wallet address displayed

### **Features**
- ✅ **Twitter OAuth** - Seamless social login
- ✅ **Automatic Wallet Creation** - No manual setup required
- ✅ **Passkey Support** - Modern biometric authentication
- ✅ **Password Fallback** - Traditional password option
- ✅ **Session Management** - Persistent login state
- ✅ **Wallet Display** - Shows truncated wallet address
- ✅ **Profile Management** - User info from Twitter

## 🔒 **Security Features**

### **Authentication Security**
- OAuth 2.0 flow for Twitter
- Secure popup-based authentication
- Passkey support for biometric security
- Session management with proper cleanup

### **Wallet Security**
- Automatic wallet creation on Para backend
- Secure key management
- Recovery mechanisms built-in

## 🎨 **UI Components**

### **Login Button**
- Twitter-branded styling
- Loading states
- Error handling

### **User Profile Dropdown**
- User avatar and name
- Wallet address display
- Logout functionality

### **Responsive Design**
- Mobile-friendly interface
- Adaptive layout
- Touch-friendly interactions

## 🚨 **Error Handling**

### **Common Scenarios**
- **Popup blocked** - User guidance for popup permissions
- **OAuth failures** - Clear error messages
- **Network issues** - Retry mechanisms
- **Wallet creation failures** - Fallback options

### **User Feedback**
- Toast notifications for success/error
- Loading states during operations
- Clear error messages

## 🔄 **State Management**

### **AuthState Stages**
```typescript
type AuthState = 
  | AuthStateVerify    // User needs verification
  | AuthStateSignup    // User can create account
  | AuthStateLogin     // User can login
```

### **User State**
```typescript
interface User {
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  profileImageUrl?: string;
  walletAddress?: string;
}
```

## 📱 **Mobile Support**

### **Features**
- Responsive design
- Touch-friendly interactions
- Popup handling on mobile
- Passkey support for mobile devices

## 🔧 **Development**

### **Running Locally**
```bash
npm run dev
```

### **Testing**
1. Set up Para App ID in `.env.local`
2. Test Twitter OAuth flow
3. Verify wallet creation
4. Test logout functionality

## 📚 **Resources**

- [Para Documentation](https://docs.para.xyz)
- [Para Dashboard](https://app.para.xyz)
- [Para Discord](https://discord.gg/para)
- [React SDK Alpha](https://www.npmjs.com/package/@getpara/react-sdk)

## 🆕 **What's New in Alpha SDK**

### **Improvements**
- ✅ React hooks for simplified state management
- ✅ Better TypeScript support
- ✅ Improved error handling
- ✅ Enhanced OAuth flow
- ✅ Automatic wallet provisioning
- ✅ Session management improvements

### **Breaking Changes**
- Uses new hook-based API
- Different provider structure
- Updated authentication flow
- New state management approach

## 🎉 **Ready to Use**

The integration is now complete with the latest Para alpha SDK! Users can:

1. **Login with Twitter** using OAuth
2. **Get automatic wallet creation** on Para backend
3. **Use passkeys or passwords** for security
4. **See their wallet address** in the UI
5. **Logout securely** with session cleanup

The implementation follows Para's latest best practices and provides a modern, secure authentication experience.
