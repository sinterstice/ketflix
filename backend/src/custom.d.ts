import { SessionData } from './session';

declare global {
    namespace Express {
        // Inject additional properties on express.Request
        interface Request {
            session?: SessionData | undefined
        }
    }

    namespace NodeJS {
        interface ProcessEnv {
            SMTP_KEY: string;
            IPTORRENTS_USER: string;
            IPTORRENTS_PASS: string;
        }
    }
}
