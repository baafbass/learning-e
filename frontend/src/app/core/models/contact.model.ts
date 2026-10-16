import { PageQuery } from './page.model';

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactMessage extends ContactPayload {
  id: number;
  is_read: boolean;
  created_at: string;
}

export interface ContactQuery extends PageQuery {
  is_read?: boolean | '';
}
