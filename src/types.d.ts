import HttpStatusCodes from 'http-status-codes';

type StatusCodes = Extract<typeof HttpStatusCodes[keyof typeof HttpStatusCodes], number>;

interface NetlifyCallbackOptions {
  statusCode: StatusCodes;
  isBase64Encoded?: boolean;
  headers?: { [key: string]: string };
  body?: string;
}

type NetlifyCallback = (error: Error | null, callback: NetlifyCallbackOptions) => void;

type HttpVerb = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS';

interface NetlifyEvent {
  path: string;
  httpMethod: HttpVerb;
  headers: { [key: string]: string };
  queryStringParameters: { [key: string]: string };
  body: string;
  isBase64Encoded: boolean;
}

interface NetlifyContext {
  clientContext: {
    identity: any;
    user: any;
  };
}

export type NetlifyHandler = (
  event: NetlifyEvent,
  context: NetlifyContext,
  callback: NetlifyCallback,
) => void;
