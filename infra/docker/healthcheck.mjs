const url = process.argv[2];

if (!url) {
  console.error("Missing healthcheck URL");
  process.exit(1);
}

try {
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Healthcheck failed: ${response.status}`);
    process.exit(1);
  }
  process.exit(0);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
