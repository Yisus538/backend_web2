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
    get comparePassword () {
        return comparePassword;
    },
    get hashPassword () {
        return hashPassword;
    },
    get validatePasswordStrength () {
        return validatePasswordStrength;
    }
});
const _bcrypt = /*#__PURE__*/ _interop_require_wildcard(require("bcrypt"));
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
const hashPassword = (plain)=>_bcrypt.hash(plain, BCRYPT_ROUNDS);
const comparePassword = (plain, hash)=>_bcrypt.compare(plain, hash);
const validatePasswordStrength = (password)=>{
    const rules = [
        {
            test: password.length >= 8,
            msg: 'Mínimo 8 caracteres'
        },
        {
            test: password.length <= 128,
            msg: 'Máximo 128 caracteres'
        },
        {
            test: /[A-Z]/.test(password),
            msg: 'Al menos una mayúscula'
        },
        {
            test: /[a-z]/.test(password),
            msg: 'Al menos una minúscula'
        },
        {
            test: /[0-9]/.test(password),
            msg: 'Al menos un número'
        },
        {
            test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
            msg: 'Al menos un carácter especial'
        }
    ];
    const errors = rules.filter((r)=>!r.test).map((r)=>r.msg);
    return {
        valid: errors.length === 0,
        errors
    };
};

//# sourceMappingURL=password.utils.js.map