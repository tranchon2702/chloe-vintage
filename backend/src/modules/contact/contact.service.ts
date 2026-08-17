import type { CreateContactInput } from './contact.schema.js';
import { ContactRepository } from './contact.repository.js';

export class ContactService {
  constructor(private readonly repository: ContactRepository) {}

  async submit(input: CreateContactInput) {
    const { website: _honeypot, ...contact } = input;
    return this.repository.create(contact);
  }
}
