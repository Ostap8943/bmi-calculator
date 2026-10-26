const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const app = require('../src/app');
let server;
let base;

before(async () => {
    server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
    await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
});

async function post(body) {
    return fetch(`${base}/calculate-bmi`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

test('calculates BMI from kilograms and centimetres', async () => {
    const response = await post({ weight: 80, height: 185 });
    assert.equal(response.status, 200);
    assert.ok(Math.abs((await response.json()).bmi - 80 / (1.85 ** 2)) < 1e-10);
});
test('does not apply gender-specific coefficients', async () => {
    for (const gender of ['male', 'female']) {
        const response = await post({ weight: 80, height: 200, gender });
        assert.deepEqual(await response.json(), { bmi: 20 });
    }
});
test('accepts decimal inputs and application range boundaries', async () => {
    for (const body of [{ weight: 63.5, height: 172.5 }, { weight: 500, height: 250 }, { weight: 1, height: 50 }]) {
        assert.equal((await post(body)).status, 200);
    }
});
for (const body of [
    {}, { weight: 70 }, { height: 170 }, null, [],
    { weight: 0, height: 170 }, { weight: -10, height: 170 },
    { weight: 501, height: 170 }, { weight: 70, height: 0 },
    { weight: 70, height: 49 }, { weight: 70, height: 251 },
    { weight: '70kg', height: 170 }, { weight: '70', height: 170 },
    { weight: true, height: 170 }, { weight: 70, height: '170' },
]) {
    test(`rejects invalid input: ${JSON.stringify(body)}`, async () => {
        const response = await post(body);
        assert.equal(response.status, 400);
        assert.equal(typeof (await response.json()).error, 'string');
    });
}
test('rejects malformed JSON and oversized payloads with JSON errors', async () => {
    for (const [body, status] of [['{', 400], [JSON.stringify({ text: 'a'.repeat(5000) }), 413]]) {
        const response = await fetch(`${base}/calculate-bmi`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
        });
        assert.equal(response.status, status);
        assert.equal(typeof (await response.json()).error, 'string');
    }
});
test('serves the page, application, and bundled React assets', async () => {
    for (const path of ['/', '/app.js', '/styles.css', '/vendor/react.production.min.js', '/vendor/react-dom.production.min.js']) {
        const response = await fetch(base + path);
        assert.equal(response.status, 200);
        assert.ok((await response.text()).length > 0);
    }
});
