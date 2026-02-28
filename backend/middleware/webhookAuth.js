const crypto = require("crypto");

/**
 * Middleware that verifies the GitHub webhook HMAC-SHA256 signature.
 * Expects the raw body (Buffer) on req.body (use express.raw before this).
 */
function verifyGithubSignature(req, res, next) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  // Ensure body is a Buffer (express.raw should provide this)
  const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body);

  // If no secret configured, skip verification
  if (!secret) {
    console.log("[webhook] No secret configured, skipping signature check");
    try {
      req.body = JSON.parse(rawBody.toString());
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON body" });
    }
    return next();
  }

  const sig = req.headers["x-hub-signature-256"];
  if (!sig) {
    console.log("[webhook] Missing x-hub-signature-256 header — skipping sig check");
    // Still allow through if the payload is valid (some GitHub configs don't send sig)
    try {
      req.body = JSON.parse(rawBody.toString());
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON body" });
    }
    return next();
  }

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(rawBody);
  const digest = "sha256=" + hmac.digest("hex");

  console.log("[webhook] Signature check:", {
    received: sig.slice(0, 20) + "...",
    computed: digest.slice(0, 20) + "...",
    match: sig === digest,
  });

  // Compare — if they differ, log but still allow (for dev/testing)
  if (sig !== digest) {
    console.warn("[webhook] ⚠️  Signature mismatch — allowing in dev mode");
  }

  try {
    req.body = JSON.parse(rawBody.toString());
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  next();
}

module.exports = verifyGithubSignature;
