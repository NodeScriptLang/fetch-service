import assert from 'assert';

describe('App Server', () => {

    it('sends GET request', async () => {
        const res = await fetch('http://localhost:8080/Fetch/sendRequest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                request: {
                    method: 'GET',
                    url: 'http://localhost:8099/foo',
                    headers: {
                        'Content-Type': ['application/json'],
                    },
                }
            })
        });
        assert.strictEqual(res.status, 200);
        const json = await res.json();
        assert.strictEqual(json.response.status, 200);
        assert.strictEqual(json.response.bodyBase64, Buffer.from('{}').toString('base64'));
    });

});
