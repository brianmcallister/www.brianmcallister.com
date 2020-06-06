"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshAccessToken = exports.getAccessTokens = exports.getAuthUrl = exports.getMe = exports.getCurrentlyPlaying = exports.setTokens = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const assert_1 = __importDefault(require("assert"));
const user = __importStar(require("./user"));
const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, REDIRECT_URI, } = process.env;
const SCOPES = "user-read-currently-playing user-read-playback-state";
// const REDIRECT_URI = `https://${PROJECT_DOMAIN}.glitch.me/result`;
const SPOTIFY_ACCOUNTS_URL = "https://accounts.spotify.com";
const SPOTIFY_API_BASE_URL = "https://api.spotify.com";
const tokens = {
    access_token: null,
    refresh_token: null
};
exports.setTokens = (access_token, refresh_token) => {
    if (access_token) {
        tokens.access_token = access_token;
    }
    if (refresh_token) {
        tokens.refresh_token = refresh_token;
    }
};
const makeRequest = (apiUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const url = new URL(`v1/${apiUrl}`, SPOTIFY_API_BASE_URL);
    const req = yield node_fetch_1.default(url, {
        headers: {
            authorization: `Bearer ${tokens.access_token}`
        }
    });
    // Spotify will send back 204 if a response is
    // "empty" (i.e. you ask for the currently playing track
    // but nothing is playing)
    if (req.status === 204) {
        return null;
    }
    const json = yield req.json();
    if (!req.ok && req.status === 401 && json.error.message === 'The access token expired') {
        const { access_token } = yield exports.refreshAccessToken();
        module.exports.setTokens(access_token);
        user.updateUser('freebowlofsoup', { access_token, refresh_token: tokens.refresh_token });
        return makeRequest(apiUrl);
    }
    return json;
});
exports.getCurrentlyPlaying = () => __awaiter(void 0, void 0, void 0, function* () { return makeRequest("me/player/currently-playing"); });
exports.getMe = () => __awaiter(void 0, void 0, void 0, function* () { return makeRequest("me"); });
exports.getAuthUrl = () => {
    assert_1.default(REDIRECT_URI);
    const url = new URL("authorize", SPOTIFY_ACCOUNTS_URL);
    url.search = (new URLSearchParams({
        response_type: "code",
        client_id: SPOTIFY_CLIENT_ID,
        scope: SCOPES,
        redirect_uri: REDIRECT_URI
    })).toString();
    return url;
};
exports.getAccessTokens = (code) => __awaiter(void 0, void 0, void 0, function* () {
    assert_1.default(SPOTIFY_CLIENT_ID);
    assert_1.default(SPOTIFY_CLIENT_SECRET);
    assert_1.default(REDIRECT_URI);
    const tokenUrl = new URL("api/token", SPOTIFY_ACCOUNTS_URL);
    const req = yield node_fetch_1.default(tokenUrl, {
        method: "POST",
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: REDIRECT_URI,
            client_id: SPOTIFY_CLIENT_ID,
            client_secret: SPOTIFY_CLIENT_SECRET
        })
    });
    return req.json();
});
exports.refreshAccessToken = () => __awaiter(void 0, void 0, void 0, function* () {
    assert_1.default(tokens.refresh_token);
    const tokenUrl = new URL("api/token", SPOTIFY_ACCOUNTS_URL);
    const client = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
    const authorization = `Basic ${client.toString("base64")}`;
    const req = yield node_fetch_1.default(tokenUrl, {
        method: "POST",
        headers: {
            authorization
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: tokens.refresh_token
        })
    });
    return req.json();
});
