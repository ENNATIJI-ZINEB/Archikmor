// ARCHIKMOR Bilingual Translation System
// Supports English (en) and French (fr)

const translations = {
    en: {
        // Meta
        title: "ARCHIKMOR - Timeless Harmony",
        tagline: "Timeless Harmony",
        
        // Navigation
        nav: {
            home: "Home",
            planning: "Space Planning",
            wood: "Wood Craft",
            catalogue: "Catalog",
            preview: "Preview",
            services: "Services",
            contact: "Contact"
        },
        
        // Hero Section
        hero: {
            subtitle: "Timeless Harmony in Modern Design",
            downloadCatalog: "Download Catalog"
        },
        
        // Space Planning Section
        planning: {
            title: "INTELLIGENT SPACE PLANNING",
            heading: "Strategic Design for Optimal Living",
            description1: "At ARCHIKMOR, we believe that great design begins with intelligent space planning. Our approach transforms ordinary spaces into extraordinary experiences through meticulous analysis and creative solutions.",
            description2: "We consider every aspect of your space - from traffic flow and natural light to functionality and aesthetic harmony - to create environments that work beautifully and feel intuitively right.",
            features: {
                item1: "Customized layout optimization for your specific needs",
                item2: "Traffic flow analysis and circulation planning",
                item3: "Furniture placement and scale consideration",
                item4: "Lighting and electrical planning integration",
                item5: "Storage solutions and spatial organization",
                item6: "Future-proof design for evolving lifestyles"
            },
            stats: {
                satisfaction: "Client Satisfaction",
                projects: "Projects Completed",
                experience: "Years Experience"
            }
        },
        
        // Wood Craft Section
        wood: {
            title: "WOOD CRAFT & ARCHITECTURE",
            panels: {
                title: "Custom Wood Panels",
                description: "Handcrafted wood panels that bring warmth and natural elegance to any space"
            },
            architecture: {
                title: "Architectural Woodwork",
                description: "Bespoke wood installations that define the character of modern interiors"
            }
        },
        
        // Catalog Preview Section
        preview: {
            title: "CATALOG PREVIEW",
            livingRoom: {
                tag: "Living Room Collections",
                heading: "Where Comfort Meets Timeless Design",
                description: "Discover elegant living spaces with furniture crafted for comfort and style where timeless design and expert woodworking create the perfect place to gather and unwind."
            },
            bedroom: {
                tag: "Bedroom & Dressing Collections",
                heading: "Your Sanctuary of Serenity",
                description: "Experience bespoke bedrooms designed for rest and renewal, blending elegant style with smart storage to create a harmonious and peaceful retreat."
            },
            kitchen: {
                tag: "Kitchen Collections",
                heading: "Craftsmanship at the Heart of Your Home",
                description: "Discover elegant, functional kitchens crafted from premium woods and finishes custom-designed to bring beauty, durability, and harmony to your everyday living."
            },
            doors: {
                tag: "Interior & Entry Doors Collections",
                heading: "The Art of First Impressions",
                description: "Redefine every entrance with doors that unite craftsmanship, style, and strength creating timeless statements that enhance the character of any space."
            },
            workspace: {
                tag: "Workspace Collections",
                heading: "Design That Inspires Productivity",
                description: "Elevate your workspace with refined wooden furniture that blends ergonomic comfort and timeless design, creating a focused and inspiring environment."
            },
            office: {
                tag: "Office Collections",
                heading: "Executive Leadership Desk",
                description: "A high-end executive desk with a spacious work surface, integrated side storage, and refined finish."
            }
        },
        
        // Download Catalog Section
        catalogue: {
            title: "DOWNLOAD OUR CATALOG",
            subtitle: "Explore our complete collection of wood designs and furniture. Download our detailed catalogue to discover the perfect pieces for your space.",
            catalogTitle: "ARCHIKMOR Catalog 2026",
            catalogDescription: "Immerse yourself in curated living, kitchen, workspace, and architectural wood collections designed to bring harmony to every interior.",
            details: {
                collections: "6 signature collections",
                specifications: "Detailed specifications & finishes",
                imagery: "High-resolution project imagery"
            },
            mobileMessage: "Download on desktop for the best experience, or request the catalogue via email.",
            downloadFull: "Download Full Catalog",
            previewCollections: "Preview Collections",
            emailDelivery: {
                heading: "Prefer Email Delivery?",
                description: "If you're having trouble downloading, we can send the catalog directly to your inbox.",
                placeholder: "Your email address",
                button: "Send Catalog",
                sending: "Sending...",
                sendingStatus: "Sending catalogue to your email...",
                success: "Catalogue sent successfully! Please check your email inbox.",
                errorEmail: "Please enter your email address.",
                errorInvalid: "Please enter a valid email address.",
                errorGeneric: "Something went wrong. Please try again later."
            },
            help: {
                heading: "Your Dream Project Starts Here",
                description: "Share your vision with us and let's bring it to life. Whether you're imagining a new home, a unique interior, or a full architectural concept, we're here to listen. Describe your ideas, your needs, and your style.Our team will guide you through every step to turn your dream project into a beautifully crafted reality just contact us:"
            },
            downloadNotification: "Download started! Check your downloads folder."
        },
        
        // Services Section
        services: {
            title: "OUR SERVICES",
            interior: {
                title: "Interior Design",
                description: "Complete interior design solutions from concept to execution, creating harmonious spaces that reflect your personality and lifestyle."
            },
            furniture: {
                title: "Custom Furniture",
                description: "Bespoke furniture design and craftsmanship, creating unique pieces that perfectly fit your space and style."
            },
            spacePlanning: {
                title: "Space Planning",
                description: "Strategic space optimization and layout design to maximize functionality while maintaining aesthetic appeal and flow."
            }
        },
        
        // Contact Section
        contact: {
            title: "READY TO CREATE YOUR SPACE?",
            heading: "Start Your Journey",
            address: "KM 11 600 BD CHEFCHAOUNI Q I SIDI BERSNOUSSI, CHEZ BN BRAHIM IMMOBILIER, Casablanca",
            phone: "+212 783101423",
            email: "Sales@archikmor.com",
            hours: "Mon - Fri: 8AM - 6PM",
            socialTitle: "CONNECT WITH US",
            form: {
                name: "Full Name",
                namePlaceholder: "Your full name",
                email: "Email Address",
                emailPlaceholder: "your.email@example.com",
                project: "Project Type",
                projectPlaceholder: "Residential, Commercial, etc.",
                message: "Project Details",
                messagePlaceholder: "Tell us about your space and vision...",
                submit: "Begin Your Transformation",
                sending: "Sending...",
                sendingStatus: "Sending your request...",
                errorRequired: "Please complete your name, email, and project details before submitting.",
                success: "Thank you for reaching out! Our team will connect with you shortly.",
                errorGeneric: "Something went wrong. Please try again later."
            }
        },
        
        // Footer
        footer: {
            tagline: "Where Design Meets Harmony",
            copyright: "© 2025 ARCHIKMOR. Crafting timeless spaces with wood, wisdom, and harmony."
        },
        
        // Newsletter Modal
        newsletter: {
            tagline: "Exclusive insights, timeless spaces",
            heading: "Stay in Archikmor's Harmony",
            description: "Subscribe for curated inspiration, project reveals, and members-only offers handpicked by our design studio.",
            name: "Name",
            email: "Email",
            subscribe: "Subscribe",
            subscribing: "Subscribing...",
            adding: "Adding you to our list...",
            errorEmail: "Please enter your email address.",
            errorInvalid: "Please provide a valid email address.",
            success: "You are now subscribed!",
            errorGeneric: "Something went wrong. Please try again later.",
            close: "Close newsletter sign-up"
        }
    },
    
    fr: {
        // Meta
        title: "ARCHIKMOR - Harmonie Intemporelle",
        tagline: "Harmonie Intemporelle",
        
        // Navigation
        nav: {
            home: "Accueil",
            planning: "Aménagement d'Espace",
            wood: "Artisanat du Bois",
            catalogue: "Catalogue",
            preview: "Aperçu",
            services: "Services",
            contact: "Contact"
        },
        
        // Hero Section
        hero: {
            subtitle: "Harmonie Intemporelle dans le Design Moderne",
            downloadCatalog: "Télécharger le Catalogue"
        },
        
        // Space Planning Section
        planning: {
            title: "AMÉNAGEMENT D'ESPACE INTELLIGENT",
            heading: "Design Stratégique pour un Mode de Vie Optimal",
            description1: "Chez ARCHIKMOR, nous croyons que le grand design commence par un aménagement d'espace intelligent. Notre approche transforme les espaces ordinaires en expériences extraordinaires grâce à une analyse méticuleuse et des solutions créatives.",
            description2: "Nous considérons chaque aspect de votre espace - du flux de circulation et de la lumière naturelle à la fonctionnalité et l'harmonie esthétique - pour créer des environnements qui fonctionnent magnifiquement et se sentent intuitivement justes.",
            features: {
                item1: "Optimisation de la disposition personnalisée pour vos besoins spécifiques",
                item2: "Analyse du flux de circulation et planification de la circulation",
                item3: "Placement des meubles et considération de l'échelle",
                item4: "Intégration de la planification de l'éclairage et de l'électricité",
                item5: "Solutions de rangement et organisation spatiale",
                item6: "Design évolutif pour des modes de vie en évolution"
            },
            stats: {
                satisfaction: "Satisfaction Client",
                projects: "Projets Réalisés",
                experience: "Années d'Expérience"
            }
        },
        
        // Wood Craft Section
        wood: {
            title: "ARTISANAT DU BOIS & ARCHITECTURE",
            panels: {
                title: "Panneaux de Bois Sur Mesure",
                description: "Panneaux de bois faits à la main qui apportent chaleur et élégance naturelle à tout espace"
            },
            architecture: {
                title: "Menuiserie Architecturale",
                description: "Installations en bois sur mesure qui définissent le caractère des intérieurs modernes"
            }
        },
        
        // Catalog Preview Section
        preview: {
            title: "APERÇU DU CATALOGUE",
            livingRoom: {
                tag: "Collections Salon",
                heading: "Où le Confort Rencontre le Design Intemporel",
                description: "Découvrez des espaces de vie élégants avec des meubles conçus pour le confort et le style, où le design intemporel et l'artisanat du bois expert créent l'endroit parfait pour se rassembler et se détendre."
            },
            bedroom: {
                tag: "Collections Chambre & Dressing",
                heading: "Votre Sanctuaire de Sérénité",
                description: "Découvrez des chambres sur mesure conçues pour le repos et le renouvellement, alliant style élégant et rangement intelligent pour créer un refuge harmonieux et paisible."
            },
            kitchen: {
                tag: "Collections Cuisine",
                heading: "L'Artisanat au Cœur de Votre Maison",
                description: "Découvrez des cuisines élégantes et fonctionnelles conçues à partir de bois et de finitions haut de gamme sur mesure pour apporter beauté, durabilité et harmonie à votre vie quotidienne."
            },
            doors: {
                tag: "Collections Portes Intérieures & d'Entrée",
                heading: "L'Art des Premières Impressions",
                description: "Redéfinissez chaque entrée avec des portes qui unissent l'artisanat, le style et la solidité, créant des déclarations intemporelles qui rehaussent le caractère de tout espace."
            },
            workspace: {
                tag: "Collections Espace de Travail",
                heading: "Design Qui Inspire la Productivité",
                description: "Élevez votre espace de travail avec des meubles en bois raffinés qui allient confort ergonomique et design intemporel, créant un environnement concentré et inspirant."
            },
            office: {
                tag: "Collections Bureau",
                heading: "Bureau de Direction Exécutif",
                description: "Un bureau exécutif haut de gamme avec une surface de travail spacieuse, un rangement latéral intégré et une finition raffinée."
            }
        },
        
        // Download Catalog Section
        catalogue: {
            title: "TÉLÉCHARGER NOTRE CATALOGUE",
            subtitle: "Explorez notre collection complète de designs en bois et de meubles. Téléchargez notre catalogue détaillé pour découvrir les pièces parfaites pour votre espace.",
            catalogTitle: "Catalogue ARCHIKMOR 2026",
            catalogDescription: "Immergez-vous dans des collections de bois soigneusement sélectionnées pour le salon, la cuisine, l'espace de travail et l'architecture, conçues pour apporter l'harmonie à chaque intérieur.",
            details: {
                collections: "6 collections signature",
                specifications: "Spécifications et finitions détaillées",
                imagery: "Imagerie de projet haute résolution"
            },
            mobileMessage: "Téléchargez sur ordinateur pour la meilleure expérience, ou demandez le catalogue par e-mail.",
            downloadFull: "Télécharger le Catalogue Complet",
            previewCollections: "Aperçu des Collections",
            emailDelivery: {
                heading: "Préférez-vous la Livraison par E-mail ?",
                description: "Si vous avez des difficultés à télécharger, nous pouvons vous envoyer le catalogue directement dans votre boîte de réception.",
                placeholder: "Votre adresse e-mail",
                button: "Envoyer le Catalogue",
                sending: "Envoi...",
                sendingStatus: "Envoi du catalogue à votre e-mail...",
                success: "Catalogue envoyé avec succès ! Veuillez vérifier votre boîte de réception.",
                errorEmail: "Veuillez entrer votre adresse e-mail.",
                errorInvalid: "Veuillez entrer une adresse e-mail valide.",
                errorGeneric: "Quelque chose s'est mal passé. Veuillez réessayer plus tard."
            },
            help: {
                heading: "Votre Projet de Rêve Commence Ici",
                description: "Partagez votre vision avec nous et donnons-lui vie. Que vous imaginiez une nouvelle maison, un intérieur unique ou un concept architectural complet, nous sommes là pour vous écouter. Décrivez vos idées, vos besoins et votre style. Notre équipe vous guidera à chaque étape pour transformer votre projet de rêve en une réalité magnifiquement conçue, contactez-nous simplement :"
            },
            downloadNotification: "Téléchargement démarré ! Vérifiez votre dossier de téléchargements."
        },
        
        // Services Section
        services: {
            title: "NOS SERVICES",
            interior: {
                title: "Design d'Intérieur",
                description: "Solutions complètes de design d'intérieur de la conception à l'exécution, créant des espaces harmonieux qui reflètent votre personnalité et votre mode de vie."
            },
            furniture: {
                title: "Mobilier Sur Mesure",
                description: "Design et artisanat de meubles sur mesure, créant des pièces uniques qui s'adaptent parfaitement à votre espace et votre style."
            },
            spacePlanning: {
                title: "Aménagement d'Espace",
                description: "Optimisation stratégique de l'espace et conception de la disposition pour maximiser la fonctionnalité tout en maintenant l'attrait esthétique et la fluidité."
            }
        },
        
        // Contact Section
        contact: {
            title: "PRÊT À CRÉER VOTRE ESPACE ?",
            heading: "Commencez Votre Voyage",
            address: "KM 11 600 BD CHEFCHAOUNI Q I SIDI BERSNOUSSI, CHEZ BN BRAHIM IMMOBILIER, Casablanca",
            phone: "+212 783101423",
            email: "Sales@archikmor.com",
            hours: "Lun - Ven : 8H - 18H",
            socialTitle: "RESTEZ CONNECTÉ",
            form: {
                name: "Nom Complet",
                namePlaceholder: "Votre nom complet",
                email: "Adresse E-mail",
                emailPlaceholder: "votre.email@exemple.com",
                project: "Type de Projet",
                projectPlaceholder: "Résidentiel, Commercial, etc.",
                message: "Détails du Projet",
                messagePlaceholder: "Parlez-nous de votre espace et de votre vision...",
                submit: "Commencez Votre Transformation",
                sending: "Envoi...",
                sendingStatus: "Envoi de votre demande...",
                errorRequired: "Veuillez compléter votre nom, e-mail et les détails du projet avant de soumettre.",
                success: "Merci de nous avoir contactés ! Notre équipe vous contactera sous peu.",
                errorGeneric: "Quelque chose s'est mal passé. Veuillez réessayer plus tard."
            }
        },
        
        // Footer
        footer: {
            tagline: "Où le Design Rencontre l'Harmonie",
            copyright: "© 2025 ARCHIKMOR. Création d'espaces intemporels avec le bois, la sagesse et l'harmonie."
        },
        
        // Newsletter Modal
        newsletter: {
            tagline: "Aperçus exclusifs, espaces intemporels",
            heading: "Restez dans l'Harmonie d'Archikmor",
            description: "Abonnez-vous pour une inspiration soigneusement sélectionnée, des révélations de projets et des offres exclusives aux membres, soigneusement choisies par notre studio de design.",
            name: "Nom",
            email: "E-mail",
            subscribe: "S'abonner",
            subscribing: "Abonnement...",
            adding: "Ajout à notre liste...",
            errorEmail: "Veuillez entrer votre adresse e-mail.",
            errorInvalid: "Veuillez fournir une adresse e-mail valide.",
            success: "Vous êtes maintenant abonné !",
            errorGeneric: "Quelque chose s'est mal passé. Veuillez réessayer plus tard.",
            close: "Fermer l'inscription à la newsletter"
        }
    }
};

