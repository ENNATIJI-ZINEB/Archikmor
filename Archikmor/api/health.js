// Health check endpoint for Vercel serverless function
module.exports = (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    res.status(200).json({ status: 'ok' });
};

