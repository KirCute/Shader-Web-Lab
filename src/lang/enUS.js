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
            displaying: 'Displaying',
            loading: 'Loading...',
            placeholder: 'Select the model',
            upload: 'Upload',
            material: {
                displaying: 'Material',
                placeholder: 'Select the masterial',
                configButton: 'Configure',
                config: {
                    title: 'Material Configure',
                    key: 'Key',
                    type: 'Type',
                    value: 'Value',
                    uniform: 'Bind to'
                }
            },
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
        title: 'Setting',
        theme: 'Theme',
        autoSwitchMaterial: 'Auto-Switch Material',
        maxDisToFarClip: 'Max Far Clip'
    },
    theme: {
        light: 'Light',
        dark: 'Dark'
    },
    notification: {
        title: {
            error: 'Error'
        },
        message: {
            uniformQueryFailed: 'Can\'t parse \'custom\' query string.',
            uploadFailedPrefix: 'Failed to upload model: ',
            uploadFailedSuffix: '.'
        }
    },
    share: {
        title: 'Share',
        customContainIllegalCharError: 'Error: There are non-latin characters in custom uniforms panel, which is not allowed.',
        description: {
            1: 'Share link can share your uniforms and shader code to others. If you hope to use a custom model, you should gain its static url and fill the url in the table below.',
            2: 'You may upload the model into a GitHub repository and get a static link starting with \'raw.githubusercontent.com\'.',
        },
        uploadTitle: 'Upload Custom Models',
        uploadNameHeader: 'File Name (Avoid duplicate)',
        uploadUrlHeader: 'Link',
        defaultUsingTitle: 'Default displaying',
        modelTitle: 'Model',
        modelFileNamePlaceholder: 'File Name',
        modelMeshNamePlaceholder: 'Mesh Name (Default the first in the file)',
        materialTitle: 'Material',
        materialFileNamePlaceholder: 'File Name',
        materialIndexPlaceholder: 'Index (Default 0)',
        selectAllTooltip: 'Select All',
        copyTooltip: 'Copy',
        copySuccess: 'Copy share link successfully',
        copyError: 'Failed to copy share link'
    }
}
