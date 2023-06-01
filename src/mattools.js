export function generateIdentityMat4() {
    return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
}

export function getType(value) {
    switch (typeof value) {
        case 'number':
            return 'float';
        case 'object':
            if (Array.isArray(value)) {
                if (!value.every(v => typeof(v) === 'number')) return 'nan';
                switch (value.length) {
                    case 2: return 'vec2';
                    case 3: return 'vec3';
                    case 4: return 'vec4';
                    case 9: return 'mat3';
                    case 16: return 'mat4';
                    default: return 'nan';
                }
            }
            return 'nan';
        default:
            return 'nan';
    }
}