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

    return result.json();
}

export const login = async (username: string, password: string) => request('login', HttpMethod.POST, { username, password });

export const session = async () => request('session', HttpMethod.GET);
