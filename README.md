# BMI Calculator

A small React and Node.js/Express web application that calculates body mass
index from weight and height. The browser sends inputs to a validated JSON API;
the calculation lives on the server.

## Features

- Ukrainian-language interface with labelled numeric inputs.
- Original yellow background, white calculator panel, and gender selection.
- Adult BMI category and a short explanation alongside the numeric result.
- Client-side input constraints and independent server-side validation.
- API-backed calculation with loading, error, and timeout states.
- React assets served from installed npm dependencies; no runtime CDN dependency.
- Automated HTTP API tests and GitHub Actions CI.
- Docker configuration for containerized execution.

## Stack

JavaScript, React 17, Node.js, Express, HTML/CSS, Docker, GitHub Actions.
Tests use the built-in Node.js test runner. No database is required.

## Run locally

Requires Node.js 22 or newer and npm.

```sh
npm ci
npm test
npm start
```

Open http://localhost:3000. Set `PORT` to change the server port.
For development, `npm run dev` restarts the server when files change.

## Docker

```sh
docker build -t bmi-calculator .
docker run --rm -p 3000:3000 bmi-calculator
```

The image uses Node.js 24 Alpine and runs as a non-root user.

## API

`POST /calculate-bmi`, with `Content-Type: application/json`:

```json
{ "weight": 80, "height": 185 }
```

Weight is in **kilograms**, height in **centimetres** in both the API and UI.
Values must be JSON numbers. The application accepts weight above 0 and up to
500 kg, and height from 50 to 250 cm. These are application input limits, not
medical reference ranges. Numeric strings, missing fields, invalid JSON, and
out-of-range values return HTTP 400 with an `error` message. Bodies above 4 KB
return HTTP 413.

```json
{ "bmi": 23.37472607742878 }
```

BMI is calculated as `weight / (height / 100) ** 2`, without a gender multiplier.
See the [CDC explanation of the formula](https://www.cdc.gov/bmi/faq/).
The interface displays two decimal places; the API returns the unrounded value.
Gender selection is retained in the interface but does not change the formula
or adult category. Categories use the unrounded result and the thresholds
18.5, 25, and 30, following [CDC adult BMI categories](https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html).

## Tests and CI

`npm test` checks calculations, decimal inputs, gender independence, invalid and
missing values, malformed/oversized requests, static asset serving, and category
thresholds. Tests
start a real HTTP server on a temporary local port and close it when finished.
GitHub Actions installs dependencies, runs tests, and builds the Docker image.
It does not publish images or require registry credentials.

## Project notes

This is an early personal web project, refreshed to connect the interface to
the API, remove unused TODO/database modules, and add focused tests. React 17
is retained from the original application; it is not presented as a modern
frontend framework showcase. The bundled React and ReactDOM files retain their
upstream copyright and license notices in the installed packages.

The application shows a numeric BMI estimate, an adult screening category, and
the explanatory text preserved from the original project. Those explanations
have not been clinically validated and must not be treated as individual health
assessment or treatment advice. Intended for adults aged 20 and older; this
software demonstration is not a diagnostic tool or a substitute for professional
medical advice. Inputs are not persisted by the application.
