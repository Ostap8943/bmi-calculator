const h = React.createElement;

function App() {
    const [gender, setGender] = React.useState('male');
    const [weight, setWeight] = React.useState('');
    const [height, setHeight] = React.useState('');
    const [bmi, setBmi] = React.useState(null);
    const [error, setError] = React.useState('');
    const [pending, setPending] = React.useState(false);

    async function calculate(event) {
        event.preventDefault();
        if (pending) return;
        setPending(true);
        setError('');
        setBmi(null);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        try {
            const response = await fetch('/calculate-bmi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ weight: Number(weight), height: Number(height) }),
                signal: controller.signal,
            });
            const data = await response.json();
            if (!response.ok || !Number.isFinite(data.bmi)) {
                throw new Error('invalid-response');
            }
            setBmi(data.bmi);
        } catch (err) {
            setError(err.message === 'invalid-response'
                ? 'Перевірте введені значення та повторіть спробу.'
                : 'Не вдалося отримати відповідь сервера. Спробуйте ще раз.');
        } finally {
            clearTimeout(timeout);
            setPending(false);
        }
    }

    function field(label, name, value, setter, min, max, unit) {
        return h('label', { htmlFor: name }, `${label} (${unit}):`,
                h('input', {
                    id: name, name, type: 'number', inputMode: 'decimal',
                    min, max, step: 'any', required: true, value, disabled: pending,
                    onChange: event => {
                        setter(event.target.value);
                        setBmi(null);
                        setError('');
                    },
                }));
    }

    const category = bmi === null ? null : getBmiCategory(bmi);
    return h(React.Fragment, null,
        h('h1', null, 'Калькулятор індексу маси тіла (ІМТ)'),
        h('form', { onSubmit: calculate, 'aria-busy': pending },
            h('label', { htmlFor: 'gender' }, 'Стать:',
                h('select', {
                    id: 'gender', value: gender, disabled: pending,
                    onChange: event => setGender(event.target.value),
                },
                h('option', { value: 'male' }, 'Чоловік'),
                h('option', { value: 'female' }, 'Жінка'))),
            field('Вага', 'weight', weight, setWeight, 0.01, 500, 'кг'),
            field('Зріст', 'height', height, setHeight, 50, 250, 'см'),
            h('button', { type: 'submit', disabled: pending },
                pending ? 'Розрахунок...' : 'Розрахувати ІМТ')),
        h('h2', null, 'Результат:'),
        h('div', { className: 'result', 'aria-live': 'polite', 'aria-atomic': true },
            bmi !== null ? h(React.Fragment, null,
                h('p', null, 'Ваш ІМТ: ', h('strong', null, bmi.toFixed(2))),
                h('p', { className: 'category' }, category.label),
                h('p', { className: 'description' }, category.description)) : null),
        error ? h('p', { role: 'alert', className: 'error' }, error) : null,
        h('p', { className: 'note' },
            'Для дорослих від 20 років. Результат не є діагнозом і не замінює консультацію лікаря.'));
}

ReactDOM.render(h(App), document.getElementById('root'));
