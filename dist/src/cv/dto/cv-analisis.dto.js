"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get CvAnalisisDto () {
        return CvAnalisisDto;
    },
    get EducacionIaDto () {
        return EducacionIaDto;
    },
    get ExperienciaIaDto () {
        return ExperienciaIaDto;
    },
    get IdiomaIaDto () {
        return IdiomaIaDto;
    },
    get SkillDto () {
        return SkillDto;
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
let SkillDto = class SkillDto {
};
let ExperienciaIaDto = class ExperienciaIaDto {
};
let EducacionIaDto = class EducacionIaDto {
};
let IdiomaIaDto = class IdiomaIaDto {
};
let CvAnalisisDto = class CvAnalisisDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)({
        message: 'candidatoId es requerido'
    }),
    _ts_metadata("design:type", String)
], CvAnalisisDto.prototype, "candidatoId", void 0);

//# sourceMappingURL=cv-analisis.dto.js.map