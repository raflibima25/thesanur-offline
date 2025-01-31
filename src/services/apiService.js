const apiService = {
    get: async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`GET ${url} failed with status ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error in GET ${url}:`, error.message);
            throw error;
        }
    },

    post: async (url, data) => {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error(`POST ${url} failed with status ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error in POST ${url}:`, error.message);
            throw error;
        }
    },

    put: async (url, data) => {
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error(`PUT ${url} failed with status ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error in PUT ${url}:`, error.message);
            throw error;
        }
    },

    delete: async (url) => {
        try {
            const response = await fetch(url, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`DELETE ${url} failed with status ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error in DELETE ${url}:`, error.message);
            throw error;
        }
    },
};

export default apiService;
