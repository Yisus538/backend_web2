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
    get UpdateEstadoDto () {
        return UpdateEstadoDto;
    },
    get UpdateVacanteDto () {
        return UpdateVacanteDto;
    }
});
const _mappedtypes = require("@nestjs/mapped-types");
const _createvacantedto = require("./create-vacante.dto");
let UpdateVacanteDto = class UpdateVacanteDto extends (0, _mappedtypes.PartialType)(_createvacantedto.CreateVacanteDto) {
};
let UpdateEstadoDto = class UpdateEstadoDto {
};

//# sourceMappingURL=update-vacante.dto.js.map