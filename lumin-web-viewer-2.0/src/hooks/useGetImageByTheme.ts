import { useThemeMode } from "./useThemeMode";

export function useGetImageByTheme(lightImage: string, darkImage: string) {
    const themeMode = useThemeMode();

    return themeMode === 'light' ? lightImage : darkImage;
}