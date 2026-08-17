import type { Request, Response } from 'express';
import { sendCreated } from '../../utils/ApiResponse.js';
import type { CreateContactInput } from './contact.schema.js';
import type { ContactService } from './contact.service.js';

export const createContactController = (service: ContactService) => ({
  async create(request: Request, response: Response) {
    const input = request.body as CreateContactInput;

    // Quietly accept honeypot submissions without writing them to storage.
    if (input.website) {
      return sendCreated(response, { id: 'received' }, 'Message received');
    }

    const record = await service.submit(input);
    return sendCreated(response, { id: record.id }, 'Message sent');
  },
});
