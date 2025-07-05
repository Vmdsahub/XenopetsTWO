export interface ValidationResult {
  isValid: boolean;
  errors: { field: string; message: string }[];
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePassword = (password: string): ValidationResult => {
  const errors: { field: string; message: string }[] = [];
  
  if (password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters long' });
  }
  
  if (password.length > 128) {
    errors.push({ field: 'password', message: 'Password must be less than 128 characters' });
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one lowercase letter' });
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one uppercase letter' });
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one number' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateUsername = (username: string): ValidationResult => {
  const errors: { field: string; message: string }[] = [];
  
  if (username.length < 3) {
    errors.push({ field: 'username', message: 'Username must be at least 3 characters long' });
  }
  
  if (username.length > 20) {
    errors.push({ field: 'username', message: 'Username must be less than 20 characters' });
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push({ field: 'username', message: 'Username can only contain letters, numbers, underscores, and hyphens' });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateRegistration = (data: {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  phone?: string;
}): ValidationResult => {
  const errors: { field: string; message: string }[] = [];
  
  // Email validation
  if (!validateEmail(data.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }
  
  // Password validation
  const passwordValidation = validatePassword(data.password);
  errors.push(...passwordValidation.errors);
  
  // Confirm password validation
  if (data.password !== data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }
  
  // Username validation
  const usernameValidation = validateUsername(data.username);
  errors.push(...usernameValidation.errors);
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};