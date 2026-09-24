import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{
    url: 'https://pdf-form-editor-b7z8.onrender.com/',
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1,
  }];
}
