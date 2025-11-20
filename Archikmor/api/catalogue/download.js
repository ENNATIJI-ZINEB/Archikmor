// Catalogue PDF download endpoint for Vercel serverless function
const fsSync = require('fs');
const path = require('path');

module.exports = (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const cataloguePath = path.join(process.cwd(), 'catalogue', 'Archikmor-Catalog2026.pdf');
    
    // Log download request
    const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection?.remoteAddress || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    console.log('📥 Catalogue download requested:', {
        ip: clientIP,
        userAgent: userAgent.substring(0, 50),
        timestamp: new Date().toISOString(),
    });

    // Check if file exists
    fsSync.access(cataloguePath, fsSync.constants.F_OK, (err) => {
        if (err) {
            console.error('❌ Catalogue file not found:', cataloguePath);
            return res.status(404).json({ error: 'Catalogue file not found' });
        }

        // Set headers for file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Archikmor-Catalog2026.pdf"');
        res.setHeader('Cache-Control', 'no-cache');
        
        // Stream the file
        const fileStream = fsSync.createReadStream(cataloguePath);
        fileStream.pipe(res);
        
        fileStream.on('end', () => {
            console.log('✅ Catalogue download completed');
        });
        
        fileStream.on('error', (error) => {
            console.error('❌ Error streaming catalogue file:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to download catalogue' });
            }
        });
    });
};

