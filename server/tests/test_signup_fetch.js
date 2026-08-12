async function test() {
    try {
        const res = await fetch('http://localhost:5000/users/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: "Test",
                lastName: "User",
                email: `test${Date.now()}@test.com`,
                password: "password123",
                confirmPassword: "password123"
            })
        });
        const text = await res.text();
        console.log("Success:", res.status, text);
    } catch (e) {
        console.log("Error:", e.message);
    }
}

test();
