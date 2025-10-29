"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeUser = safeUser;
// src/utils/helpers.ts
function safeUser(u) {
    if (!u)
        return null;
    const { password, ...rest } = u;
    return rest;
}
//# sourceMappingURL=helpers.js.map