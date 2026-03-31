export const useEnabledReadAloud = () => {

  const isSpeechSynthesisSupported =
    'speechSynthesis' in window &&
    typeof SpeechSynthesisVoice !== 'undefined' &&
    typeof SpeechSynthesisUtterance !== 'undefined';

  return {
    enabled: isSpeechSynthesisSupported,
  };
};
