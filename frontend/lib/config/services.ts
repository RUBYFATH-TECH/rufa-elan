export const serviceConfig = {
  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    storageUrl: process.env.SUPABASE_STORAGE_URL!,
    projectId: process.env.PROJECT_ID!,
  },

  // Payment Configuration
  paystack: {
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
  },

  // Google Configuration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
  },

  // Cloudinary Configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'rufa_elan',
  },

  // Application Configuration
  app: {
    name: 'RUFA ELAN',
    // Never fall back to a retired deployment. OAuth redirects derive from the
    // active browser origin; this value is for code that needs the configured
    // canonical application URL.
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
    adminSecretCode: process.env.ADMIN_SECRET_CODE || '0505',
  },

  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
    timeout: 30000, // 30 seconds
  },

  // Features
  features: {
    enableGoogleAuth: !!process.env.GOOGLE_CLIENT_ID,
    enablePaystack: !!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    enableCloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
    enableAnalytics: process.env.NODE_ENV === 'production',
  },
};

// Validation function for required environment variables
export const validateClientConfig = () => {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return true;
};

export default serviceConfig;
