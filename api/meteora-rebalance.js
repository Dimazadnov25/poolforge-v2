export default async function handler(req, res) {
  try {
    const raw = process.env.REBALANCE_PRIVATE_KEY || '';
    const cleaned = raw.replace(/\s/g, '');
    
    let PRIVATE_KEY;
    try {
      PRIVATE_KEY = JSON.parse(cleaned);
    } catch(e) {
      return res.status(200).json({ step: "key_parse_failed", error: e.message, length: cleaned.length });
    }

    let body;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch(e) {
      return res.status(200).json({ step: "body_parse_failed", error: e.message });
    }

    return res.status(200).json({ 
      step: "all_ok",
      keyLength: PRIVATE_KEY.length,
      poolAddress: body?.poolAddress 
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
