const axios = require('axios');

async function test() {
    try {
        const res = await axios.post('http://localhost:5000/users/signup', {
            firstName: "Test",
            lastName: "User",
            email: `test${Date.now()}@test.com`,
            password: "password123",
            confirmPassword: "password123"
        });
        console.log("Success:", res.status, res.data);
    } catch (e) {
        console.log("Error:", e.response ? e.response.status : e.message);
        if (e.response) {
            console.log("Data:", e.response.data);
        }
    }
}

test();
