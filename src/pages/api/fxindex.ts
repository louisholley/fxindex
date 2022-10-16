import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { subMinutes } from "date-fns";
import { APP_URL } from "../../lib";

const prisma = new PrismaClient();

const fxindex = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    // get all gentks
    const { cursor } = req.query;

    if (typeof cursor !== "string") {
      return res.status(400).json({ error: "invalid cursor" });
    }

    const mints = await prisma.gentk.findMany({
      orderBy: { timestamp: "desc" },
      take: 20,
      skip: cursor ? parseInt(cursor) : 0,
      include: {
        project: true,
        minter: true,
      },
    });

    return res.json(mints);
  }

  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  // run indexer

  const {
    from = subMinutes(new Date(), 30).toISOString(),
    to = new Date().toISOString(),
  } = req.body;

  const args = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
    }),
  };

  await Promise.all([
    fetch(`${APP_URL}/api/users`, args),
    fetch(`${APP_URL}/api/projects`, args),
    fetch(`${APP_URL}/api/gentks`, args),
  ]);

  res.status(200).json({ success: true });
};

export default fxindex;
