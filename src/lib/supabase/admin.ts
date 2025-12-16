import { createHash } from 'crypto';

/** ONE-TIME setup */
const ADMIN_HASH = createHash('sha256')
  .update(process.env.NEXT_PUBLIC_ADMIN_KEY as string)
  .digest('hex');

export function verifyAdmin(key: string): boolean {
  const h = createHash('sha256').update(key).digest('hex');
  return h === ADMIN_HASH;
}