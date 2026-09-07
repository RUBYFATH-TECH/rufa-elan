export const ADMIN_EMAILS = [
  "ilimiquestfoundation@gmail.com",
  // Replace this with your actual Gmail address:
  "your-email@gmail.com"
];

export const isKnownAdminEmail = (email: string) => ADMIN_EMAILS.includes(email.toLowerCase());
