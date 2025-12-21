import http from "http";

const options = {
  host: "localhost",
  port: 8080,
  timeout: 2000,
  method: "GET",
  path: "/health",
};

const req = http.request(options, (res) => {
  process.exit(res.statusCode === 200 ? 0 : 1);
});

req.on("error", () => process.exit(1));
req.end();
