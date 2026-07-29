const api = window.MOVIE_BRAWL_I18N;

if (!api?.I18n) {
  throw new Error("Movie Brawl localization resources failed to load.");
}

export const { I18n, SUPPORTED_LOCALES } = api;
