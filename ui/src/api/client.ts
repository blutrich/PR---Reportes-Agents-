const BASE = '/api'

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text}`)
  }
  return res.json()
}

async function fetchText(path: string): Promise<string> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text}`)
  }
  return res.text()
}

// --- Clients ---

export interface ClientSummary {
  company_id: string
  company_name: string
  company_industry: string
  company_one_liner_mission: string
  launches: LaunchSummary[]
}

export interface LaunchSummary {
  product_id: string
  launched_product_name: string | null
  launched_product_one_liner: string | null
  status: 'setup' | 'profile_review' | 'researching' | 'research_review' | 'brief_review' | 'approved'
  briefs_count: number
  latest_brief: string | null
}

export function listClients(): Promise<ClientSummary[]> {
  return fetchJson('/clients')
}

export function getCompanyProfile(companyId: string): Promise<any> {
  return fetchJson(`/clients/${companyId}/profile`)
}

// --- Launches ---

export function getLaunchProfile(companyId: string, productId: string): Promise<any> {
  return fetchJson(`/clients/${companyId}/launches/${productId}/profile`)
}

export function getContextStrategy(companyId: string, productId: string): Promise<any> {
  return fetchJson(`/clients/${companyId}/launches/${productId}/context-strategy`)
}

export function getValidatedWaves(companyId: string, productId: string): Promise<any> {
  return fetchJson(`/clients/${companyId}/launches/${productId}/validated-waves`)
}

export function getRawGold(companyId: string, productId: string): Promise<any> {
  return fetchJson(`/clients/${companyId}/launches/${productId}/raw-gold`)
}

export function getUserStories(companyId: string, productId: string): Promise<any> {
  return fetchJson(`/clients/${companyId}/launches/${productId}/user-stories`)
}

export function getLatestBrief(companyId: string, productId: string): Promise<string> {
  return fetchText(`/clients/${companyId}/launches/${productId}/brief/latest`)
}

export function listBriefs(companyId: string, productId: string): Promise<{ filename: string; date: string }[]> {
  return fetchJson(`/clients/${companyId}/launches/${productId}/briefs`)
}

export function getBrief(companyId: string, productId: string, filename: string): Promise<string> {
  return fetchText(`/clients/${companyId}/launches/${productId}/brief/${filename}`)
}
