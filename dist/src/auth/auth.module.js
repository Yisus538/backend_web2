"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthModule", {
    enumerable: true,
    get: function() {
        return AuthModule;
    }
});
const _common = require("@nestjs/common");
const _passport = require("@nestjs/passport");
const _jwt = require("@nestjs/jwt");
const _authcontroller = require("./auth.controller");
const _authservice = require("./auth.service");
const _navservice = require("./nav.service");
const _jwtstrategy = require("./jwt.strategy");
const _emailmodule = require("../email/email.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let AuthModule = class AuthModule {
};
AuthModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _passport.PassportModule,
            _jwt.JwtModule.register({
                secret: process.env.JWT_SECRET || 'dev_secret_change_in_production_min32chars',
                signOptions: {
                    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
                }
            }),
            _emailmodule.EmailModule
        ],
        controllers: [
            _authcontroller.AuthController
        ],
        providers: [
            _authservice.AuthService,
            _navservice.NavService,
            _jwtstrategy.JwtStrategy
        ],
        exports: [
            _jwtstrategy.JwtStrategy,
            _passport.PassportModule
        ]
    })
], AuthModule);

//# sourceMappingURL=auth.module.js.map