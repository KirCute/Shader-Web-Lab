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
