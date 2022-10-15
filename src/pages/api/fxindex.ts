import { getTransactionsBetween, requeue } from "../../lib";

const fxindex = async (req, res) => {
  // const { from, to } = JSON.parse(req.body);

  // if (!from || !to) {
  //   // first check if there is a last indexed time in the queue
  //   // then index from that time to now and update the queue
  //   return res.status(400).send("Missing from and to");
  // }

  // const args = {
  //   method: "POST",
  //   body: JSON.stringify({
  //     from,
  //     to,
  //   }),
  // };

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

  const from = "2021-11-10 21:48:58";
  const to = "2021-11-11 18:00:00";

  const transactions = await getTransactionsBetween(from, to, {
    target: {
      eq: "KT1KEa8z6vWXDJrVqtMrAeDVzsvxat3kHaCE",
    },
    entrypoint: {
      eq: "mint",
    },
    offset: {
      el: 3000,
    },
  });

  console.log(transactions.length);
  console.log(transactions[0]);

  res.status(200).json({ success: true });
};

export default fxindex;
