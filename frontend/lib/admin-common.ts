export const ADMIN_EMAILS = ["ilimiquestfoundation@gmail.com"];

export const isKnownAdminEmail = (email: string) => ADMIN_EMAILS.includes(email.toLowerCase());
