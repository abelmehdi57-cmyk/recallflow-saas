export function getAuthErrorMessage(error: Error | { message?: string }): string {
  const message = error?.message || '';

  if (message.includes('Invalid login credentials')) {
    return 'Invalid email or password';
  }

  if (message.includes('already registered') || message.includes('duplicate')) {
    return 'Email already exists';
  }

  return 'Something went wrong. Try again.';
}