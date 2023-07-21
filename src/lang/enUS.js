export default {
    variable: {
        header: {
            unfold: 'Unfold',
            fold: 'Fold'
        },
        context: {
            title: 'OpenGL Context',
            backgroundColor: 'BG Color (RGBA)',
            blend: 'Blend',
            cull: 'Cull Face',
            depthTest: 'Depth Test',
            dither: 'Dither',
            polygonOffsetFill: 'Polygon Offset Fill',
            sampleAlphaToCoverage: 'Sample Alpha To Coverage',
            smpCoverage: 'Sample Coverage',
            scissorTest: 'Scissor Test',
            stencilTest: 'Stencil Test'
        },
        model: {
            title: 'Model',
            prefab: {
                cube: 'Cube (Prefab)',
                sphere: 'Sphere (Prefab)'
            },
            displaying: 'Displaying',
            loading: 'Loading...',
            placeholder: 'Select the model',
            upload: 'Upload',
            aPosition: 'Position Attribute',
            aNormal: 'Normal Attribute',
            aTexCoord: 'Texture Coordinate Attribute',
            aPositionInvalid: 'Doesn\'t exists',
            aNormalInvalid: 'Doesn\'t exists',
            aTexCoordInvalid: 'Doesn\'t exists',
            uModelMat: 'M Mat Uniform',
            position: 'Position (XYZ)',
            rotate: 'Rotation (RPY)'
        },
        camera: {
            title: 'Camera',
            type: {
                title: 'Type',
                orthogonal: 'Orthogonal',
                perspective: 'Perspective',
                perspectiveStaring: 'Perspective and staring at a point'
            },
            uViewMat: 'V Mat Uniform',
            position: 'Position (XYZ)',
            rotation: 'Rotation (RPY)',
            staring: {
                position: 'Stare at (XYZ)',
                depth: 'Distance',
                rotation: 'Direction (RPY)'
            },
            uProjectionMat: 'P Mat Uniform',
            clip: 'Near/Far Clip',
            orthogonalWidth: 'Width',
            fov: 'FOV'
        },
        custom: {
            prefix: 'Custom variable ',
            suffix: '',
            name: 'Symbol',
            value: 'Value',
            step: 'Step',
            del: {
                title: 'Delete',
                askPrefix: 'Delete ',
                askSuffix: ' ?',
                confirm: 'Confirm',
                cancel: 'Cancel'
            }
        },
        temporal: {
            title: 'Chrono-variable',
            name: 'Name',
            unit: {
                title: 'Measure',
                ms: 'Millisecond',
                s: 'Second',
                m: 'Minute',
                h: 'Hour'
            },
            mod: {
                title: 'Modulo',
                never: 'Never',
                only: 'Modulo only',
                triangular: 'Modulo and use the opposite in every even period',
                normalize: 'Modulo and normalize',
                all: 'Modulo, normalize and use the opposite in every even period',
            },
            offset: 'Offset (ms)',
            modulus: 'Modulus'
        }
    },
    shaderLog: {
        title: 'Compile Log',
        vertShader: 'Vertex Shader',
        fragShader: 'Fragment Shader',
        link: 'Link',
        compilePass: 'Success',
        linkPass: 'Success',
        unlinked: 'Unlinked'
    },
    setting: {
        title: 'Setting'
    }
}
