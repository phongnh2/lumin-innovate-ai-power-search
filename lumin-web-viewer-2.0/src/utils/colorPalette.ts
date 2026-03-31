import { DEFAULT_PALETTE, PALETTE_MAPPER, PALETTE_TYPE_MAPPER, PaletteType } from 'constants/colorPalette';
import { IToolName } from 'constants/toolsName';

type TGetPaletteFromToolNameParams = {
  toolName: IToolName;
  hasAssociatedLink: boolean;
};

export const getPaletteFromToolName = ({ toolName, hasAssociatedLink }: TGetPaletteFromToolNameParams): string[] => {
  const paletteType = hasAssociatedLink ? PaletteType.TYPE : PALETTE_TYPE_MAPPER[toolName];

  return PALETTE_MAPPER[paletteType] || DEFAULT_PALETTE;
};
