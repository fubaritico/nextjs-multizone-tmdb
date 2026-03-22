import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'

const MONGODB_URI = process.env.MONGODB_URI
const LEGACY_PATH = process.env.LEGACY_PATH

if (!MONGODB_URI) throw new Error('MONGODB_URI is not set in .env')
if (!LEGACY_PATH) throw new Error('LEGACY_PATH is not set in .env')

const config = {
  mcpServers: {
    'rag-legacy': {
      type: 'stdio',
      command: 'pnpm',
      args: [
        '--prefix',
        path.resolve('..', 'vite-mf-monorepo-rag'),
        'run',
        'mcp',
      ],
      env: {
        MONGODB_URI,
        LEGACY_PATH,
      },
    },
  },
}

await fs.writeFile(
  path.resolve('.mcp.json'),
  JSON.stringify(config, null, 2) + '\n'
)

console.warn('✅ .mcp.json generated')
