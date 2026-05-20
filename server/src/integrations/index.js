"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hubspotAdapter = exports.googleSheetsAdapter = exports.notionAdapter = exports.slackAdapter = exports.googleAdapter = exports.integrationAdapters = void 0;
const google_js_1 = __importDefault(require("./google.js"));
exports.googleAdapter = google_js_1.default;
const slack_js_1 = __importDefault(require("./slack.js"));
exports.slackAdapter = slack_js_1.default;
const notion_js_1 = __importDefault(require("./notion.js"));
exports.notionAdapter = notion_js_1.default;
const google_sheets_js_1 = __importDefault(require("./google-sheets.js"));
exports.googleSheetsAdapter = google_sheets_js_1.default;
const hubspot_js_1 = __importDefault(require("./hubspot.js"));
exports.hubspotAdapter = hubspot_js_1.default;
exports.integrationAdapters = {
    gmail: google_js_1.default,
    'google-sheets': google_sheets_js_1.default,
    slack: slack_js_1.default,
    notion: notion_js_1.default,
    hubspot: hubspot_js_1.default,
};
//# sourceMappingURL=index.js.map