import type { MetadataRoute } from 'next';
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from '@/constants/app';
export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_NAME} - ${APP_TAGLINE}`,
    short_name: APP_NAME,
    description: APP_DESCRIPTION,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#fffbea',
    theme_color: '#e53935',
    icons: [
      {
        src: '/logo.png',
        sizes: 'any',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
