import axios from "axios";

export const createLink = async (formData) => {
    try {
        const response = await axios.post('/api/create-link/', formData, {
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
    
        const createdLink = await response.json();
        return createdLink;

      } catch (error) {
        console.error('Error creating link:', error);
        throw error;
      }
}