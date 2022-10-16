import { PrismaClient } from "@prisma/client";
import {
  Token,
  tokensGetTokenTransfers,
  TokenTransfer,
  TransactionOperation,
} from "@tzkt/sdk-api";
import { NextApiRequest, NextApiResponse } from "next";
import { BATCH_LIMIT, getTransactionsBetween, requeue } from "../../lib";

const prisma = new PrismaClient();

const GENTK_V0_CONTRACT = "KT1KEa8z6vWXDJrVqtMrAeDVzsvxat3kHaCE";

const requeueGentks = requeue("gentks");

const indexGentkFromTransaction = ({
  initiator,
  timestamp,
  parameter: {
    value: {
      token_id,
      issuer_id,
      address: _address,
      metadata: _metadata,
      ...rest
    },
  },
  metadata,
}: TransactionOperation & { metadata: Token["metadata"] }) =>
  prisma.gentk.upsert({
    where: {
      token: token_id,
    },
    create: {
      token: token_id,
      timestamp,
      project: {
        connectOrCreate: {
          where: {
            issuerId: issuer_id,
          },
          create: {
            issuerId: issuer_id,
          },
        },
      },
      minter: {
        connectOrCreate: {
          where: {
            address: initiator.address,
          },
          create: {
            ...initiator,
          },
        },
      },
      metadata,
      ...rest,
    },
    update: {},
  });

const indexGentks = async (req: NextApiRequest, res: NextApiResponse) => {
  const { from, to, offset = 0 } = req.body;

  if (!from || !to) {
    res.status(400).json({ error: "from and to are required" });
    return;
  }

  const transactions = await getTransactionsBetween(from, to, {
    target: {
      eq: GENTK_V0_CONTRACT,
    },
    entrypoint: {
      eq: "mint",
    },
    offset: {
      el: offset,
    },
  });

  const tokens = await tokensGetTokenTransfers({
    transactionId: {
      in: transactions.map((t) => t.id),
    },
  });

  const tokensByTransactionId = tokens.reduce(
    (acc, t) => ({
      ...acc,
      [t.transactionId]: t,
    }),
    {} as Record<string, TokenTransfer>
  );

  await prisma.$transaction(
    transactions.map((t) =>
      indexGentkFromTransaction({
        ...t,
        metadata: tokensByTransactionId[t.id]?.token.metadata || {},
      })
    )
  );

  if (transactions.length === BATCH_LIMIT) {
    await requeueGentks({ from, to, offset: offset + BATCH_LIMIT });
  }

  res.status(200).json({ success: true });
};

export default indexGentks;
