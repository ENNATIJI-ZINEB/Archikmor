/**
 * Migration script to transfer existing JSON data to Supabase
 * Run this script once to migrate existing contact submissions and newsletter subscribers
 * 
 * Usage: node server/migrate-to-supabase.js
 */

require('dotenv').config();
const fs = require('fs/promises');
const path = require('path');
const { getSupabaseClient } = require('./db');

const submissionsFile = path.join(__dirname, '..', 'data', 'contact-submissions.json');
const newsletterFile = path.join(__dirname, '..', 'data', 'newsletter-subscribers.json');

async function readJsonFile(filePath) {
    try {
        const contents = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(contents);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`File not found: ${filePath}, skipping...`);
            return [];
        }
        throw error;
    }
}

async function migrateContactSubmissions() {
    console.log('\n📝 Migrating contact submissions...');
    
    try {
        const submissions = await readJsonFile(submissionsFile);
        
        if (!Array.isArray(submissions) || submissions.length === 0) {
            console.log('   No contact submissions found to migrate.');
            return { migrated: 0, skipped: 0 };
        }

        const supabase = getSupabaseClient();
        let migrated = 0;
        let skipped = 0;

        for (const submission of submissions) {
            try {
                // Check if submission already exists
                const { data: existing } = await supabase
                    .from('contact_submissions')
                    .select('id')
                    .eq('id', submission.id)
                    .single();

                if (existing) {
                    console.log(`   Skipping duplicate submission: ${submission.id}`);
                    skipped++;
                    continue;
                }

                // Insert submission
                const { error } = await supabase
                    .from('contact_submissions')
                    .insert([
                        {
                            id: submission.id,
                            name: submission.name,
                            email: submission.email,
                            project: submission.project || null,
                            message: submission.message,
                            received_at: submission.receivedAt,
                        },
                    ]);

                if (error) {
                    console.error(`   Error migrating submission ${submission.id}:`, error.message);
                    skipped++;
                } else {
                    migrated++;
                    console.log(`   ✓ Migrated submission: ${submission.email}`);
                }
            } catch (error) {
                console.error(`   Error processing submission ${submission.id}:`, error.message);
                skipped++;
            }
        }

        console.log(`   ✅ Contact submissions migration complete: ${migrated} migrated, ${skipped} skipped`);
        return { migrated, skipped };
    } catch (error) {
        console.error('   ❌ Error during contact submissions migration:', error.message);
        throw error;
    }
}

async function migrateNewsletterSubscribers() {
    console.log('\n📧 Migrating newsletter subscribers...');
    
    try {
        const subscribers = await readJsonFile(newsletterFile);
        
        if (!Array.isArray(subscribers) || subscribers.length === 0) {
            console.log('   No newsletter subscribers found to migrate.');
            return { migrated: 0, skipped: 0 };
        }

        const supabase = getSupabaseClient();
        let migrated = 0;
        let skipped = 0;

        for (const subscriber of subscribers) {
            try {
                // Check if subscriber already exists
                const { data: existing } = await supabase
                    .from('newsletter_subscribers')
                    .select('email')
                    .eq('email', subscriber.email)
                    .single();

                if (existing) {
                    console.log(`   Skipping duplicate subscriber: ${subscriber.email}`);
                    skipped++;
                    continue;
                }

                // Insert subscriber
                const { error } = await supabase
                    .from('newsletter_subscribers')
                    .insert([
                        {
                            id: subscriber.id,
                            name: subscriber.name || null,
                            email: subscriber.email,
                            subscribed_at: subscriber.subscribedAt,
                        },
                    ]);

                if (error) {
                    // Handle unique constraint violation
                    if (error.code === '23505' || error.message?.includes('unique')) {
                        console.log(`   Skipping duplicate subscriber (unique constraint): ${subscriber.email}`);
                        skipped++;
                    } else {
                        console.error(`   Error migrating subscriber ${subscriber.email}:`, error.message);
                        skipped++;
                    }
                } else {
                    migrated++;
                    console.log(`   ✓ Migrated subscriber: ${subscriber.email}`);
                }
            } catch (error) {
                console.error(`   Error processing subscriber ${subscriber.email}:`, error.message);
                skipped++;
            }
        }

        console.log(`   ✅ Newsletter subscribers migration complete: ${migrated} migrated, ${skipped} skipped`);
        return { migrated, skipped };
    } catch (error) {
        console.error('   ❌ Error during newsletter subscribers migration:', error.message);
        throw error;
    }
}

async function main() {
    console.log('\n🚀 Starting migration to Supabase...\n');

    // Check environment variables
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
        console.error('❌ Missing required environment variables:');
        console.error('   SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env file');
        process.exit(1);
    }

    try {
        const contactResults = await migrateContactSubmissions();
        const newsletterResults = await migrateNewsletterSubscribers();

        console.log('\n📊 Migration Summary:');
        console.log(`   Contact Submissions: ${contactResults.migrated} migrated, ${contactResults.skipped} skipped`);
        console.log(`   Newsletter Subscribers: ${newsletterResults.migrated} migrated, ${newsletterResults.skipped} skipped`);
        console.log('\n✅ Migration complete!\n');
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    migrateContactSubmissions,
    migrateNewsletterSubscribers,
};

