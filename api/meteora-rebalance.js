export default async function handler(req, res) {
  const raw = process.env.REBALANCE_PRIVATE_KEY || '';
  const cleaned = raw.replace(/\s/g, '');
  return res.status(200).json({
    length: cleaned.length,
    start: cleaned.substring(0, 15),
    end: cleaned.substring(cleaned.length - 5),
  });
}