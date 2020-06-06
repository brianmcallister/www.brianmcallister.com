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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const spotify = __importStar(require("../services/spotify"));
const user = __importStar(require("../services/user"));
exports.handler = (event, context, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield user.getUser();
        if (!result) {
            callback(new Error('no user'), {
                statusCode: 500,
                body: 'no user'
            });
            return;
        }
        spotify.setTokens(result.access_token, result.refresh_token);
        const [current, me] = yield Promise.all([
            spotify.getCurrentlyPlaying(),
            spotify.getMe()
        ]);
        if (current === null) {
            callback(null, {
                statusCode: 200,
                body: '{}',
            });
            return;
        }
        const details = {
            artist: current.item.artists[0].name,
            album: current.item.album.name,
            image: current.item.album.images[0].url,
            track: current.item.name,
            profile: me.external_urls.spotify
        };
        callback(null, {
            statusCode: 200,
            body: JSON.stringify(details),
        });
    }
    catch (err) {
        console.log(err);
        callback(null, {
            statusCode: 500,
            body: JSON.stringify(err),
        });
    }
});
