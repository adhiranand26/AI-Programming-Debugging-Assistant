import { sovereign } from './sovereign';
import { obsidian } from './obsidian';
import { nord } from './nord';
import { rosePine } from './rosePine';
import { catppuccin } from './catppuccin';

const themes: Record<string, Record<string, string>> = {
  sovereign,
  obsidian,
  nord,
  rosePine,
  catppuccin,
};

export const applyTheme = (themeName: string) => {
  const theme = themes[themeName] || themes['sovereign'];
  
  Object.entries(theme).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
};
