export default {
    variable: {
        header: {
            unfold: '展开',
            fold: '收起'
        },
        context: {
            title: 'OpenGL上下文',
            backgroundColor: '背景色 (RGBA)',
            blend: '',
            cull: '',
            depthTest: '深度测试',
            dither: '',
            polygonOffsetFill: '',
            sampleAlphaToCoverage: '',
            smpCoverage: '',
            scissorTest: '',
            stencilTest: ''
        },
        model: {
            title: '模型',
            displaying: '展示模型',
            loading: '加载中，请稍后...',
            placeholder: '选择模型',
            upload: '上传模型',
            material: {
                displaying: '使用材质',
                placeholder: '选择材质',
                configButton: '材质选项',
                config: {
                    title: '材质选项',
                    key: '键',
                    type: '类型',
                    value: '值',
                    uniform: '映射到'
                }
            },
            aPosition: '顶点位置变量名',
            aNormal: '顶点法线变量名',
            aTexCoord: '纹理坐标变量名',
            aPositionInvalid: '顶点位置不存在',
            aNormalInvalid: '顶点法线不存在',
            aTexCoordInvalid: '纹理坐标不存在',
            uModelMat: '模型矩阵变量名',
            position: '平移 (XYZ)',
            rotate: '旋转 (RPY)'
        },
        camera: {
            title: '相机',
            type: {
                title: '相机类型',
                orthogonal: '正交相机',
                perspective: '透视相机',
                perspectiveStaring: '透视相机（注视一点）'
            },
            uViewMat: '观察矩阵变量名',
            position: '平移 (XYZ)',
            rotation: '旋转 (RPY)',
            staring: {
                position: '注视点 (XYZ)',
                depth: '与注视点间距',
                rotation: '注视方向 (RPY)'
            },
            uProjectionMat: '投影矩阵变量名',
            clip: '裁切平面距离',
            orthogonalWidth: '目标立方体宽',
            fov: '视场角'
        },
        custom: {
            prefix: '自定义',
            suffix: '变量',
            name: '变量名',
            value: '值',
            step: '步长',
            del: {
                title: '删除自定义变量',
                askPrefix: '确定要删除',
                askSuffix: '吗？',
                confirm: '确认',
                cancel: '取消'
            }
        },
        temporal: {
            title: '时间相关变量',
            name: '变量名',
            unit: {
                title: '单位',
                ms: '毫秒',
                s: '秒',
                m: '分钟',
                h: '小时'
            },
            mod: {
                title: '取模方法',
                never: '不取模',
                only: '仅取模',
                triangular: '取模且偶数周期取反',
                normalize: '取模且归一化',
                all: '取模、归一化且偶数周期取反',
            },
            offset: '偏移量 (ms)',
            modulus: '模'
        }
    },
    shaderLog: {
        title: '着色器编译日志',
        vertShader: '顶点着色器',
        fragShader: '片段着色器',
        link: '链接',
        compilePass: '编译通过',
        linkPass: '链接成功',
        unlinked: '未链接'
    },
    setting: {
        title: '设置',
        theme: '主题',
        autoSwitchMaterial: '自动切换材质'
    },
    theme: {
        light: '白昼模式',
        dark: '黑夜模式'
    },
    notification: {
        title: {
            error: '错误'
        },
        message: {
            uniformQueryFailed: '无法识别custom请求字符串。',
            uploadFailedPrefix: '模型',
            uploadFailedSuffix: '上传失败。'
        }
    }
}
