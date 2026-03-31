const { Scale } = window.Core;

export const PRECISION_PRESET = [
  {
    value: 0.1,
    label: '0.1',
  },
  {
    value: 0.01,
    label: '0.01',
  },
  {
    value: 0.001,
    label: '0.001',
  },
  {
    value: 0.0001,
    label: '0.0001',
  },
];

export const PRECISION_FRACTIONAL_PRESET = [
  {
    value: 1 / 8,
    label: '1/8',
  },
  {
    value: 1 / 16,
    label: '1/16',
  },
  {
    value: 1 / 32,
    label: '1/32',
  },
  {
    value: 1 / 64,
    label: '1/64',
  },
];

export const COMMON_SCALE_FACTORS = [
  {
    value: new Scale([
      [1, 'mm'],
      [10, 'mm'],
    ]),
    label: '1:10',
  },
  {
    value: new Scale([
      [1, 'mm'],
      [20, 'mm'],
    ]),
    label: '1:20',
  },
  {
    value: new Scale([
      [1, 'mm'],
      [50, 'mm'],
    ]),
    label: '1:50',
  },
  {
    value: new Scale([
      [1, 'mm'],
      [100, 'mm'],
    ]),
    label: '1:100',
  },
  {
    value: new Scale([
      [1, 'mm'],
      [200, 'mm'],
    ]),
    label: '1:200',
  },
  {
    value: new Scale([
      [1, 'mm'],
      [1000, 'mm'],
    ]),
    label: '1:1000',
  },
];

export const COMMON_FRACTIONAL_SCALE_FACTORS = [
  {
    value: new Scale([
      [1 / 16, 'in'],
      [1, 'ft-in'],
    ]),
    label: '1/16"=1\'-0"',
  },
  {
    value: new Scale([
      [3 / 32, 'in'],
      [1, 'ft-in'],
    ]),
    label: '3/32"=1\'-0"',
  },
  {
    value: new Scale([
      [1 / 8, 'in'],
      [1, 'ft-in'],
    ]),
    label: '1/8"=1\'-0"',
  },
  {
    value: new Scale([
      [3 / 16, 'in'],
      [1, 'ft-in'],
    ]),
    label: '3/16"=1\'-0"',
  },
  {
    value: new Scale([
      [1 / 4, 'in'],
      [1, 'ft-in'],
    ]),
    label: '1/4"=1\'-0"',
  },
  {
    value: new Scale([
      [3 / 8, 'in'],
      [1, 'ft-in'],
    ]),
    label: '3/8"=1\'-0"',
  },
  {
    value: new Scale([
      [1 / 2, 'in'],
      [1, 'ft-in'],
    ]),
    label: '1/2"=1\'-0"',
  },
  {
    value: new Scale([
      [3 / 4, 'in'],
      [1, 'ft-in'],
    ]),
    label: '3/4"=1\'-0"',
  },
  {
    value: new Scale([
      [1, 'in'],
      [1, 'ft-in'],
    ]),
    label: '1"=1\'-0"',
  },
];

export const PRECISION_DEFAULT_FOR_CALIBRATION = {
  FRACTIONAL: 1 / 64,
  DECIMAL: 0.0001,
};
