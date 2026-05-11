// create-vacante.dto.ts
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateVacanteDto", {
    enumerable: true,
    get: function() {
        return CreateVacanteDto;
    }
});
const _classvalidator = require("class-validator");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CreateVacanteDto = class CreateVacanteDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.Length)(3, 150, {
        message: 'El título debe tener entre 3 y 150 caracteres'
    }),
    _ts_metadata("design:type", String)
], CreateVacanteDto.prototype, "titulo", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.Length)(10, 10000, {
        message: 'La descripción debe tener al menos 10 caracteres'
    }),
    _ts_metadata("design:type", String)
], CreateVacanteDto.prototype, "descripcion", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsIn)([
        'borrador',
        'abierta',
        'pausada',
        'cerrada'
    ], {
        message: 'Estado inválido'
    }),
    _ts_metadata("design:type", String)
], CreateVacanteDto.prototype, "estado", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateVacanteDto.prototype, "categoria", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateVacanteDto.prototype, "modalidad", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    (0, _classvalidator.Max)(50),
    _ts_metadata("design:type", Number)
], CreateVacanteDto.prototype, "experienciaMinima", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], CreateVacanteDto.prototype, "salarioMin", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], CreateVacanteDto.prototype, "salarioMax", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Object)
], CreateVacanteDto.prototype, "requisitos", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Object)
], CreateVacanteDto.prototype, "matchingWeights", void 0);

//# sourceMappingURL=create-vacante.dto.js.map