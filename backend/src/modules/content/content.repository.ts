import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { ManagedContent } from './content.schema.js';

export interface ContentDocument {
  content: ManagedContent;
  updatedAt: string;
}

export class ContentRepository {
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(readonly storageFile: string) {}

  async read(): Promise<ContentDocument | null> {
    try {
      const raw = await readFile(this.storageFile, 'utf8');
      return JSON.parse(raw) as ContentDocument;
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async save(content: ManagedContent): Promise<ContentDocument> {
    const document: ContentDocument = {
      content,
      updatedAt: new Date().toISOString(),
    };
    const temporaryFile = `${this.storageFile}.tmp`;

    this.writeQueue = this.writeQueue
      .catch(() => undefined)
      .then(async () => {
        await mkdir(dirname(this.storageFile), { recursive: true });
        await writeFile(temporaryFile, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
        await rename(temporaryFile, this.storageFile);
      });

    await this.writeQueue;
    return document;
  }
}
