export interface WebPage {
  name: string;
  url: string;
}

export const boogle: WebPage = { name: 'Boogle', url: 'www.boogle.com' };
export const notFound: WebPage = { name: '404', url: 'not found' };

export const network: WebPage[] = [
  boogle,
  notFound,
  { name: 'Bacefook', url: 'www.bacefook.com' },
  { name: 'DadGPT', url: 'www.dadgpt.com' },
  { name: 'myOs', url: 'www.myos.com' },
];

export function findPage(url: string): WebPage {
  const normalized = url.trim().toLocaleLowerCase();
  return network.find((page) => page.url.toLocaleLowerCase() === normalized) ?? notFound;
}
