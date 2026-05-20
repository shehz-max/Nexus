"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProd = exports.isDev = exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().default('3000'),
    // Database
    DATABASE_URL: zod_1.z.string().url(),
    // JWT
    JWT_SECRET: zod_1.z.string().min(32),
    JWT_ACCESS_EXPIRES: zod_1.z.string().default('15m'),
    JWT_REFRESH_EXPIRES: zod_1.z.string().default('7d'),
    // Redis
    REDIS_URL: zod_1.z.string().url().optional(),
    // App URLs
    APP_URL: zod_1.z.string().url().default('http://localhost:5173'),
    API_URL: zod_1.z.string().url().default('http://localhost:3000'),
    // OAuth - Google
    GOOGLE_CLIENT_ID: zod_1.z.string().optional(),
    GOOGLE_CLIENT_SECRET: zod_1.z.string().optional(),
    // OAuth - Slack
    SLACK_CLIENT_ID: zod_1.z.string().optional(),
    SLACK_CLIENT_SECRET: zod_1.z.string().optional(),
    // OAuth - Notion
    NOTION_CLIENT_ID: zod_1.z.string().optional(),
    NOTION_CLIENT_SECRET: zod_1.z.string().optional(),
    // OAuth - HubSpot
    HUBSPOT_CLIENT_ID: zod_1.z.string().optional(),
    HUBSPOT_CLIENT_SECRET: zod_1.z.string().optional(),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
}
exports.env = parsed.data;
exports.isDev = exports.env.NODE_ENV === 'development';
exports.isProd = exports.env.NODE_ENV === 'production';
//# sourceMappingURL=env.js.map