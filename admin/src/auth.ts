const API_BASE_URL = 'http://localhost:3000/api';

export async function authenticate(username: string, password: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        throw new Error('Authentication failed');
    }

    const data = await response.json();
    localStorage.setItem('adminToken', data.token);
}

export function logout(): void {
    localStorage.removeItem('adminToken');
}

export function getAuthToken(): string | null {
    return localStorage.getItem('adminToken');
}