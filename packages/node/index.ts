// Helpers
const accessor = (data = []) => {
    if (!Array.isArray(data)) {return () => undefined;}
    return id => data.find(entry => entry.id === id);
};

// Functions
const ready = (token, data) => ({
    bot: data.account.client,

    users: {
        get: async (id) => {
            try {
                const response = await fetch(`https://auth.openprofile.app/v3/accounts?id=${id}`, {
                    method: "GET", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`}
                }); if (!response.ok) {const text = await response.text(); throw new Error(`Failed to fetch user: ${response.status}, ${text}`);}
                const data = await response.json();
                return data;
            } catch (err) { console.error("op5.user.get error:", err); throw err;}
        },
    },

    profiles: {
        get: async (id, { read = false } = {}) => {
            try {
                const response = await fetch(`https://auth.openprofile.app/v3/profiles?id=${id}&reading=${read}`, {
                    method: "GET", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`}
                }); if (!response.ok) {const text = await response.text(); throw new Error(`Failed to fetch profile: ${response.status}, ${text}`);}
                let data = await response.json(); if (read) {data.values = accessor(data.values);}
                return data;
            } catch (err) { console.error("op5.profile.get error:", err); throw err;}
        },
    },
});

// Module
const op5 = {
    login: async (id, token) => {
        try {
            const response = await fetch("https://auth.openprofile.app/v3/session", { 
                method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`}, body: JSON.stringify({ id, token })
            }); if (!response.ok) {const text = await response.text(); throw new Error(`Login failed: ${response.status}, ${text}`);}
            const data = await response.json(); const client = ready(token, data);
            return client;
        } catch (err) { console.error("op5.login error:", err); throw err;}
    },
};

module.exports = op5;
