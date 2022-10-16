import { operationsGetTransactions, TransactionOperation } from "@tzkt/sdk-api";

const BATCH_LIMIT = 100;

const APP_URL = "https://fxindex.up.railway.app";

const requeue =
  (route: string) =>
  async (params: { from: string; to: string; offset: number }) =>
    fetch(`https://qstash.upstash.io/v1/publish/${APP_URL}/api/${route}`, {
      body: JSON.stringify(params),
      headers: {
        Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

const getMostRecentTransactionsBySender = (
  transactions: TransactionOperation[]
) =>
  Object.values(
    transactions.reduce(
      (acc, t) => ({
        ...acc,
        [t.sender.address]: t,
      }),
      {}
    ) as Record<string, TransactionOperation>
  );

type Filters = Pick<
  Parameters<typeof operationsGetTransactions>[0],
  "target" | "entrypoint" | "offset"
>;

const getTransactionsBetween = async (
  from: string,
  to: string,
  filters: Filters = {}
) =>
  operationsGetTransactions({
    ...filters,
    timestamp: {
      gt: from,
      lt: to,
    },
    limit: BATCH_LIMIT,
  });

export {
  requeue,
  getMostRecentTransactionsBySender,
  getTransactionsBetween,
  BATCH_LIMIT,
  APP_URL,
};
