const { test } = require('node:test');
const assert = require('node:assert/strict');
const getBmiCategory = require('../src/static/bmi-categories');

for (const [bmi, label] of [
    [18.49, 'Вага недостатня.'],
    [18.5, 'Вага в нормі.'],
    [24.99, 'Вага в нормі.'],
    [25, 'Надмірна вага.'],
    [29.99, 'Надмірна вага.'],
    [30, 'Ожиріння.'],
]) {
    test(`classifies unrounded BMI ${bmi} without gaps at thresholds`, () => {
        const result = getBmiCategory(bmi);
        assert.equal(result.label, label);
        assert.ok(result.description.length > 0);
    });
}
