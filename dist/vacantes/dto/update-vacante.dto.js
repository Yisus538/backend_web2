"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateEstadoDto = exports.UpdateVacanteDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_vacante_dto_1 = require("./create-vacante.dto");
class UpdateVacanteDto extends (0, mapped_types_1.PartialType)(create_vacante_dto_1.CreateVacanteDto) {
}
exports.UpdateVacanteDto = UpdateVacanteDto;
class UpdateEstadoDto {
}
exports.UpdateEstadoDto = UpdateEstadoDto;
//# sourceMappingURL=update-vacante.dto.js.map