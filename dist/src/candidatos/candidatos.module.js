"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CandidatosModule", {
    enumerable: true,
    get: function() {
        return CandidatosModule;
    }
});
const _common = require("@nestjs/common");
const _candidatoscontroller = require("./candidatos.controller");
const _candidatosservice = require("./candidatos.service");
const _curriculummodule = require("../curriculum/curriculum.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let CandidatosModule = class CandidatosModule {
};
CandidatosModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _curriculummodule.CurriculumModule
        ],
        controllers: [
            _candidatoscontroller.CandidatosController
        ],
        providers: [
            _candidatosservice.CandidatosService
        ]
    })
], CandidatosModule);

//# sourceMappingURL=candidatos.module.js.map