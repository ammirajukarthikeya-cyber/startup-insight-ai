/* ==========================================================================
   Startup Insight AI - Main JS Application Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Global App State
    const AppState = {
        theme: 'dark',
        startupName: '',
        industry: '',
        pitch: '',
        feasibilityScore: 0,
        healthScore: 0,
        riskScore: 0,
        marketOpportunity: 0,
        fundingReadiness: 0,
        billingCycle: 'monthly', // 'monthly' or 'yearly'
        activeRiskTab: 'business',
        activeEventFilter: 'all',
        activeCompFilter: 'all',
        activeTestimonialIdx: 0,
        investorStage: 'pre-seed',
        investorGeo: 'global'
    };

    // Prepopulated Database for Dynamic Content
    const CompetitorsDB = {
        saas: [
            { name: "LogiStream AI", type: "direct", share: "12% Share", pitch: "Provides automated dispatch logistics utilizing predictive analytics and vehicle sensors.", strengths: "Established fleet partnership network.", weaknesses: "Outdated API interface, hard to customize.", strategy: "Target small logistics agencies offering a self-serve API pricing model." },
            { name: "FlexiRoute Inc", type: "indirect", share: "8% Share", pitch: "Manual route-optimization tools for package deliveries and local drivers.", strengths: "Very low pricing matrix.", weaknesses: "Missing real-time sensor updates or ML path generation.", strategy: "Standardize high-speed automated routing that beats manual scheduling." },
            { name: "RouteSync Technologies", type: "direct", share: "15% Share", pitch: "Enterprise delivery automation middleware with multi-fleet configurations.", strengths: "Enterprise level compliance layers.", weaknesses: "Average setup times require 4-6 weeks of professional integration.", strategy: "Offer 1-click cloud connectors for instant setups." }
        ],
        fintech: [
            { name: "PayGrid Corp", type: "direct", share: "18% Share", pitch: "Unified ledger APIs for cross-border B2B payouts.", strengths: "Multi-currency bank license stack.", weaknesses: "High transaction fee commissions (1.5%).", strategy: "Charge a flat monthly platform subscription rather than percentages." },
            { name: "Apex Ledger", type: "direct", share: "7% Share", pitch: "Real-time compliance monitoring and automated financial reporting.", strengths: "HIPAA and SOC2 certified out of the box.", weaknesses: "Clunky UI dashboard built on old WebForms.", strategy: "Build a sleek developer-first platform with dashboard widgets." },
            { name: "CryptoVault Labs", type: "indirect", share: "4% Share", pitch: "Cold-storage wallet infrastructure for enterprise assets.", strengths: "Hardware level physical keys.", weaknesses: "Extremely complex onboarding steps.", strategy: "Simplify custody operations with visual multisig approval rules." }
        ],
        healthtech: [
            { name: "MedSync Systems", type: "direct", share: "10% Share", pitch: "AI electronic health record summarizers for hospitals.", strengths: "Integrates with legacy hospital data software.", weaknesses: "Severe latency under bulk query conditions.", strategy: "Utilize localized edge computing nodes for instant response." },
            { name: "CarePath AI", type: "indirect", share: "14% Share", pitch: "Patient-scheduling optimization tools using rule engines.", strengths: "User-friendly patient portals.", weaknesses: "Lacks diagnostic parsing or symptoms analysis.", strategy: "Overlay diagnostic screening questionnaires prior to appointment bookings." },
            { name: "ClinicalNodes LLC", type: "direct", share: "5% Share", pitch: "Automated trial screening matching patient histories with protocols.", strengths: "Direct partnership with top 10 pharmaceutical firms.", weaknesses: "High compliance overhead makes global scale slow.", strategy: "Focus on regional clinics for rapid data validation loops." }
        ],
        cleantech: [
            { name: "Solaria Grid", type: "direct", share: "16% Share", pitch: "IoT sensor arrays managing residential solar battery routing.", strengths: "Hardware integration with home batteries.", weaknesses: "Vulnerable to sudden grid frequency alterations.", strategy: "Integrate predictive ML weather feeds to pre-charge batteries." },
            { name: "EcoBattery Tech", type: "indirect", share: "9% Share", pitch: "Lithium recycling hubs processing end-of-life battery cells.", strengths: "Highly efficient recovery algorithms.", weaknesses: "Capital intensive warehousing footprint.", strategy: "Build regional hub network modeling and matching middleware." },
            { name: "WindShift Systems", type: "direct", share: "11% Share", pitch: "Predictive pitch tuning systems for industrial wind turbine blades.", strengths: "Reduces mechanical load stress by 25%.", weaknesses: "Long sales integration cycle (12-18 months).", strategy: "Offer SaaS diagnostic trials to demonstrate load reductions." }
        ],
        ecommerce: [
            { name: "PackShip Logistics", type: "direct", share: "11% Share", pitch: "Local warehouse dispatch automation for independent sellers.", strengths: "Highly efficient last-mile logistics routing.", weaknesses: "Fails to scale internationally.", strategy: "Provide cross-border import tax automation directly." },
            { name: "WarehousePro Systems", type: "indirect", share: "20% Share", pitch: "Enterprise warehouse stock management software.", strengths: "Wide market dominance and supply connectors.", weaknesses: "Setup requires months of hardware integration.", strategy: "Build visual API connectors that run on simple iOS tablets." },
            { name: "RetailFlow Commerce", type: "direct", share: "8% Share", pitch: "Social-selling checkout pipelines with micro-influencer maps.", strengths: "Very low subscription threshold.", weaknesses: "Lacks deep ERP syncing tools.", strategy: "Target high-growth shops by offering automated quickbooks syncing." }
        ],
        ai: [
            { name: "AgentNode Corp", type: "direct", share: "22% Share", pitch: "Frameworks for orchestrating multi-agent LLM systems in enterprise.", strengths: "Pre-built connectors for databases.", weaknesses: "Massive token costs under long loop conditions.", strategy: "Develop local smaller model routers to minimize query bills." },
            { name: "PromptOrchestra", type: "indirect", share: "12% Share", pitch: "Prompt template catalogs and version control dashboards.", strengths: "Large library of developer presets.", weaknesses: "Lacks agent execution or memory layers.", strategy: "Build persistent memory graphs to bridge prompt execution." },
            { name: "MultiModalNLP Systems", type: "direct", share: "15% Share", pitch: "Industrial vision pipelines evaluating factory components.", strengths: "Sub-millisecond processing speed.", weaknesses: "Requires highly specialized camera calibration.", strategy: "Create smartphone-native verification apps using standard cameras." }
        ]
    };

    const RisksDB = {
        business: {
            title: "Business & Market Risk Assessment",
            desc: "Competitor density combined with customer acquisition costs creates the primary operational barrier. A detailed mitigation plan is required to sustain long-term runway.",
            level: "Medium",
            levelClass: "risk-critical",
            progress: 55,
            progressClass: "bg-orange",
            bullets: [
                "Focus on narrow niche (e.g. specialized industry vertical) to minimize customer acquisition cost (CAC).",
                "Lock in pilot agreements with 3 target clients prior to engineering scaling.",
                "Build clear product differentiation highlighting specific integration layers."
            ],
            impact: "Impact: Medium-High",
            timeline: "Timeline: Immediate Action"
        },
        financial: {
            title: "Financial & Cash Run Risk",
            desc: "Without seed capital, early development runway represents the highest failure risk. Budget allocation must shift towards validating core value propositions.",
            level: "High",
            levelClass: "risk-critical",
            progress: 80,
            progressClass: "bg-red",
            bullets: [
                "Deploy a low-cost web validation landing page to verify consumer interest before writing code.",
                "Limit full-time salaries until pre-seed traction indicators are secured.",
                "Identify non-dilutive grant options to secure at least 6 months of buffer runway."
            ],
            impact: "Impact: Critical",
            timeline: "Timeline: Immediate Action"
        },
        security: {
            title: "Security & Technical Surface",
            desc: "Data transmission handling requires rigorous compliance mapping. Safeguards must prevent leakages across public API endpoints.",
            level: "Low",
            levelClass: "risk-normal",
            progress: 25,
            progressClass: "bg-green",
            bullets: [
                "Implement strict JWT tokens validation across all dashboard backend queries.",
                "Restrict conversational logs databases from training public foundational models.",
                "Conduct quarterly third-party penetration checks on cloud database servers."
            ],
            impact: "Impact: Medium",
            timeline: "Timeline: 3 Months Buffer"
        },
        legal: {
            title: "Legal & Compliance Exposure",
            desc: "Industry standards dictate compliance structures. Inadequate user license disclosures represent significant exposure points.",
            level: "Low",
            levelClass: "risk-normal",
            progress: 20,
            progressClass: "bg-green",
            bullets: [
                "Draft specialized Terms of Service explaining the algorithmic AI limits of the platform.",
                "Map local data processing pathways to comply with regional GDPR or HIPAA standards.",
                "Secure intellectual property patents for core proprietary database sorting engines."
            ],
            impact: "Impact: Medium-Low",
            timeline: "Timeline: Before Launch"
        }
    };

    const InvestorsDB = {
        'pre-seed': {
            global: [
                { name: "Nexus Venture Partners", focus: "Early-stage SaaS, Cleantech & AI systems", ticket: "$250k - $1.5M", match: "94% Match", logo: "N", color: "p-blue" },
                { name: "Apex Angels Circle", focus: "General technology, Fintech, E-Commerce", ticket: "$50k - $200k", match: "87% Match", logo: "A", color: "p-purple" },
                { name: "Y-Combinator Accelerator", focus: "Global cohort funding for breakthrough applications", ticket: "$500k standard", match: "82% Match", logo: "Y", color: "p-cyan" }
            ],
            europe: [
                { name: "EuroSeed Fund", focus: "Fintech, Web3 & Logistics in Western Europe", ticket: "€150k - €750k", match: "91% Match", logo: "E", color: "p-purple" },
                { name: "Berlin Alpha Collective", focus: "DeepTech, Machine Learning, Automation", ticket: "€50k - €250k", match: "85% Match", logo: "B", color: "p-blue" }
            ],
            apac: [
                { name: "Singa Angels", focus: "SaaS, E-Commerce & Hyperlocal delivery", ticket: "$100k - $300k", match: "89% Match", logo: "S", color: "p-cyan" },
                { name: "Tokyo Innovators League", focus: "AI, Hardware robotics, Biotech", ticket: "¥10M - ¥50M", match: "81% Match", logo: "T", color: "p-blue" }
            ]
        },
        'seed': {
            global: [
                { name: "Sequoia Growth Seed", focus: "High scalability software & core infrastructure", ticket: "$1M - $3M", match: "93% Match", logo: "S", color: "p-green" },
                { name: "Founder Collective", focus: "Capital-efficient software models", ticket: "$500k - $1.5M", match: "88% Match", logo: "F", color: "p-purple" }
            ],
            europe: [
                { name: "Index Seeds Europe", focus: "Fintech, B2B, Healthtech scaling", ticket: "€1M - €2.5M", match: "90% Match", logo: "I", color: "p-blue" }
            ],
            apac: [
                { name: "Tiger Venture Seed", focus: "Consumer technology, platforms, SaaS", ticket: "$1.5M - $3.5M", match: "86% Match", logo: "T", color: "p-cyan" }
            ]
        },
        'series-a': {
            global: [
                { name: "Andreessen Horowitz", focus: "Consolidated growth, infrastructure, Web3", ticket: "$5M - $20M", match: "92% Match", logo: "A", color: "p-blue" },
                { name: "Bessemer Venture Partners", focus: "SaaS and cloud developer tooling pipelines", ticket: "$3M - $15M", match: "89% Match", logo: "B", color: "p-purple" }
            ],
            europe: [
                { name: "Balderton Capital", focus: "Mid-growth scaling European developers", ticket: "€4M - €12M", match: "87% Match", logo: "B", color: "p-cyan" }
            ],
            apac: [
                { name: "SoftBank Vision Seed-A", focus: "Massive-scale AI automation ecosystems", ticket: "$5M - $25M", match: "84% Match", logo: "S", color: "p-purple" }
            ]
        }
    };


    // ==========================================================================
    // DOM Element Queries
    // ==========================================================================
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const menuBtn = document.getElementById('menu-btn');
    const navLinks = document.getElementById('nav-links');
    
    // Idea Analyzer
    const ideaForm = document.getElementById('idea-form');
    const btnAnalyzeIdea = document.getElementById('btn-analyze-idea');
    const analysisEmpty = document.getElementById('analysis-empty');
    const analysisContent = document.getElementById('analysis-content');
    const feasibilityProgress = document.getElementById('feasibility-progress');
    const feasibilityScoreVal = document.getElementById('feasibility-score-val');
    const feasibilityBadge = document.getElementById('feasibility-badge');
    const analysisStartupTitle = document.getElementById('analysis-startup-title');
    const feasibilitySummary = document.getElementById('feasibility-summary');
    const strengthsList = document.getElementById('strengths-list');
    const weaknessesList = document.getElementById('weaknesses-list');
    const marketFitValue = document.getElementById('market-fit-value');
    const marketFitFill = document.getElementById('market-fit-fill');
    const analysisRec = document.getElementById('analysis-recommendation');

    // Dashboard
    const healthVal = document.getElementById('health-val');
    const riskVal = document.getElementById('risk-val');
    const oppVal = document.getElementById('opp-val');
    const fundingVal = document.getElementById('funding-val');
    const healthTrend = document.getElementById('health-trend');
    const riskTrend = document.getElementById('risk-trend');
    const oppTrend = document.getElementById('opp-trend');
    const fundingTrend = document.getElementById('funding-trend');
    const radarDataPoly = document.getElementById('radar-data-poly');
    const diagLegalRisk = document.getElementById('diag-legal-risk');
    const diagScalability = document.getElementById('diag-scalability');
    const diagFunding = document.getElementById('diag-funding');
    const diagMode = document.getElementById('diag-mode');
    
    // Competitor Discovery
    const competitorSearch = document.getElementById('competitor-search');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const competitorsList = document.getElementById('competitors-list');

    // Vulnerability Scanner
    const riskTabItems = document.querySelectorAll('.risk-tab-item');
    const riskDetailsPane = document.getElementById('risk-details-pane');

    // Investor Matcher
    const fundingStageSelect = document.getElementById('funding-stage');
    const matchingGeographySelect = document.getElementById('matching-geography');
    const btnRunInvestorMatch = document.getElementById('btn-run-investor-match');
    const investorsMatchList = document.getElementById('investors-match-list');
    const matchCountBadge = document.getElementById('match-count-badge');

    // Events Hub
    const eventFilters = document.querySelectorAll('.event-filter');
    const eventsListContainer = document.getElementById('events-list-container');

    // Pricing
    const billingCycleCheckbox = document.getElementById('billing-cycle-checkbox');
    const toggleLabelMonthly = document.getElementById('toggle-label-monthly');
    const toggleLabelYearly = document.getElementById('toggle-label-yearly');
    const pricePro = document.getElementById('price-pro');
    const priceEnterprise = document.getElementById('price-enterprise');
    const durationPro = document.getElementById('duration-pro');
    const durationEnterprise = document.getElementById('duration-enterprise');

    // Testimonials
    const carouselPrevBtn = document.getElementById('carousel-prev-btn');
    const carouselNextBtn = document.getElementById('carousel-next-btn');

    // FAQ Accordion
    const faqQuestions = document.querySelectorAll('.faq-question');

    // Newsletter & Export
    const btnSubscribe = document.getElementById('btn-subscribe');
    const btnExportPdf = document.getElementById('btn-export-pdf');
    const newsletterEmail = document.getElementById('newsletter-email');


    // ==========================================================================
    // Setup Theme & Nav handlers
    // ==========================================================================
    
    // Theme toggle
    themeToggleBtn.addEventListener('click', () => {
        if (document.body.classList.contains('light-theme')) {
            document.body.classList.remove('light-theme');
            AppState.theme = 'dark';
        } else {
            document.body.classList.add('light-theme');
            AppState.theme = 'light';
        }
    });

    // Mobile Navigation Menu Toggle
    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        navLinks.classList.toggle('mobile-active');
    });

    // Close mobile nav when link clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('active');
            navLinks.classList.remove('mobile-active');
        });
    });


    // ==========================================================================
    // Idea Analyzer & Performance Radar Calculations
    // ==========================================================================
    
    // Core Scoring Algorithmic Simulation
    function calculateStartupMetrics(industry, pitchText) {
        const pitchLen = pitchText.length;
        
        // Base Feasibility calculation utilizing simple string evaluations (length + keywords)
        let baseFeasibility = 62;
        if (pitchLen > 100) baseFeasibility += 10;
        if (pitchLen > 250) baseFeasibility += 8;
        
        // Keywords scan
        const highScoringKeywords = ['api', 'ai', 'platform', 'automation', 'margin', 'b2b', 'enterprise', 'saas', 'agent', 'blockchain'];
        highScoringKeywords.forEach(word => {
            if (pitchText.toLowerCase().includes(word)) {
                baseFeasibility += 2;
            }
        });
        
        // Clamp feasibility between 65 and 96
        baseFeasibility = Math.min(96, Math.max(65, baseFeasibility));
        
        // Risk Score
        let baseRisk = 100 - baseFeasibility + Math.floor(Math.random() * 10) - 5;
        baseRisk = Math.min(85, Math.max(15, baseRisk));

        // Market Opportunity
        let baseMarket = 70;
        if (industry === 'ai' || industry === 'fintech') baseMarket += 15;
        if (industry === 'saas' || industry === 'healthtech') baseMarket += 10;
        if (pitchLen > 180) baseMarket += 8;
        baseMarket = Math.min(98, Math.max(65, baseMarket));

        // Funding Readiness
        let baseFunding = baseFeasibility - 8 + Math.floor(Math.random() * 8);
        if (industry === 'cleantech') baseFunding += 4; // Gov subsidies increase initial readiness
        baseFunding = Math.min(95, Math.max(50, baseFunding));

        return {
            feasibility: baseFeasibility,
            health: Math.round((baseFeasibility + baseMarket + (100 - baseRisk)) / 3),
            risk: baseRisk,
            market: baseMarket,
            funding: baseFunding
        };
    }

    // Custom SVG Radar Drawing Engine
    function updateRadarChart(scores) {
        // Points mapped to standard 5 axes in SVG viewBox -120 -120 240 240
        // Axis points angles: -90°, -18°, 54°, 126°, 198°
        const angle1 = -Math.PI / 2;
        const angle2 = -18 * Math.PI / 180;
        const angle3 = 54 * Math.PI / 180;
        const angle4 = 126 * Math.PI / 180;
        const angle5 = 198 * Math.PI / 180;

        // Scores relative to maximum 100
        const r1 = scores.market;
        const r2 = scores.feasibility;
        const r3 = 100 - scores.risk; // Safety score represents axis 3
        const r4 = Math.round((scores.health + scores.funding) / 2); // Margin index represents axis 4
        const r5 = Math.round(scores.feasibility * 0.95); // Scalability potential represents axis 5

        // Calculate (x, y) coordinates
        const x1 = Math.round(r1 * Math.cos(angle1));
        const y1 = Math.round(r1 * Math.sin(angle1));
        
        const x2 = Math.round(r2 * Math.cos(angle2));
        const y2 = Math.round(r2 * Math.sin(angle2));
        
        const x3 = Math.round(r3 * Math.cos(angle3));
        const y3 = Math.round(r3 * Math.sin(angle3));
        
        const x4 = Math.round(r4 * Math.cos(angle4));
        const y4 = Math.round(r4 * Math.sin(angle4));
        
        const x5 = Math.round(r5 * Math.cos(angle5));
        const y5 = Math.round(r5 * Math.sin(angle5));

        // Set points attribute on the polygon
        const pointsString = `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4} ${x5},${y5}`;
        radarDataPoly.setAttribute('points', pointsString);
    }

    // Dynamic UI Updates of values
    function animateValueUpdate(element, start, end, duration, prefix = '', suffix = '') {
        let startTime = null;
        function animationStep(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const current = Math.floor(progress * (end - start) + start);
            element.textContent = `${prefix}${current}${suffix}`;
            if (progress < 1) {
                window.requestAnimationFrame(animationStep);
            }
        }
        window.requestAnimationFrame(animationStep);
    }

    function renderValidationResults(scores, industry, name) {
        // Show output card
        analysisEmpty.classList.add('hidden');
        analysisContent.classList.remove('hidden');

        // Set Title text
        analysisStartupTitle.textContent = name ? `${name} Analysis` : `${industry.toUpperCase()} Concept Screen`;

        // Update Feasibility radial progress ring
        feasibilityProgress.setAttribute('stroke-dasharray', `${scores.feasibility}, 100`);
        animateValueUpdate(feasibilityScoreVal, 0, scores.feasibility, 1200, '', '%');

        // Set Feasibility Badge Level
        if (scores.feasibility >= 85) {
            feasibilityBadge.textContent = 'Excellent';
            feasibilityBadge.className = 'badge badge-cyan';
            feasibilitySummary.textContent = 'Outstanding product architecture with high market penetration likelihood.';
        } else if (scores.feasibility >= 75) {
            feasibilityBadge.textContent = 'Strong';
            feasibilityBadge.className = 'badge badge-cyan';
            feasibilitySummary.textContent = 'Solid fundamentals. Addressing key weaknesses will yield strong competitive margins.';
        } else {
            feasibilityBadge.textContent = 'Fair';
            feasibilityBadge.className = 'badge badge-purple';
            feasibilitySummary.textContent = 'Viable side-project characteristics. Requires strategic pivots to unlock investor interest.';
        }

        // Populated SWOT arrays based on industry selections
        strengthsList.innerHTML = '';
        weaknessesList.innerHTML = '';
        
        let strengths = [];
        let weaknesses = [];
        let recText = '';
        
        switch (industry) {
            case 'saas':
                strengths = ["Recurring subscription stability (MRR)", "Zero distribution overhead costs"];
                weaknesses = ["Saturated marketing acquisition paths", "High developer salary requirements"];
                recText = "Adopt a product-led growth (PLG) onboarding model to minimize sales representative overhead. Target small developer teams using transparent API trial tiers.";
                break;
            case 'fintech':
                strengths = ["High customer retention lock-in", "Attractive transactional margin shares"];
                weaknesses = ["Complex regulatory sandbox audits", "Capital deposit buffer constraints"];
                recText = "Acquire regional banking partner rails to launch compliance infrastructure securely. Limit marketing capital until security nodes receive SOC2 verification.";
                break;
            case 'healthtech':
                strengths = ["Very large enterprise contract values", "Strong retention metrics"];
                weaknesses = ["Long enterprise sales pipelines (6-12mo)", "Strict HIPAA database configurations"];
                recText = "Forge testing partnerships with local academic labs. Run structured proof-of-concept trials to generate diagnostic verification proof metrics.";
                break;
            case 'cleantech':
                strengths = ["Attractive government grant packages", "Significant green ESG investor priorities"];
                weaknesses = ["Intense physical capital requirements", "Slow product development iterations"];
                recText = "Apply for regional non-dilutive clean infrastructure grants. Focus initially on battery middleware analytics rather than heavy custom hardware fabrication.";
                break;
            case 'ecommerce':
                strengths = ["Instant checkout validation cycles", "Direct ownership of customer brand data"];
                weaknesses = ["Fragile hardware product margins", "Complex multi-region supply logs"];
                recText = "Validate customer interest utilizing pre-order landing nodes. Utilize drop-shipping networks before scaling physical inventory warehouses.";
                break;
            case 'ai':
                strengths = ["Significant VC valuation multipliers", "Broad API automation applications"];
                weaknesses = ["High foundational model API billing", "Frequent platform update disruptions"];
                recText = "Build specialized agent orchestration pipelines targeting vertical workflows. Route calls to localized small models to bypass massive monthly tokens bills.";
                break;
        }

        strengths.forEach(s => {
            const li = document.createElement('li');
            li.textContent = s;
            strengthsList.appendChild(li);
        });

        weaknesses.forEach(w => {
            const li = document.createElement('li');
            li.textContent = w;
            weaknessesList.appendChild(li);
        });

        // Market Fit slider
        animateValueUpdate(marketFitValue, 0, scores.market, 1000, '', '%');
        marketFitFill.style.width = `${scores.market}%`;

        // Recommendation Text
        analysisRec.textContent = recText;

        // ==========================================
        // Sync & Animate Global Dashboard
        // ==========================================
        animateValueUpdate(healthVal, 0, scores.health, 1000);
        animateValueUpdate(oppVal, 0, scores.market, 1000);
        animateValueUpdate(fundingVal, 0, scores.funding, 1000, '', '%');
        animateValueUpdate(riskVal, 0, scores.risk, 1000, '', '%');

        healthTrend.textContent = '+3.2%';
        oppTrend.textContent = '+5.8%';
        fundingTrend.textContent = '+4.1%';
        riskTrend.textContent = '-2.5%';

        // Dynamic Sparklines
        document.getElementById('health-spark').setAttribute('d', `M0,${20 - scores.health*0.15} L20,10 L40,${25 - scores.feasibility*0.2} L60,8 L80,${18 - scores.funding*0.1} L100,5`);
        document.getElementById('risk-spark').setAttribute('d', `M0,15 L20,${10 + scores.risk*0.1} L40,5 L60,${scores.risk*0.2} L80,10 L100,${scores.risk*0.15}`);
        document.getElementById('opp-spark').setAttribute('d', `M0,10 L20,${22 - scores.market*0.2} L40,15 L60,${scores.market*0.1} L80,12 L100,3`);
        document.getElementById('funding-spark').setAttribute('d', `M0,18 L20,15 L40,${22 - scores.funding*0.2} L60,10 L80,5 L100,2`);

        // Radar chart update
        updateRadarChart(scores);

        // Sidebar Diagnostic details
        diagLegalRisk.textContent = scores.risk < 30 ? 'Low (' + scores.risk + '%)' : 'Medium (' + scores.risk + '%)';
        if (scores.risk < 30) {
            diagLegalRisk.className = 'diagnostic-val text-green';
        } else {
            diagLegalRisk.className = 'diagnostic-val text-orange';
        }

        diagScalability.textContent = scores.feasibility >= 80 ? 'High' : 'Moderate';
        diagScalability.className = scores.feasibility >= 80 ? 'diagnostic-val text-cyan' : 'diagnostic-val text-purple';

        diagFunding.textContent = scores.funding >= 80 ? 'Seed Tier' : 'Pre-Seed';
        diagFunding.className = scores.funding >= 80 ? 'diagnostic-val text-purple' : 'diagnostic-val';

        diagMode.textContent = scores.feasibility >= 85 ? 'Rapid Growth Scale' : 'Fast MVP Release';
    }

    // Form submission processing animation
    ideaForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('startup-name').value;
        const industry = document.getElementById('startup-industry').value;
        const pitch = document.getElementById('startup-pitch').value;

        // Set State
        AppState.startupName = name;
        AppState.industry = industry;
        AppState.pitch = pitch;

        // Button Loading State
        btnAnalyzeIdea.disabled = true;
        const btnText = btnAnalyzeIdea.querySelector('.btn-text');
        const spinner = btnAnalyzeIdea.querySelector('.spinner');
        
        btnText.textContent = "Scanning Concept Parameters...";
        spinner.classList.remove('hidden');

        // Scroll slightly down to make the scan feel visible
        const elementPosition = btnAnalyzeIdea.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
            top: elementPosition - 200,
            behavior: 'smooth'
        });

        // Simulate Neural Scan wait
        setTimeout(() => {
            // Restore button
            btnAnalyzeIdea.disabled = false;
            btnText.textContent = "Run AI Feasibility Scans";
            spinner.classList.add('hidden');

            // Process calculation
            const scores = calculateStartupMetrics(industry, pitch);
            AppState.feasibilityScore = scores.feasibility;
            AppState.healthScore = scores.health;
            AppState.riskScore = scores.risk;
            AppState.marketOpportunity = scores.market;
            AppState.fundingReadiness = scores.funding;

            // Render Output
            renderValidationResults(scores, industry, name);

            // Populate Relevant Competitors dynamically
            populateCompetitors(industry);

            // Show matched Investors
            runInvestorMatching(scores.funding);

        }, 1800);
    });


    // ==========================================================================
    // Competitor Discovery & Search Filters
    // ==========================================================================
    
    function populateCompetitors(industry = 'saas') {
        const comps = CompetitorsDB[industry] || CompetitorsDB['saas'];
        competitorsList.innerHTML = '';

        comps.forEach(c => {
            // Check filters
            if (AppState.activeCompFilter !== 'all' && c.type !== AppState.activeCompFilter) {
                return;
            }

            const card = document.createElement('div');
            card.className = 'glass-card competitor-card';
            
            const badgeClass = c.type === 'direct' ? 'comp-badge direct' : 'comp-badge indirect';
            const badgeLabel = c.type === 'direct' ? 'Direct' : 'Indirect';

            card.innerHTML = `
                <div class="${badgeClass}">${badgeLabel}</div>
                <div class="comp-header">
                    <h4>${c.name}</h4>
                    <span class="market-share">${c.share}</span>
                </div>
                <p class="comp-pitch">${c.pitch}</p>
                <div class="swot-mini">
                    <div class="swot-item s"><strong>Strength:</strong> ${c.strengths}</div>
                    <div class="swot-item w"><strong>Weakness:</strong> ${c.weaknesses}</div>
                </div>
                <div class="exploit-strategy">
                    <strong>Disruption strategy:</strong> ${c.strategy}
                </div>
            `;
            competitorsList.appendChild(card);
        });
    }

    // search bar filter
    competitorSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const cards = competitorsList.querySelectorAll('.competitor-card');
        
        cards.forEach(card => {
            const name = card.querySelector('h4').textContent.toLowerCase();
            const desc = card.querySelector('.comp-pitch').textContent.toLowerCase();
            
            if (name.includes(query) || desc.includes(query)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });

    // filter button toggles
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.activeCompFilter = btn.dataset.filter;
            populateCompetitors(AppState.industry || 'saas');
        });
    });


    // ==========================================================================
    // Vulnerability Scanner Tab Controller
    // ==========================================================================
    
    riskTabItems.forEach(tab => {
        tab.addEventListener('click', () => {
            riskTabItems.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const riskKey = tab.dataset.risk;
            AppState.activeRiskTab = riskKey;
            
            // Render detailed pane details
            const riskData = RisksDB[riskKey];
            
            riskDetailsPane.innerHTML = `
                <h3 class="accent-text" id="risk-active-title">${riskData.title}</h3>
                <p class="risk-details-desc" id="risk-active-desc">${riskData.desc}</p>
                
                <div class="risk-mitigation-box">
                    <h5>AI Recommended Mitigation Blueprint:</h5>
                    <ul class="mitigation-bullets" id="risk-active-bullets">
                        ${riskData.bullets.map(b => `<li>${b}</li>`).join('')}
                    </ul>
                </div>

                <div class="risk-sim-badge">
                    <span class="sim-pill ${riskData.level === 'High' || riskData.level === 'Critical' ? 'red' : 'orange'}" id="risk-active-impact">Impact: ${riskData.level}</span>
                    <span class="sim-pill blue" id="risk-active-action">${riskData.timeline}</span>
                </div>
            `;
        });
    });


    // ==========================================================================
    // Funding, Sponsors & Investor Matcher
    // ==========================================================================
    
    function runInvestorMatching(baseReadiness = 75) {
        const stage = fundingStageSelect.value;
        const geo = matchingGeographySelect.value;
        
        // Add latency representation to matching engine
        investorsMatchList.innerHTML = `
            <div style="text-align: center; padding: 40px 0; color: var(--text-secondary); width:100%;">
                <svg class="spinner" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle><path d="M4 12a8 8 0 0 1 8-8"></path></svg>
                <p style="margin-top: 10px; font-size:13px;">Sorting VC profiles...</p>
            </div>
        `;

        setTimeout(() => {
            const list = InvestorsDB[stage]?.[geo] || InvestorsDB['pre-seed']['global'];
            investorsMatchList.innerHTML = '';
            matchCountBadge.textContent = `${list.length} Sources`;

            list.forEach(inv => {
                const item = document.createElement('div');
                item.className = 'match-item glass-card';
                item.innerHTML = `
                    <div class="match-meta">
                        <span class="match-logo-placeholder ${inv.color}">${inv.logo}</span>
                        <div>
                            <h5>${inv.name}</h5>
                            <p class="match-subtitle">${inv.focus}</p>
                        </div>
                    </div>
                    <div class="match-details">
                        <span>Ticket: ${inv.ticket}</span>
                        <span class="match-badge">${inv.match}</span>
                    </div>
                `;
                investorsMatchList.appendChild(item);
            });
        }, 1000);
    }

    btnRunInvestorMatch.addEventListener('click', () => {
        runInvestorMatching(AppState.fundingReadiness || 75);
    });


    // ==========================================================================
    // Events Hub Filters
    // ==========================================================================
    
    eventFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            eventFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            
            const eventType = filter.dataset.type;
            AppState.activeEventFilter = eventType;
            
            const cards = eventsListContainer.querySelectorAll('.event-card');
            cards.forEach(card => {
                if (eventType === 'all' || card.dataset.eventType === eventType) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });


    // ==========================================================================
    // AI Mentor Chatbot
    // ==========================================================================
    
    const mentorChatForm = document.getElementById('mentor-chat-form');
    const mentorChatInput = document.getElementById('mentor-chat-input');
    const chatMessagesContainer = document.getElementById('chat-messages-container');

    // Make global helper so chip clicks can trigger it
    window.sendMentorMessage = function(text) {
        if (!text || text.trim() === '') return;

        // User Message bubble
        const userMsg = document.createElement('div');
        userMsg.className = 'chat-msg user';
        userMsg.innerHTML = `
            <div class="msg-bubble">${text}</div>
            <span class="msg-time">You • Just now</span>
        `;
        chatMessagesContainer.appendChild(userMsg);
        
        // Scroll message pane to bottom
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;

        // Mock typing bubble
        const typingBubble = document.createElement('div');
        typingBubble.className = 'chat-msg system typing-indicator-msg';
        typingBubble.innerHTML = `
            <div class="msg-bubble">
                <span class="spinner" style="display:inline-block; width:12px; height:12px; margin-right:6px; border: 2px solid currentColor; border-radius:50%; border-top-color:transparent;"></span>
                Thinking...
            </div>
        `;
        chatMessagesContainer.appendChild(typingBubble);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;

        // Generate response
        setTimeout(() => {
            // Remove typing indicator
            const indicator = chatMessagesContainer.querySelector('.typing-indicator-msg');
            if (indicator) chatMessagesContainer.removeChild(indicator);

            const reply = getAIResponse(text);

            const systemMsg = document.createElement('div');
            systemMsg.className = 'chat-msg system';
            systemMsg.innerHTML = `
                <div class="msg-bubble">${reply}</div>
                <span class="msg-time">Mentor AI • Just now</span>
            `;
            chatMessagesContainer.appendChild(systemMsg);
            chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        }, 1500);
    };

    function getAIResponse(query) {
        const text = query.toLowerCase();
        
        if (text.includes('funding') || text.includes('pitch') || text.includes('deck')) {
            return `
                Here is my recommended **Pre-Seed Pitch Checklist** to present to investors:
                <ol style="margin-left: 20px; padding: 10px 0; display:flex; flex-direction:column; gap:6px;">
                    <li><strong>Problem Statement:</strong> Frame it through a massive customer friction point you observed.</li>
                    <li><strong>Secret Sauce Solution:</strong> Don't explain lines of code; explain the core outcome reduction or speed multiplier.</li>
                    <li><strong>Market sizing (TAM):</strong> Keep it bottoms-up (e.g. users * subscription cost) rather than referencing a generic global industry report.</li>
                    <li><strong>Traction Indicators:</strong> Detail signups, letter of intent agreements, or early MVP testing results.</li>
                    <li><strong>The Ask:</strong> Be specific. 'Raising $500k to reach $15k MRR in 12 months with 2 engineers.'</li>
                </ol>
                Do you have a specific financial ask in mind?
            `;
        }

        if (text.includes('team') || text.includes('structure') || text.includes('hire') || text.includes('co-founder')) {
            return `
                Scaling team structures at pre-seed requires strict capital conservation:
                <ul style="margin-left: 20px; padding: 10px 0; display:flex; flex-direction:column; gap:6px;">
                    <li><strong>The 50/50 Rule:</strong> Seek alignment on equity splits with co-founders early to prevent future dilution disputes.</li>
                    <li><strong>Hiring priority:</strong> Prioritize generalist engineers who can manage both backend database configurations and simple landing pages.</li>
                    <li><strong>Equity Incentives:</strong> Utilize structured vesting schedules (e.g., 4-year vesting with a 1-year cliff) to align incentives.</li>
                </ul>
                Are you building as a solo developer or looking for a commercial co-founder?
            `;
        }

        if (text.includes('metrics') || text.includes('cac') || text.includes('ltv') || text.includes('margin')) {
            return `
                Key metrics that early angel investors scan for tech startups:
                <ul style="margin-left: 20px; padding: 10px 0; display:flex; flex-direction:column; gap:6px;">
                    <li><strong>LTV : CAC ratio:</strong> Target a ratio above 3:1 in your initial forecasts.</li>
                    <li><strong>Customer Churn:</strong> Keep monthly churn rates under 4-5% for SaaS models.</li>
                    <li><strong>Gross Margin:</strong> SaaS should ideally target >80%, while physical commerce lines should clear >40% after supply configurations.</li>
                </ul>
                What pricing model are you currently outlining for your concept?
            `;
        }

        if (text.includes('competitor') || text.includes('differentiation')) {
            return `
                To beat established market competitors, map your **Blue Ocean Strategy**:
                <ul style="margin-left: 20px; padding: 10px 0; display:flex; flex-direction:column; gap:6px;">
                    <li><strong>Simplify:</strong> Eliminate unnecessary features that clutter old systems to lower pricing.</li>
                    <li><strong>Speed:</strong> Offer 1-click cloud configurations while legacy competitors require complex professional installations.</li>
                    <li><strong>Niche Focus:</strong> Win a tiny localized sector completely rather than battling giants on general keywords.</li>
                </ul>
            `;
        }

        return `
            Good question. When launching a startup, the most important priority is **Fast Validation**. 
            Instead of spending months building code:
            <br><br>
            1. Deploy a high-fidelity glassmorphic landing page highlighting your solution.
            2. Purchase $100 in target Google or LinkedIn search ads.
            3. Measure actual signup conversion percentages. If >10% register, you have validated consumer demand.
            <br><br>
            What is the biggest operational hurdle you are facing with your idea right now?
        `;
    }

    mentorChatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = mentorChatInput.value;
        window.sendMentorMessage(text);
        mentorChatInput.value = '';
    });


    // ==========================================================================
    // Pricing Section Toggle & Calculation
    // ==========================================================================
    
    billingCycleCheckbox.addEventListener('change', () => {
        if (billingCycleCheckbox.checked) {
            // Yearly billing cycle (Apply 20% discount)
            AppState.billingCycle = 'yearly';
            toggleLabelYearly.classList.add('active');
            toggleLabelMonthly.classList.remove('active');
            
            // Animate price update
            animateValueUpdate(pricePro, 49, 39, 400);
            animateValueUpdate(priceEnterprise, 199, 159, 400);
            
            durationPro.textContent = '/mo (billed annually)';
            durationEnterprise.textContent = '/mo (billed annually)';
        } else {
            // Monthly billing cycle
            AppState.billingCycle = 'monthly';
            toggleLabelMonthly.classList.add('active');
            toggleLabelYearly.classList.remove('active');
            
            animateValueUpdate(pricePro, 39, 49, 400);
            animateValueUpdate(priceEnterprise, 159, 199, 400);
            
            durationPro.textContent = '/mo';
            durationEnterprise.textContent = '/mo';
        }
    });


    // ==========================================================================
    // Testimonials Carousel
    // ==========================================================================
    
    const slides = document.querySelectorAll('.testimonial-slide');
    
    function showTestimonialSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');
        AppState.activeTestimonialIdx = index;
    }

    carouselPrevBtn.addEventListener('click', () => {
        let prevIdx = AppState.activeTestimonialIdx - 1;
        if (prevIdx < 0) prevIdx = slides.length - 1;
        showTestimonialSlide(prevIdx);
    });

    carouselNextBtn.addEventListener('click', () => {
        let nextIdx = AppState.activeTestimonialIdx + 1;
        if (nextIdx >= slides.length) nextIdx = 0;
        showTestimonialSlide(nextIdx);
    });


    // ==========================================================================
    // FAQ Accordion Toggle
    // ==========================================================================
    
    faqQuestions.forEach(q => {
        q.addEventListener('click', () => {
            const faqItem = q.parentElement;
            const answer = faqItem.querySelector('.faq-answer');
            
            // Toggle active state
            const isActive = faqItem.classList.contains('active');
            
            // Close all items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.faq-answer').style.maxHeight = null;
            });
            
            if (!isActive) {
                faqItem.classList.add('active');
                // Set max-height dynamically based on content scroll height
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });


    // ==========================================================================
    // PDF Report Export & Newsletter Mock Responses
    // ==========================================================================
    
    // Create modern glowing toast notification
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = 'glass-card toast-notification';
        toast.style.position = 'fixed';
        toast.style.bottom = '32px';
        toast.style.right = '32px';
        toast.style.padding = '16px 28px';
        toast.style.borderRadius = 'var(--border-radius-sm)';
        toast.style.zIndex = '1000';
        toast.style.fontSize = '14.5px';
        toast.style.fontWeight = '500';
        toast.style.borderLeft = `4px solid ${type === 'success' ? 'var(--accent-cyan)' : 'var(--accent-red)'}`;
        toast.style.animation = 'fadeIn 0.3s ease-out';
        toast.style.background = 'rgba(5, 8, 20, 0.95)';
        toast.style.boxShadow = `0 10px 30px -10px ${type === 'success' ? 'var(--accent-cyan-glow)' : 'var(--accent-red-glow)'}`;
        
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeIn 0.3s ease-in reverse';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    btnExportPdf.addEventListener('click', () => {
        if (!AppState.industry) {
            showToast("Please analyze your startup idea first to generate report data.", "error");
            return;
        }

        btnExportPdf.disabled = true;
        btnExportPdf.textContent = "Compiling PDF...";

        setTimeout(() => {
            btnExportPdf.disabled = false;
            btnExportPdf.textContent = "Export Valuation Brief";
            showToast("Valuation Brief PDF report compiled successfully! Download started.");
            
            // Trigger browser printer utility formatted for page layout
            window.print();
        }, 1500);
    });

    btnSubscribe.addEventListener('click', () => {
        const email = newsletterEmail.value;
        if (!email || !email.includes('@')) {
            showToast("Please enter a valid email address.", "error");
            return;
        }

        btnSubscribe.disabled = true;
        btnSubscribe.textContent = "Subscribing...";

        setTimeout(() => {
            btnSubscribe.disabled = false;
            btnSubscribe.textContent = "Subscribe";
            newsletterEmail.value = '';
            showToast("Successfully subscribed! Funding alerts will arrive at " + email);
        }, 1000);
    });

    // Populate initial default states
    populateCompetitors('saas');
    updateRadarChart({ feasibility: 0, health: 0, risk: 0, market: 0, funding: 0 });
});
