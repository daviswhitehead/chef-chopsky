import { Page, TestInfo } from '@playwright/test';
import { Logger } from './logger';

export type ChatRecord = {
  url: string;
  method: string;
  status?: number;
  requestBody?: string;
  responseBodySnippet?: string;
};

export class FailureDiagnostics {
  private consoleErrors: string[] = [];
  private lastChat?: ChatRecord;

  constructor(private page: Page) {}

  install(): void {
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.consoleErrors.push(msg.text());
      }
    });

    this.page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/ai/chat')) {
        this.lastChat = {
          url,
          method: request.method(),
          requestBody: request.postData() || undefined,
        };
      }
    });

    this.page.on('response', async response => {
      try {
        const url = response.url();
        if (url.includes('/api/ai/chat') && this.lastChat) {
          this.lastChat.status = response.status();
          // Avoid large payloads: capture only first 500 chars
          const text = await response.text().catch(() => '');
          this.lastChat.responseBodySnippet = text ? text.slice(0, 500) : undefined;
        }
      } catch (e) {
        Logger.warn('Diagnostics response hook error:', e);
      }
    });
  }

  getConsoleErrors(): string[] {
    return this.consoleErrors;
  }

  getLastChat(): ChatRecord | undefined {
    return this.lastChat;
  }
}

export async function attachFailureArtifacts(page: Page, testInfo: TestInfo, diagnostics: FailureDiagnostics) {
  if (testInfo.status === 'passed') return;

  const errors = diagnostics.getConsoleErrors();
  if (errors.length) {
    await testInfo.attach('console-errors.txt', {
      body: errors.join('\n'),
      contentType: 'text/plain',
    });
  }

  const chat = diagnostics.getLastChat();
  if (chat) {
    const chatSummary = JSON.stringify(chat, null, 2);
    await testInfo.attach('last-chat.json', {
      body: chatSummary,
      contentType: 'application/json',
    });
  }

  // Capture minimal HTML and a screenshot to help triage
  try {
    await testInfo.attach('page.html', {
      body: await page.content(),
      contentType: 'text/html',
    });
  } catch (e) {
    Logger.warn('Failed to attach page HTML:', e);
  }

  try {
    const buffer = await page.screenshot({ fullPage: false });
    await testInfo.attach('screenshot.png', {
      body: buffer,
      contentType: 'image/png',
    });
  } catch (e) {
    Logger.warn('Failed to attach screenshot:', e);
  }
}