// Translation System
class TranslationSystem {
    constructor() {
        this.currentLang = this.detectLanguage();
        this.init();
    }
    
    detectLanguage() {
        // Check localStorage first
        const saved = localStorage.getItem('archikmor_lang');
        if (saved && (saved === 'en' || saved === 'fr')) {
            return saved;
        }
        
        // Check browser language
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('fr')) {
            return 'fr';
        }
        
        // Default to English
        return 'en';
    }
    
    init() {
        this.updateHTMLAttributes();
        this.applyTranslations();
    }
    
    setLanguage(lang) {
        if (lang !== 'en' && lang !== 'fr') {
            console.warn('Invalid language:', lang);
            return;
        }
        
        this.currentLang = lang;
        localStorage.setItem('archikmor_lang', lang);
        this.updateHTMLAttributes();
        this.applyTranslations();
    }
    
    updateHTMLAttributes() {
        document.documentElement.lang = this.currentLang;
        document.title = translations[this.currentLang].title;
    }
    
    get(key) {
        const keys = key.split('.');
        let value = translations[this.currentLang];
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn('Translation key not found:', key);
                return key;
            }
        }
        
        return value;
    }
    
    applyTranslations() {
        // Apply translations to all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.get(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                // For inputs, only set placeholder if it's not a button type
                if (element.type !== 'submit' && element.type !== 'button') {
                    // Don't override placeholder here - handled by data-i18n-placeholder
                    element.textContent = translation;
                } else {
                    element.value = translation;
                }
            } else if (element.tagName === 'TITLE' || element.tagName === 'META') {
                element.textContent = translation;
            } else {
                element.textContent = translation;
            }
        });
        
        // Handle data-i18n-placeholder attributes
        document.querySelectorAll('[data-i18n-placeholder]').forEach(input => {
            const key = input.getAttribute('data-i18n-placeholder');
            input.placeholder = this.get(key);
        });
        
        // Handle data-i18n-aria-label attributes
        document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
            const key = element.getAttribute('data-i18n-aria-label');
            element.setAttribute('aria-label', this.get(key));
        });
        
        // Update title tag
        document.title = this.get('title');
    }
    
    getCurrentLanguage() {
        return this.currentLang;
    }
    
    toggleLanguage() {
        const newLang = this.currentLang === 'en' ? 'fr' : 'en';
        this.setLanguage(newLang);
        return newLang;
    }
}

// Initialize translation system when DOM is ready
let i18n;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        i18n = new TranslationSystem();
        if (typeof window !== 'undefined') {
            window.i18n = i18n;
            window.translations = translations;
        }
    });
} else {
    // DOM already loaded
    i18n = new TranslationSystem();
    if (typeof window !== 'undefined') {
        window.i18n = i18n;
        window.translations = translations;
    }
}

