import { describe, expect, it } from 'vitest';
import { boogle, findPage, notFound } from '@/components/running/browser/network';

describe('findPage', () => {
  it('finds pages by url, ignoring case and whitespace', () => {
    expect(findPage(' WWW.Boogle.com ')).toBe(boogle);
  });

  it('returns the 404 page for unknown urls', () => {
    expect(findPage('www.nope.com')).toBe(notFound);
  });
});
