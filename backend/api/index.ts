import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/app';

const app = createApp();

export default function handler(request: VercelRequest, response: VercelResponse): void {
  app(
    request as unknown as Parameters<typeof app>[0],
    response as unknown as Parameters<typeof app>[1],
  );
}
