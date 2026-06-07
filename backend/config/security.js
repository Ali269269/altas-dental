function validateSecurityConfig() {
  const isProduction = process.env.NODE_ENV === 'production';
  const errors = [];

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32) {
    errors.push('JWT_SECRET must be set and at least 32 characters long');
  }

  if (isProduction) {
    if (!process.env.SUPER_ADMIN_EMAIL) {
      errors.push('SUPER_ADMIN_EMAIL is required in production');
    }
    if (!process.env.SUPER_ADMIN_PASSWORD) {
      errors.push('SUPER_ADMIN_PASSWORD is required in production');
    }
    if (!process.env.FRONTEND_URL) {
      errors.push('FRONTEND_URL is required in production for CORS');
    }
  }

  if (errors.length) {
    console.error('====================================');
    console.error('Security configuration errors:');
    errors.forEach((msg) => console.error(`  - ${msg}`));
    console.error('====================================');
    if (isProduction) {
      process.exit(1);
    }
  }
}

module.exports = { validateSecurityConfig };
