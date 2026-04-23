import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CLIENTS_DIR = path.resolve(__dirname, '../../clients')

const app = express()
app.use(cors())
app.use(express.json())

// --- Helpers ---

function readJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    return null
  }
}

function fileExists(filePath) {
  return fs.existsSync(filePath)
}

function determineLaunchStatus(launchDir) {
  const hasInput = fileExists(path.join(launchDir, 'input/launch_input.md'))
  const hasProfile = fileExists(path.join(launchDir, 'processed/product_profile.json'))
  const hasStrategy = fileExists(path.join(launchDir, 'processed/context_strategy.json'))
  const hasWaves = fileExists(path.join(launchDir, 'processed/validated_waves.json'))
  const briefsDir = path.join(launchDir, 'briefs')
  const hasBriefs = fileExists(briefsDir) && fs.readdirSync(briefsDir, { withFileTypes: true }).filter(d => d.isDirectory()).length > 0

  if (hasBriefs) return 'brief_review'
  if (hasWaves) return 'research_review'
  if (hasStrategy) return 'researching'
  if (hasProfile) return 'profile_review'
  if (hasInput) return 'setup'
  return 'setup'
}

function getBriefsList(launchDir) {
  const briefsDir = path.join(launchDir, 'briefs')
  if (!fileExists(briefsDir)) return []
  return fs.readdirSync(briefsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort()
    .reverse()
    .map(timestamp => {
      const subDir = path.join(briefsDir, timestamp)
      const hasOriginal = fileExists(path.join(subDir, 'brief.md'))
      const hasEdited = fileExists(path.join(subDir, 'brief_edited.md'))
      const hasNotes = fileExists(path.join(subDir, 'editor_notes.md'))
      const match = timestamp.match(/(\d{2})-(\d{2})-(\d{4})_(\d{2})-(\d{2})-(\d{2})/)
      const date = match ? `${match[3]}-${match[2]}-${match[1]} ${match[4]}:${match[5]}` : timestamp
      return { timestamp, date, hasOriginal, hasEdited, hasNotes }
    })
}

// --- Routes ---

// List all clients with their launches
app.get('/api/clients', (req, res) => {
  if (!fileExists(CLIENTS_DIR)) return res.json([])

  const clients = fs.readdirSync(CLIENTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => {
      const clientDir = path.join(CLIENTS_DIR, d.name)
      const profile = readJsonSafe(path.join(clientDir, 'company_profile.json'))

      const launchesDir = path.join(clientDir, 'launches')
      let launches = []
      if (fileExists(launchesDir)) {
        launches = fs.readdirSync(launchesDir, { withFileTypes: true })
          .filter(ld => ld.isDirectory())
          .map(ld => {
            const launchDir = path.join(launchesDir, ld.name)
            const productProfile = readJsonSafe(path.join(launchDir, 'processed/product_profile.json'))
            const briefs = getBriefsList(launchDir)
            return {
              product_id: ld.name,
              launched_product_name: productProfile?.launched_product_name || null,
              launched_product_one_liner: productProfile?.launched_product_one_liner || null,
              status: determineLaunchStatus(launchDir),
              briefs_count: briefs.length,
              latest_brief: briefs[0]?.timestamp || null,
            }
          })
      }

      return {
        company_id: d.name,
        company_name: profile?.company_name || d.name,
        company_industry: profile?.company_industry || '',
        company_one_liner_mission: profile?.company_one_liner_mission || '',
        launches,
      }
    })

  res.json(clients)
})

// Get company profile
app.get('/api/clients/:companyId/profile', (req, res) => {
  const filePath = path.join(CLIENTS_DIR, req.params.companyId, 'company_profile.json')
  const data = readJsonSafe(filePath)
  if (!data) return res.status(404).json({ error: 'Company profile not found' })
  res.json(data)
})

// Get product profile
app.get('/api/clients/:companyId/launches/:productId/profile', (req, res) => {
  const filePath = path.join(CLIENTS_DIR, req.params.companyId, 'launches', req.params.productId, 'processed/product_profile.json')
  const data = readJsonSafe(filePath)
  if (!data) return res.status(404).json({ error: 'Product profile not found' })
  res.json(data)
})

// Get context strategy
app.get('/api/clients/:companyId/launches/:productId/context-strategy', (req, res) => {
  const filePath = path.join(CLIENTS_DIR, req.params.companyId, 'launches', req.params.productId, 'processed/context_strategy.json')
  const data = readJsonSafe(filePath)
  if (!data) return res.status(404).json({ error: 'Context strategy not found' })
  res.json(data)
})

// Get validated waves
app.get('/api/clients/:companyId/launches/:productId/validated-waves', (req, res) => {
  const filePath = path.join(CLIENTS_DIR, req.params.companyId, 'launches', req.params.productId, 'processed/validated_waves.json')
  const data = readJsonSafe(filePath)
  if (!data) return res.status(404).json({ error: 'Validated waves not found' })
  res.json(data)
})

// Get raw gold
app.get('/api/clients/:companyId/launches/:productId/raw-gold', (req, res) => {
  const filePath = path.join(CLIENTS_DIR, req.params.companyId, 'launches', req.params.productId, 'processed/raw_gold.json')
  const data = readJsonSafe(filePath)
  if (!data) return res.status(404).json({ error: 'Raw gold not found' })
  res.json(data)
})

// Get user stories
app.get('/api/clients/:companyId/launches/:productId/user-stories', (req, res) => {
  const filePath = path.join(CLIENTS_DIR, req.params.companyId, 'launches', req.params.productId, 'processed/user_stories.json')
  const data = readJsonSafe(filePath)
  if (!data) return res.status(404).json({ error: 'User stories not found' })
  res.json(data)
})

// List briefs
app.get('/api/clients/:companyId/launches/:productId/briefs', (req, res) => {
  const launchDir = path.join(CLIENTS_DIR, req.params.companyId, 'launches', req.params.productId)
  res.json(getBriefsList(launchDir))
})

// Get latest brief (prefer edited, fall back to original)
app.get('/api/clients/:companyId/launches/:productId/brief/latest', (req, res) => {
  const launchDir = path.join(CLIENTS_DIR, req.params.companyId, 'launches', req.params.productId)
  const briefs = getBriefsList(launchDir)
  if (briefs.length === 0) return res.status(404).send('No briefs found')
  const latest = briefs[0]
  const briefsDir = path.join(launchDir, 'briefs', latest.timestamp)
  const editedPath = path.join(briefsDir, 'brief_edited.md')
  const originalPath = path.join(briefsDir, 'brief.md')
  const filePath = fileExists(editedPath) ? editedPath : originalPath
  if (!fileExists(filePath)) return res.status(404).send('Brief not found')
  const content = fs.readFileSync(filePath, 'utf-8')
  res.type('text/plain').send(content)
})

// Get specific brief by timestamp and file type
app.get('/api/clients/:companyId/launches/:productId/brief/:timestamp/:fileType', (req, res) => {
  const fileMap = { edited: 'brief_edited.md', original: 'brief.md', notes: 'editor_notes.md' }
  const fileName = fileMap[req.params.fileType]
  if (!fileName) return res.status(400).send('Invalid file type. Use: edited, original, or notes')
  const filePath = path.join(CLIENTS_DIR, req.params.companyId, 'launches', req.params.productId, 'briefs', req.params.timestamp, fileName)
  if (!fileExists(filePath)) return res.status(404).send('Brief not found')
  const content = fs.readFileSync(filePath, 'utf-8')
  res.type('text/plain').send(content)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Front Page API running on http://localhost:${PORT}`)
  console.log(`Reading clients from: ${CLIENTS_DIR}`)
})
