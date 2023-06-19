import * as math from 'mathjs';

export function generateIdentityMat4() {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

export function getType(value) {
    switch (typeof value) {
        case 'number':
            return 'float';
        case 'object':
            if (Array.isArray(value)) {
                if (!value.every(v => typeof (v) === 'number')) return 'nan';
                switch (value.length) {
                    case 2:
                        return 'vec2';
                    case 3:
                        return 'vec3';
                    case 4:
                        return 'vec4';
                    case 9:
                        return 'mat3';
                    case 16:
                        return 'mat4';
                    default:
                        return 'nan';
                }
            }
            return 'nan';
        default:
            return 'nan';
    }
}

export function toQuaternion(roll, pitch, yaw) {
    let cy = math.cos(yaw * 0.5);
    let sy = math.sin(yaw * 0.5);
    let cp = math.cos(pitch * 0.5);
    let sp = math.sin(pitch * 0.5);
    let cr = math.cos(roll * 0.5);
    let sr = math.sin(roll * 0.5);

    let x = cy * cp * sr - sy * sp * cr;
    let y = sy * cp * sr + cy * sp * cr;
    let z = sy * cp * cr - cy * sp * sr;
    let w = cy * cp * cr + sy * sp * sr;

    return [x, y, z, w];
}

export function toEuler(x, y, z, w) {
    let sinr_cosp = 2 * (w * x + y * z);
    let cosr_cosp = 1 - 2 * (x * x + y * y);
    let roll = math.atan2(sinr_cosp, cosr_cosp);

    let sinp = 2 * (w * y - z * x);
    let pitch;
    if (math.abs(sinp) >= 1)
        pitch = math.pi * (sinp >= 0. ? 1. : -1.) / 2.;
    else
        pitch = math.asin(sinp);

    let siny_cosp = 2 * (w * z + x * y);
    let cosy_cosp = 1 - 2 * (y * y + z * z);
    let yaw = math.atan2(siny_cosp, cosy_cosp);

    return [roll, pitch, yaw];
}

export function toTranslationMat(x, y, z) {
    return math.matrix([
        [1., 0., 0., x],
        [0., 1., 0., y],
        [0., 0., 1., z],
        [0., 0., 0., 1.]
    ]);
}

export function toRollRotationMat(radian) {
    return math.matrix([
        [1., 0., 0., 0.],
        [0., math.cos(radian), -math.sin(radian), 0.],
        [0., math.sin(radian), math.cos(radian), 0.],
        [0., 0., 0., 1.]
    ])
}

export function toPitchRotationMat(radian) {
    return math.matrix([
        [math.cos(radian), 0., math.sin(radian), 0.],
        [0., 1., 0., 0.],
        [-math.sin(radian), 0., math.cos(radian), 0.],
        [0., 0., 0., 1.]
    ]);
}

export function toYawRotationMat(radian) {
    return math.matrix([
        [math.cos(radian), -math.sin(radian), 0., 0.],
        [math.sin(radian), math.cos(radian), 0., 0.],
        [0., 0., 1., 0.],
        [0., 0., 0., 1.]
    ]);
}

export function toRotationMat(roll, pitch, yaw) {
    return math.multiply(toYawRotationMat(yaw), math.multiply(toPitchRotationMat(pitch), toRollRotationMat(roll)));
}

export function mathjsMatToArray(mat, transpose = false) {
    const size = mat.size();
    let ret = new Array(size[0] * size[1]);
    for (let i = 0; i < size[0]; i++) {
        for (let j = 0; j < size[1]; j++) {
            ret[(transpose ? i + j * size[0] : i * size[1] + j)] = mat.get([i, j]);
        }
    }
    return ret;
}

export function hexToRgba(hex) {
    const rgb = hexToRgb(hex.substring(0, 7));
    const a = parseInt(hex.substring(7, 9), 16) / 255.;
    return [rgb[0], rgb[1], rgb[2], Number(a.toFixed(3))];
}

export function rgbaToHex(r, g, b, a) {
    const hexRGB = rgbToHex(r, g, b);
    a = a > 1. ? 1. : (a < 0. ? 0. : a);
    const hexA = Math.round(a * 255).toString(16).padStart(2, '0');
    return `${hexRGB}${hexA}`.toUpperCase();
}

export function hexToRgb(hex) {
    const r = parseInt(hex.substring(1, 3), 16) / 255.;
    const g = parseInt(hex.substring(3, 5), 16) / 255.;
    const b = parseInt(hex.substring(5, 7), 16) / 255.;
    return [Number(r.toFixed(3)), Number(g.toFixed(3)), Number(b.toFixed(3))];
}

export function rgbToHex(r, g, b) {
    r = r > 1. ? 1. : (r < 0. ? 0. : r);
    g = g > 1. ? 1. : (g < 0. ? 0. : g);
    b = b > 1. ? 1. : (b < 0. ? 0. : b);
    const hexR = Math.round(r * 255).toString(16).padStart(2, '0');
    const hexG = Math.round(g * 255).toString(16).padStart(2, '0');
    const hexB = Math.round(b * 255).toString(16).padStart(2, '0');
    return `#${hexR}${hexG}${hexB}`.toUpperCase();
}
