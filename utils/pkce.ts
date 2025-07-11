import { createHash, randomUUID } from 'node:crypto'

export function generatePkce(): { verifier: string, challenge: string } {
  // Generate a random code verifier (43-128 chars)
  const verifier = randomUUID() + randomUUID() + randomUUID()

  // Create code challenge by hashing verifier with SHA256 and base64url encoding
  const challenge = createHash('sha256')
    .update(verifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  return { verifier, challenge }
}
