export interface NewsletterSubscriber {
  id?: number;
  email: string | null;
}

export function createNewsletterSubscriber(init?: Partial<NewsletterSubscriber>): NewsletterSubscriber {
  return {
    email: null,
  };
}
