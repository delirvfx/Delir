// @flow
export type ParameterType =
    'POINT_2D' |
    'POINT_3D' |
    'SIZE_2D' |
    'SIZE_3D' |
    'COLOR_RGB' |
    'COLOR_RGBA' |
    'NUMBER' |
    'FLOAT' |
    'LAYER' |
    'NONE' |
    'ASSET'

export type ParameterTypeDetail = {
    enabled: true,
    label: string,
}

export type ParameterTypeDescriptor = {
    type: ParameterType,
    enabled: boolean,
    label: string,
}

export default function makeTypeDescriptor(
    type: ParameterType,
    detail: ?ParameterTypeDetail = {}
) : ParameterTypeDescriptor {
    return Object.assign({}, {
        type: 'NONE',
        enabled: true,
        label: '<<UNNAMED PARAMETER>>',
    }, detail, {type})
}

Object.assign(makeTypeDescriptor, {
    point2d: 'POINT_2D',
    point3d: 'POINT_3D',
    size2d: 'SIZE_2D',
    size3d: 'SIZE_3D',
    colorRgb: 'COLOR_RGB',
    colorRgba: 'COLOR_RGBA',
    number: 'NUMBER',
    float: 'FLOAT',
    layer: 'LAYER',
    asset: 'ASSET'
})
