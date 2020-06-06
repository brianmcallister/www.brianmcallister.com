"use strict";
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
exports.updateUser = exports.getUser = void 0;
const assert_1 = __importDefault(require("assert"));
const slonik_1 = require("slonik");
const { POSTGRES_CONNECTION_STRING } = process.env;
assert_1.default(POSTGRES_CONNECTION_STRING);
exports.getUser = (user = 'freebowlofsoup') => __awaiter(void 0, void 0, void 0, function* () {
    const pool = slonik_1.createPool(POSTGRES_CONNECTION_STRING);
    const result = yield pool.maybeOne(slonik_1.sql `
    SELECT *
    FROM users
    WHERE id = ${user}
  `);
    yield pool.end();
    return result;
});
exports.updateUser = (id, rawParams) => __awaiter(void 0, void 0, void 0, function* () {
    const pool = slonik_1.createPool(POSTGRES_CONNECTION_STRING);
    const { access_token, refresh_token } = rawParams;
    const fields = [
        { key: 'access_token', value: access_token },
        { key: 'refresh_token', value: refresh_token },
    ];
    const setFields = fields.reduce((acc, next) => {
        if (next.value != null) {
            return [
                ...acc,
                slonik_1.sql.join([slonik_1.sql.identifier([next.key]), next.value], slonik_1.sql ` = `),
            ];
        }
        return acc;
    }, []);
    const query = slonik_1.sql `
    UPDATE users
    SET ${slonik_1.sql.join(setFields, slonik_1.sql `, `)}
    WHERE id = ${id}
  `;
    return pool.query(query);
});
