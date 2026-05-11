"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RegisterDto", {
    enumerable: true,
    get: function() {
        return RegisterDto;
    }
});
const _classvalidator = require("class-validator");
const _classtransformer = require("class-transformer");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let RegisterDto = class RegisterDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.Length)(2, 100, {
        message: 'Entre 2 y 100 caracteres'
    }),
    (0, _classvalidator.IsNotEmpty)({
        message: 'El nombre completo es requerido'
    }),
    _ts_metadata("design:type", String)
], RegisterDto.prototype, "fullName", void 0);
_ts_decorate([
    (0, _classvalidator.IsEmail)({}, {
        message: 'Correo inválido'
    }),
    (0, _classtransformer.Transform)(({ value })=>value?.trim().toLowerCase()),
    _ts_metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.Length)(8, 128, {
        message: 'Entre 8 y 128 caracteres'
    }),
    _ts_metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)({
        message: 'Confirmá tu contraseña'
    }),
    _ts_metadata("design:type", String)
], RegisterDto.prototype, "confirmPassword", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)([
        'candidate',
        'company'
    ], {
        message: 'Rol inválido. Debe ser candidate o company'
    }),
    _ts_metadata("design:type", String)
], RegisterDto.prototype, "role", void 0);

//# sourceMappingURL=register.dto.js.map