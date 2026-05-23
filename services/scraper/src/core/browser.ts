import type { Browser, BrowserContext } from 'playwright'

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
]

let _browser: Browser | null = null

export async function getBrowser(): Promise<Browser> {
  if (!_browser || !_browser.isConnected()) {
    // Dynamic import so missing playwright doesn't crash the process at startup
    const { chromium } = await import('playwright-extra')
    const { default: StealthPlugin } = await import('puppeteer-extra-plugin-stealth')
    chromium.use(StealthPlugin())

    const launchArgs: string[] = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    const proxyUrl = process.env.PROXY_URL || process.env.BRIGHTDATA_PROXY_URL
    if (proxyUrl) launchArgs.push(`--proxy-server=${proxyUrl}`)

    _browser = await chromium.launch({ headless: true, args: launchArgs })
  }
  return _browser
}

export async function newStealthContext(): Promise<BrowserContext> {
  const browser = await getBrowser()
  const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
  const ctx = await browser.newContext({
    userAgent: ua,
    locale: 'he-IL',
    timezoneId: 'Asia/Jerusalem',
    viewport: { width: 1366, height: 768 },
    extraHTTPHeaders: { 'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8' },
  })
  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
  })
  return ctx
}

export async function closeBrowser() {
  await _browser?.close()
  _browser = null
}

export function randomDelay(min = 2000, max = 7000): Promise<void> {
  return new Promise(r => setTimeout(r, Math.random() * (max - min) + min))
}
