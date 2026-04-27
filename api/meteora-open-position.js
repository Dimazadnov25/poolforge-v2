export default async function handler(req, res) {
  try {
    const dlmmModule = await import("@meteora-ag/dlmm");
    const keys = Object.keys(dlmmModule);
    return res.status(200).json({ keys, hasDefault: !!dlmmModule.default });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
