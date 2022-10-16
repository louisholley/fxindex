import { PrismaClient } from "@prisma/client";
import { TransactionOperation } from "@tzkt/sdk-api";
import { NextApiRequest, NextApiResponse } from "next";
import {
  BATCH_LIMIT,
  getMostRecentTransactionsBySender,
  getTransactionsBetween,
  requeue,
} from "../../lib";

const prisma = new PrismaClient();

const ISSUER_V0_CONTRACT = "KT1AEVuykWeuuFX7QkEAMNtffzwhe1Z98hJS";

const requeueProjects = requeue("projects");

const indexProjectFromTransaction = ({
  sender,
  parameter: {
    value: { issuer_id, ...rest },
  },
}: TransactionOperation) =>
  prisma.project.upsert({
    where: {
      issuerId: issuer_id,
    },
    create: {
      issuerId: issuer_id,
      creator: {
        connectOrCreate: {
          where: {
            address: sender.address,
          },
          create: {
            ...sender,
          },
        },
      },
      ...rest,
    },
    update: {
      ...rest,
    },
  });

const indexProjects = async (req: NextApiRequest, res: NextApiResponse) => {
  const { from, to, offset = 0 } = req.body;

  if (!from || !to) {
    res.status(400).json({ error: "from and to are required" });
    return;
  }

  const transactions = await getTransactionsBetween(from, to, {
    target: {
      eq: ISSUER_V0_CONTRACT,
    },
    entrypoint: {
      eq: "update_issuer",
    },
    offset: {
      el: offset,
    },
  });

  await prisma.$transaction(
    getMostRecentTransactionsBySender(transactions).map(
      indexProjectFromTransaction
    )
  );

  if (transactions.length === BATCH_LIMIT) {
    await requeueProjects({ from, to, offset: offset + BATCH_LIMIT });
  }

  res.status(200).json({ success: true });
};

export default indexProjects;
