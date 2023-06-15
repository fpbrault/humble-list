// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const response = await fetch("https://gist.githubusercontent.com/fpbrault/1a314f454d1d31d53b0742cfbeb2ee5c/raw/")
  const games = await response.json()
  res.status(200).json(games)
}
