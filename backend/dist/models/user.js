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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
class UserModel {
    constructor(client) {
        this.client = client;
    }
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = this.client.db('note-taking-app');
            return yield db.collection('users').findOne({ email });
        });
    }
    findUserByGoogleId(googleId) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = this.client.db('note-taking-app');
            return yield db.collection('users').findOne({ googleId });
        });
    }
    createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = this.client.db('note-taking-app');
            yield db.collection('users').insertOne(user);
        });
    }
    updateUser(email, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const db = this.client.db('note-taking-app');
            yield db.collection('users').updateOne({ email }, { $set: updates });
        });
    }
}
exports.UserModel = UserModel;
