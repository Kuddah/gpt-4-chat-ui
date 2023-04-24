import type { NextApiRequest, NextApiResponse } from "next";
import { askToExtractParameters } from "./extractedParameters";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { responseContent } = req.body;

    try {
      const extractedParameters = await askToExtractParameters(responseContent);
      res.status(200).json({ extractedParameters });
    } catch (error) {
      res.status(500).json({ error: "Unable to extract parameters" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
