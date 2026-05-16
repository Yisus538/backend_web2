"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PostulacionesModule", {
    enumerable: true,
    get: function() {
        return PostulacionesModule;
    }
});
const _common = require("@nestjs/common");
const _postulacionescontroller = require("./postulaciones.controller");
const _postulacionesservice = require("./postulaciones.service");
const _emailmodule = require("../email/email.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let PostulacionesModule = class PostulacionesModule {
};
PostulacionesModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _emailmodule.EmailModule
        ],
        controllers: [
            _postulacionescontroller.PostulacionesController
        ],
        providers: [
            _postulacionesservice.PostulacionesService
        ],
        exports: [
            _postulacionesservice.PostulacionesService
        ]
    })
], PostulacionesModule);

//# sourceMappingURL=postulaciones.module.js.map