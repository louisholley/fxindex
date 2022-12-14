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

const USER_REGISTER_CONTRACT = "KT1Ezht4PDKZri7aVppVGT4Jkw39sesaFnww";

const requeueUsers = requeue("users");

const indexUserFromTransaction = (t: TransactionOperation) =>
  prisma.user.upsert({
    where: {
      address: t.sender.address,
    },
    create: {
      ...t.sender,
      ...t.parameter.value,
    },
    update: {
      alias: t.sender.alias,
      ...t.parameter.value,
    },
  });

const indexUsers = async (req: NextApiRequest, res: NextApiResponse) => {
  const { from, to, offset = 0 } = req.body;

  if (!from || !to) {
    res.status(400).json({ error: "from and to are required" });
    return;
  }

  const transactions = await getTransactionsBetween(from, to, {
    target: {
      eq: USER_REGISTER_CONTRACT,
    },
    entrypoint: {
      eq: "update_profile",
    },
    offset: {
      el: offset,
    },
  });

  await prisma.$transaction(
    getMostRecentTransactionsBySender(transactions).map(
      indexUserFromTransaction
    )
  );

  if (transactions.length === BATCH_LIMIT) {
    await requeueUsers({ from, to, offset: offset + BATCH_LIMIT });
  }

  res.status(200).json({ success: true });
};

export default indexUsers;
