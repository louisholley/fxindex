import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

const fxindex = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    // get all mints
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

  // const { from, to } = JSON.parse(req.body);

  const from = "2021-11-01T00:00:00";
  const to = "2021-11-02T00:00:00";

  // if (!from || !to) {
  //   // first check if there is a last indexed time in the queue
  //   // then index from that time to now and update the queue
  //   return res.status(400).send("Missing from and to");
  // }

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

  // await Promise.all([
  //   // fetch("http://localhost:3000/api/users", args),
  //   // fetch("http://localhost:3000/api/projects", args),
  //   fetch("http://localhost:3000/api/gentks", {
  //     method: "POST",
  //     body: JSON.stringify({
  //       from: "2021-11-10T19:19:58",
  //       to: "2021-11-11T18:00:00",
  //     }),
  //   }),
  // ]);

  const result = await fetch("http://localhost:3000/api/projects", args);
  console.log(result);

  res.status(200).json({ success: true });
};

export default fxindex;
