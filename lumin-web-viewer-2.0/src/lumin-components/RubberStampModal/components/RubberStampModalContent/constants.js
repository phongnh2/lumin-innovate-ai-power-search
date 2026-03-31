// NOTE: fonts defined here associate with file:
// src/lumin-components/RubberStampModal/components/RubberStampModalContent/RubberStampModalContent.scss

const _defaultFonts = [
  { name: 'Helvetica', value: 'Helvetica', class: 'font-helvetica' },
  { name: 'Times New Roman', value: 'Times New Roman', class: 'font-times-new-roman' },
];

const _customFonts = [
  { name: 'Roboto', value: 'Roboto', class: 'font-roboto' },
  { name: 'Aladin', value: 'Aladin', class: 'font-aladin' },
  { name: 'Allura', value: 'Allura', class: 'font-allura' },
  { name: 'Cookie', value: 'Cookie', class: 'font-cookie' },
  { name: 'Courgette', value: 'Courgette', class: 'font-courgette' },
  { name: 'DancingScript', value: 'DancingScript', class: 'font-dancingscript' },
  { name: 'GillSans', value: 'GillSans', class: 'font-gillsans' },
  { name: 'Italianno', value: 'Italianno', class: 'font-italianno' },
  { name: 'Lora', value: 'Lora', class: 'font-lora' },
  { name: 'Merriweather', value: 'Merriweather', class: 'font-merriweather' },
];

export const fonts = [..._defaultFonts, ..._customFonts];
export const dateFormats = [null, 'DD/M/YYYY', 'YYYY/M/DD', 'DD MMM YYYY', 'MMMM DD, YYYY', 'MMM DD YYYY'];
export const timeFormats = [null, 'H:mm:ss', 'h:mm:ss A'];
