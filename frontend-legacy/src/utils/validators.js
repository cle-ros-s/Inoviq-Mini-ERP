export function validateSku(sku, existingProducts, currentProductId = null) {
  if (!sku) return { isValid: false, errors: { sku: 'SKU is required' } };
  const exists = existingProducts.some(p => p.sku === sku && p.id !== currentProductId);
  if (exists) return { isValid: false, errors: { sku: 'SKU must be unique' } };
  return { isValid: true, errors: {} };
}

export function validatePositive(value, fieldName) {
  if (value === undefined || value === null || isNaN(value) || value < 0) {
    return { isValid: false, errors: { [fieldName]: `${fieldName} must be a positive number` } };
  }
  return { isValid: true, errors: {} };
}

export function validateRequired(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    return { isValid: false, errors: { [fieldName]: `${fieldName} is required` } };
  }
  return { isValid: true, errors: {} };
}

export function validateEmail(email) {
  const re = /^\\S+@\\S+\\.\\S+$/;
  if (!re.test(email)) {
    return { isValid: false, errors: { email: 'Invalid email address' } };
  }
  return { isValid: true, errors: {} };
}

export function validatePhone(phone) {
  if (!phone || phone.length < 10) {
    return { isValid: false, errors: { phone: 'Invalid phone number' } };
  }
  return { isValid: true, errors: {} };
}

export function validateOrderLines(lines) {
  if (!lines || lines.length === 0) {
    return { isValid: false, errors: { lines: 'At least one order line is required' } };
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.productId) return { isValid: false, errors: { lines: `Product is required on line ${i + 1}` } };
    if (line.qty <= 0) return { isValid: false, errors: { lines: `Quantity must be > 0 on line ${i + 1}` } };
  }
  return { isValid: true, errors: {} };
}
