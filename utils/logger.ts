import { createConsola } from 'consola'

/**
 * A consola logger instance.
 *
 * The logger's level is determined based on the `CONSOLA_LOGGER_LEVEL` and `NODE_ENV` environment variables.
 * If `CONSOLA_LOGGER_LEVEL` is set, it will be used; otherwise, if `NODE_ENV` is `production`,
 * the level will be set to `0`.
 *
 * To manually change the level, assign the desired level to `logger.level`.
 *
 * See available levels [here](https://github.com/unjs/consola?tab=readme-ov-file#log-level).
 *
 * @example
 * ```typescript
 *
 * logger.info('test'); // ℹ test 3:56:30 AM
 *
 * // Manually change the level
 * logger.level = 3;
 * ```
 */
const consolaLogger = createConsola()

if (process.env.CONSOLA_LOGGER_LEVEL !== undefined) {
  consolaLogger.level = +process.env.CONSOLA_LOGGER_LEVEL
}
else {
  consolaLogger.level = process.env.NODE_ENV === 'production'
    ? 0
    : consolaLogger.level
}

export const logger = consolaLogger
