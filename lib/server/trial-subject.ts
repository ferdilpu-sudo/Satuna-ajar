import { createHmac } from 'node:crypto';

export function hashAccountSubject(userId: string, secret: string): string {
  return createHmac('sha256', secret).update(`account:${userId}`).digest('hex');
}
