import { VALIDATION } from '../config/api';

export const validateEmail = (email) => {
  if (!email) return 'Email requis';
  if (!VALIDATION.EMAIL_REGEX.test(email)) return 'Format d\'email invalide';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Mot de passe requis';
  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return `Le mot de passe doit contenir au moins ${VALIDATION.PASSWORD_MIN_LENGTH} caractères`;
  }
  return null;
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Confirmation du mot de passe requise';
  if (password !== confirmPassword) return 'Les mots de passe ne correspondent pas';
  return null;
};

export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === '') return `${fieldName} requis`;
  return null;
};



export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = formData[field];
    
    if (rule.required) {
      const error = validateRequired(value, rule.label || field);
      if (error) {
        errors[field] = error;
        return;
      }
    }
    
    if (rule.type === 'email') {
      const error = validateEmail(value);
      if (error) errors[field] = error;
    }
    
    if (rule.type === 'password') {
      const error = validatePassword(value);
      if (error) errors[field] = error;
    }
    
    if (rule.type === 'confirmPassword') {
      const error = validateConfirmPassword(formData.password, value);
      if (error) errors[field] = error;
    }
    

  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};