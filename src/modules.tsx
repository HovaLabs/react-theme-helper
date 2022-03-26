import * as React from "react";

export function createHelper<T extends string>(themeNameArray: T[]) {
  function nullishStringToThemeName(
    themeNameString?: string | null
  ): T | undefined {
    for (const themeName of themeNameArray) {
      if (themeName === themeNameString) return themeName;
    }
    return undefined;
  }

  /**
   *  We are assuming the default browser theme name is "light"
   *  Note: we're returning T | undefined even though this function will only
   *  ever return 'light' | 'dark' | undefined
   */
  function getOsThemeName(): T | undefined {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia === "undefined"
    ) {
      return undefined;
    }
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark" as T;
    }
    return "light" as T;
  }

  type ThemeContextValue = {
    themeName: T | undefined;
  };

  const ThemeContext = React.createContext<ThemeContextValue>({
    themeName: undefined,
  });

  const useThemeName = (initialThemeName?: string) => {
    const [themeName, setThemeName] = React.useState<T | undefined>(
      nullishStringToThemeName(initialThemeName)
    );
    const [osThemeName, setOsThemeName] = React.useState<T | undefined>(
      getOsThemeName()
    );

    React.useEffect(() => {
      function handleThemeChange(e: MediaQueryListEvent) {
        const newOsThemeName = (e.matches ? "dark" : "light") as T;
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

    return { themeName, setThemeName, osThemeName };
  };

  function ThemeProvider({
    children,
    themeName,
  }: {
    children: React.ReactNode;
    themeName: T;
  }) {
    return (
      <ThemeContext.Provider value={{ themeName }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return {
    ThemeContext,
    useThemeName,
    ThemeProvider,
    nullishStringToThemeName,
  };
}
