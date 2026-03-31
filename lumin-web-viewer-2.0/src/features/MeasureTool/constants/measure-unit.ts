export const FractionalUnitSupport = ['in', 'ft-in'];

export enum PaperUnit {
  in = 'in',
  mm = 'mm',
  cm = 'cm',
  pt = 'pt',
}

export const PaperUnitMapping = {
  [PaperUnit.in]: {
    value: PaperUnit.in,
    label: 'in',
  },
  [PaperUnit.mm]: {
    value: PaperUnit.mm,
    label: 'mm',
  },
  [PaperUnit.cm]: {
    value: PaperUnit.cm,
    label: 'cm',
  },
  [PaperUnit.pt]: {
    value: PaperUnit.pt,
    label: 'pt',
  },
};

export enum DisplayUnit {
  in = 'in',
  mm = 'mm',
  cm = 'cm',
  pt = 'pt',
  ft = 'ft',
  ftIn = 'ft-in',
  m = 'm',
  yd = 'yd',
  km = 'km',
  mi = 'mi',
}

export const DisplayUnitMapping = {
  [DisplayUnit.in]: {
    value: DisplayUnit.in,
    label: 'in',
  },
  [DisplayUnit.mm]: {
    value: DisplayUnit.mm,
    label: 'mm',
  },
  [DisplayUnit.cm]: {
    value: DisplayUnit.cm,
    label: 'cm',
  },
  [DisplayUnit.pt]: {
    value: DisplayUnit.pt,
    label: 'pt',
  },
  [DisplayUnit.ft]: {
    value: DisplayUnit.ft,
    label: 'ft',
  },
  [DisplayUnit.ftIn]: {
    value: DisplayUnit.ftIn,
    label: 'ft-in',
  },
  [DisplayUnit.m]: {
    value: DisplayUnit.m,
    label: 'm',
  },
  [DisplayUnit.yd]: {
    value: DisplayUnit.yd,
    label: 'yd',
  },
  [DisplayUnit.km]: {
    value: DisplayUnit.km,
    label: 'km',
  },
  [DisplayUnit.mi]: {
    value: DisplayUnit.mi,
    label: 'mi',
  },
};

export const MetricUnit = [DisplayUnit.mm, DisplayUnit.cm, DisplayUnit.m, DisplayUnit.km];
