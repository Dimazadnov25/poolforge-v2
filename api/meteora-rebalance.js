export default async function handler(req, res) {
  const raw = process.env.REBALANCE_PRIVATE_KEY;
  return res.status(200).json({
    keyExists: !!raw,
    keyLength: raw ? raw.length : 0,
    keyStart: raw ? raw.substring(0, 10) : 'LEER'
  });
}