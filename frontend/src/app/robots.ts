import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://pdf-form-editor-b7z8.onrender.com/sitemap.xml',
  };
}
