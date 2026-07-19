/** Length of generated short paths, e.g. "GeAi9K". 62^6 ≈ 5.7e10 slugs. */
export const SHORT_PATH_LENGTH = 6;

/** Collision-retry budget before slug generation gives up. */
export const MAX_SLUG_GENERATION_ATTEMPTS = 5;

export const MAX_URL_LENGTH = 2048;

export const SHORT_PATH_PATTERN = /^[0-9A-Za-z]+$/;

export const MIN_SEARCH_LENGTH = 3;
