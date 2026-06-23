import { SessionData } from './session';

declare global {
    namespace Express {
        // Inject additional properties on express.Request
        interface Request {
            session?: SessionData | undefined
        }
    }
}
