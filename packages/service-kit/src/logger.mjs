export function createLogger(service) {
  function write(level, message, extra = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      service,
      message,
      ...extra
    };
    const line = JSON.stringify(entry);
    if (level === "error") {
      console.error(line);
    } else {
      console.log(line);
    }
  }

  return {
    info: (message, extra) => write("info", message, extra),
    warn: (message, extra) => write("warn", message, extra),
    error: (message, extra) => write("error", message, extra)
  };
}
