const backgroundGradient = 'bg-linear-[166deg] to-bg-transparent from-[40%] via-[40%] via-[40%] to-[40%]'
export const THEME = {
  NONE: {
    BACKGROUND: '',
    NAV_LINK: '',
    CONTAINER: '',
    TEXT: '',
    ACTIVE: '',
    PRIMARY: '',
  },
  /**
   * Color palette for the Services page
   */
  GREY_YELLOW: {
    BACKGROUND: `bg-mvmnt-warmgrey from-mvmnt-yellow via-mvmnt-yellow ${backgroundGradient}`,
    NAV_LINK: 'text-mvmnt-yellow bg-mvmnt-warmgrey',
    CONTAINER: 'bg-mvmnt-offwhite',
    TEXT: 'mvmnt-warmgrey',
    ACTIVE: 'gray-650',
    PRIMARY: 'mvmnt-yellow',
  },
  /**
   * Color palette for the Our Work page
  */
  PINK_BROWN: {
    BACKGROUND: `bg-mvmnt-pink from-mvmnt-darkbrown via-mvmnt-darkbrown ${backgroundGradient}`, // foreground: mvmnt-darkbrown
    NAV_LINK: 'text-mvmnt-darkbrown bg-mvmnt-pink',
    CONTAINER: 'bg-mvmnt-offwhite',
    TEXT: 'mvmnt-pink',
    ACTIVE: 'mvmnt-darkbrown',
    PRIMARY: 'mvmnt-darkbrown',
  },
  /**
   * Color palette for the Feed page
  */
  BLUE_GOLD: {
    BACKGROUND: `bg-mvmnt-blue from-mvmnt-gold via-mvmnt-gold ${backgroundGradient}`, // foreground: mvmnt-gold
    NAV_LINK: 'text-mvmnt-gold bg-mvmnt-blue',
    CONTAINER: 'bg-mvmnt-offwhite',
    TEXT: 'mvmnt-blue',
    ACTIVE: 'mvmnt-gold',
    PRIMARY: 'mvmnt-gold',
  },
  /**
   * Color palette for the People & Culture page
  */
  LIGHTPINK_BLUE: {
    BACKGROUND: `bg-mvmnt-lightpink from-mvmnt-lightblue via-mvmnt-lightblue ${backgroundGradient}`, // foreground: mvmnt-lightblue
    NAV_LINK: 'text-mvmnt-blue bg-mvmnt-lightpink',
    CONTAINER: 'bg-mvmnt-offwhite',
    TEXT: 'mvmnt-lightpink',
    ACTIVE: 'mvmnt-lightblue',
    PRIMARY: 'mvmnt-lightblue',
  },
  /**
   * Color palette for the Careers page
  */
  ORANGE_LIGHTPINK: {
    BACKGROUND: `bg-mvmnt-lightorange from-mvmnt-lightpink via-mvmnt-lightpink ${backgroundGradient}`, // foreground: mvmnt-lightpink
    NAV_LINK: 'text-mvmnt-lightpink bg-mvmnt-lightorange',
    CONTAINER: 'bg-mvmnt-offwhite',
    TEXT: 'mvmnt-lightorange',
    ACTIVE: 'mvmnt-lightpink',
    PRIMARY: 'mvmnt-lightpink',
  },
  /**
   * Color palette for the Contact page
  */
  BLUE_YELLOW: {
    BACKGROUND: `bg-mvmnt-blue from-mvmnt-yellow via-mvmnt-yellow ${backgroundGradient}`, // foreground: mvmnt-yellow
    NAV_LINK: 'text-mvmnt-blue bg-mvmnt-yellow',
    CONTAINER: 'bg-mvmnt-offwhite',
    TEXT: 'mvmnt-blue',
    ACTIVE: 'mvmnt-yellow',
    PRIMARY: 'mvmnt-yellow',
  }
}

export const getThemeFromPath = (path: string) => {
  // Example logic to determine theme based on path
  if (path.startsWith('/services')) {
    return THEME.GREY_YELLOW
  }
  if (path.startsWith('/our-work') || path.startsWith('/work/')) {
    return THEME.PINK_BROWN
  }
  if (path.startsWith('/feed') || path.startsWith('/posts/')) {
    return THEME.BLUE_GOLD
  }
  if (path.startsWith('/people-culture')) {
    return THEME.LIGHTPINK_BLUE
  }
  if (path.startsWith('/careers')) {
    return THEME.ORANGE_LIGHTPINK
  }
  if (path.startsWith('/contact')) {
    return THEME.BLUE_YELLOW
  }
  // Default theme
  return THEME.NONE
}