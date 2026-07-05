type UsageRecord = { messageCount: number; lastRequestAt: number };

const usageStore = new Map<string, UsageRecord>();
let globalSpendUSD = 0;

export const LIMITS = {
  MAX_MESSAGES_PER_USER: 18,      // lifetime, merged across both personas
  MAX_INPUT_CHARS: 500,           // caps user message length
  MAX_OUTPUT_TOKENS: 300,         // caps AI reply length
  MIN_MS_BETWEEN_REQUESTS: 3000,  // rate limit
  BUDGET_USD: 2,
  KILL_SWITCH_RATIO: 0.85,        // pause at 85% of budget
};

const INPUT_COST_PER_TOKEN = 0.14 / 1_000_000;
const OUTPUT_COST_PER_TOKEN = 0.28 / 1_000_000;

function getRecord(userId: string): UsageRecord {
  if (!usageStore.has(userId)) {
    usageStore.set(userId, { messageCount: 0, lastRequestAt: 0 });
  }
  return usageStore.get(userId)!;
}

export function checkRateLimit(userId: string): boolean {
  const record = getRecord(userId);
  const now = Date.now();
  if (now - record.lastRequestAt < LIMITS.MIN_MS_BETWEEN_REQUESTS) return false;
  record.lastRequestAt = now;
  return true;
}

export function checkQuota(userId: string): boolean {
  return getRecord(userId).messageCount < LIMITS.MAX_MESSAGES_PER_USER;
}

export function incrementMessageCount(userId: string) {
  getRecord(userId).messageCount += 1;
}

export function getRemainingMessages(userId: string): number {
  return Math.max(0, LIMITS.MAX_MESSAGES_PER_USER - getRecord(userId).messageCount);
}

export function recordSpend(inputTokens: number, outputTokens: number) {
  globalSpendUSD += inputTokens * INPUT_COST_PER_TOKEN + outputTokens * OUTPUT_COST_PER_TOKEN;
}

export function isBudgetExhausted(): boolean {
  return globalSpendUSD >= LIMITS.BUDGET_USD * LIMITS.KILL_SWITCH_RATIO;
}