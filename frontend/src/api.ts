enum HttpMethod {
    GET = 'GET',
    POST = 'POST'
}

async function request(path: string, method: HttpMethod, body?: any) {
    const result = await fetch(`/api/${path}`, {
        method,
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const json = await result.json();

    if (result.ok) {
        return json;
    } else {
        throw new Error(json.error);
    }
}

export const login = async (email: string, password: string) => request('login', HttpMethod.POST, { email, password });

export const session = async () => request('session', HttpMethod.GET);
