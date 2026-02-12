export type RateLimiter = {
  tryConsume: () => boolean;
  getRemaining: () => number;
  getRetryAfterMs: () => number;
};

export function createRateLimiter(limit: number, oknoMs: number): RateLimiter {
  let znacznikiCzasu: number[] = [];

  const prune = (teraz: number) => {
    znacznikiCzasu = znacznikiCzasu.filter((znacznik) => teraz - znacznik < oknoMs);
  };

  return {
    tryConsume() {
      const teraz = Date.now();
      prune(teraz);
      if (znacznikiCzasu.length >= limit) return false;
      znacznikiCzasu.push(teraz);
      return true;
    },
    getRemaining() {
      const teraz = Date.now();
      prune(teraz);
      return Math.max(0, limit - znacznikiCzasu.length);
    },
    getRetryAfterMs() {
      const teraz = Date.now();
      prune(teraz);
      if (znacznikiCzasu.length < limit) return 0;
      const najstarszy = znacznikiCzasu[0] ?? teraz;
      return Math.max(0, oknoMs - (teraz - najstarszy));
    },
  };
}

export default createRateLimiter;
