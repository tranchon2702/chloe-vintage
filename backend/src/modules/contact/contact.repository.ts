import { randomUUID } from 'node:crypto';
import { appendFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { CreateContactInput } from './contact.schema.js';

export interface ContactRecord {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export class ContactRepository {
  readonly storageFile: string;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(storageFile: string) {
    this.storageFile = storageFile;
  }

  async create(input: Omit<CreateContactInput, 'website'>): Promise<ContactRecord> {
    const record: ContactRecord = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      name: input.name,
      email: input.email,
      ...(input.subject ? { subject: input.subject } : {}),
      message: input.message,
    };

    this.writeQueue = this.writeQueue
      .catch(() => undefined)
      .then(async () => {
        await mkdir(dirname(this.storageFile), { recursive: true });
        await appendFile(this.storageFile, `${JSON.stringify(record)}\n`, {
          encoding: 'utf8',
          flag: 'a',
        });
      });

    await this.writeQueue;
    return record;
  }
}
