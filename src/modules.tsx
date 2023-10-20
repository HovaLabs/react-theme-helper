import * as React from "react";

type ThemeName = 'dark' | 'light';
type ClassName = string;
type ThemeObject = Record<ThemeName, ClassName>;

export function createHelper<T extends ThemeObject>(themeObject: T) {
  type ThemeClassName = T[Extract<keyof T, string>]
  function nullishStringToThemeName(
    themeNameString?: string | null
  ): keyof T | undefined {
    if (themeNameString == null) return undefined;
    for (const themeName in themeObject) {
      if (themeName === themeNameString) {
        return themeName
      }
    }
    return undefined;
  }
  function getThemeClassName(
    themeName?: keyof T | null
  ): ThemeClassName | undefined {
    if (themeName == null) return undefined;
    for (const themeName in themeObject) {
      if (themeName === themeName) {
        return themeObject[themeName]
      }
    }
    return undefined;
  }

  /**
   *  Note: We are assuming the default browser theme name is "light"
   */
  function getOsThemeName(): ThemeName | undefined {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia === "undefined"
    ) {
      return undefined;
    }
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  type ThemeContextValue = {
    themeName: keyof T | undefined;
    themeClassName: T[keyof T] | undefined;
    osThemeName: keyof T | undefined;
    setThemeName: React.Dispatch<React.SetStateAction<keyof T | undefined>>;
  };

  const ThemeContext = React.createContext<ThemeContextValue>({
    themeName: undefined,
    themeClassName: undefined,
    osThemeName: undefined,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setThemeName: () => { },
  });

  const useThemeInfoHook = (initialThemeName?: string) => {
    const [themeName, setThemeName] = React.useState<keyof T | undefined>(
      nullishStringToThemeName(initialThemeName)
    );
    const [osThemeName, setOsThemeName] = React.useState<keyof T | undefined>(
      getOsThemeName()
    );

    React.useEffect(() => {
      function handleThemeChange(e: MediaQueryListEvent) {
        const newOsThemeName = (e.matches ? "dark" : "light");
        setOsThemeName(newOsThemeName);
      }

      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", handleThemeChange);
      return () => {
        window
          .matchMedia("(prefers-color-scheme: dark)")
          .removeEventListener("change", handleThemeChange);
      };
    }, []);

    const activeThemeName = themeName ?? osThemeName;
    let themeClassName: T[keyof T] | undefined = undefined;
    if (activeThemeName != null && themeObject.hasOwnProperty(activeThemeName)) {
      themeClassName = themeObject[activeThemeName]
    }

    return { themeName, setThemeName, osThemeName, themeClassName };
  };

  function ThemeProvider({
    children,
    themeName,
  }: {
    children: React.ReactNode;
    themeName: string;
  }) {
    const value = useThemeInfoHook(themeName);
    return (
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
  }

  function useThemeInfo() {
    const value = React.useContext(ThemeContext);
    return value;
  }

  return {
    ThemeContext,
    useThemeInfo,
    ThemeProvider,
    getThemeClassName,
  };
}